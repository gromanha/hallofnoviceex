import { logger } from './logger.mjs'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const MS_TRANSLATOR_URL = 'https://api.cognitive.microsofttranslator.com/translate'

class MicrosoftTranslatorClient {
  constructor(apiKey, region = 'global') {
    this.apiKey = apiKey
    this.region = region
  }

  async translateText(text, fromLang = 'en', toLang = 'pt') {
    const response = await fetch(
      `${MS_TRANSLATOR_URL}?api-version=3.0&from=${fromLang}&to=${toLang}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Ocp-Apim-Subscription-Region': this.region,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ Text: text }]),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Microsoft Translator erro ${response.status}: ${error}`)
    }

    const data = await response.json()
    return data[0].translations[0].text
  }

  async translateHtml(html) {
    const chunks = this._splitHtmlIntoChunks(html)
    const translatedChunks = []

    for (const chunk of chunks) {
      if (chunk.type === 'tag') {
        translatedChunks.push(chunk.content)
      } else {
        const translated = await this.translateText(chunk.content)
        translatedChunks.push(translated)
      }
    }

    return translatedChunks.join('')
  }

  _splitHtmlIntoChunks(html) {
    const chunks = []
    const tagRegex = /(<[^>]+>)/gi
    let lastIndex = 0
    let match

    while ((match = tagRegex.exec(html)) !== null) {
      if (match.index > lastIndex) {
        const text = html.slice(lastIndex, match.index)
        if (text.trim()) {
          chunks.push({ type: 'text', content: text })
        }
      }
      chunks.push({ type: 'tag', content: match[1] })
      lastIndex = tagRegex.lastIndex
    }

    if (lastIndex < html.length) {
      const text = html.slice(lastIndex)
      if (text.trim()) {
        chunks.push({ type: 'text', content: text })
      }
    }

    return chunks
  }
}

export class GeminiClient {
  constructor(apiKey, msApiKey = null, msRegion = 'global') {
    this.apiKey = apiKey
    this.msClient = (msApiKey && msApiKey.trim()) ? new MicrosoftTranslatorClient(msApiKey, msRegion) : null
    this.maxRetries = this.msClient ? 1 : 3
    this.retryDelay = 60000
  }

  async translateText(text, fromLang = 'en', toLang = 'pt-BR') {
    const prompt = `Traduza o seguinte texto para Português do Brasil (PT-BR).

REGRAS:
- Traduza TODO o texto para PT-BR
- NÃO traduza nomes de: itens, habilidades, NPCs, locais, achievements, nomes próprios de FFXIV
- Para termos técnicos do jogo, use o formato: "Nome em PT-BR (Nome Original)"
- Seja natural na tradução, não literal

Texto:
${text}

Retorne APENAS o texto traduzido, sem explicações adicionais.`

    try {
      return await this._callGeminiAPI(prompt)
    } catch (geminiError) {
      if (this.msClient) {
        logger.warn(`Gemini falhou (${geminiError.message.split('\n')[0]}), tentando Microsoft Translator...`)
        return await this._callMicrosoftTranslator(text)
      }
      throw geminiError
    }
  }

  async translateHtml(html) {
    const prompt = `Traduza o seguinte conteúdo HTML de uma wiki de Final Fantasy XIV para Português do Brasil (PT-BR).

REGRAS:
- Traduza TODO o texto visível para PT-BR
- NÃO traduza nomes de: itens, habilidades, NPCs, locais, achievements, nomes próprios de FFXIV
- Preservar PERFEITAMENTE todas as tags HTML, classes CSS, e atributos
- Preservar todas as URLs (src, href) inalteradas
- Preservar todos os ícones inline (<span class="icon-label-container">)
- Preservar a formatação de tabelas
- Para termos técnicos do jogo, use o formato: "Nome em PT-BR (Nome Original)"
- Seja natural na tradução, não literal

Conteúdo HTML:
${html}

Retorne APENAS o HTML traduzido, sem explicações adicionais.`

    try {
      return await this._callGeminiAPI(prompt)
    } catch (geminiError) {
      if (this.msClient) {
        logger.warn(`Gemini falhou (${geminiError.message.split('\n')[0]}), tentando Microsoft Translator...`)
        return await this.msClient.translateHtml(html)
      }
      throw geminiError
    }
  }

  async _callMicrosoftTranslator(text) {
    const msToLang = 'pt'
    return await this.msClient.translateText(text, 'en', msToLang)
  }

  async _callGeminiAPI(prompt, retries = 0) {
    try {
      const response = await fetch(
        `${GEMINI_API_URL}?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 65536,
            },
          }),
        }
      )

      if (response.status === 429) {
        if (retries < this.maxRetries) {
          logger.warn(`Rate limit atingido. Retry em ${this.retryDelay / 1000}s (tentativa ${retries + 1}/${this.maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, this.retryDelay))
          return await this._callGeminiAPI(prompt, retries + 1)
        }
        throw new Error('Rate limit atingido após múltiplas tentativas')
      }

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Gemini API erro ${response.status}: ${errorData}`)
      }

      const data = await response.json()

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Resposta da API veio vazia')
      }

      const text = data.candidates[0].content.parts[0].text

      const cleaned = text
        .replace(/^```html\n?/i, '')
        .replace(/^```\n?/i, '')
        .replace(/\n?```$/i, '')
        .trim()

      return cleaned

    } catch (error) {
      if (error.message.includes('Gemini API erro') || error.message.includes('Resposta da API')) {
        throw error
      }
      if (retries < this.maxRetries && error.message.includes('fetch')) {
        logger.warn(`Erro de conexão. Retry em 5s (tentativa ${retries + 1}/${this.maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 5000))
        return await this._callGeminiAPI(prompt, retries + 1)
      }
      throw error
    }
  }
}

export function createGeminiClient(apiKey, msApiKey = null, msRegion = 'global') {
  return new GeminiClient(apiKey, msApiKey, msRegion)
}
