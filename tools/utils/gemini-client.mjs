import { logger } from './logger.mjs'

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export class GeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey
    this.maxRetries = 3
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

    const response = await this._callAPI(prompt)
    return response.trim()
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

    return await this._callAPI(prompt)
  }

  async _callAPI(prompt, retries = 0) {
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
          return await this._callAPI(prompt, retries + 1)
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
      if (retries < this.maxRetries && error.message.includes('fetch')) {
        logger.warn(`Erro de conexão. Retry em 5s (tentativa ${retries + 1}/${this.maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 5000))
        return await this._callAPI(prompt, retries + 1)
      }
      throw error
    }
  }
}

export function createGeminiClient(apiKey) {
  return new GeminiClient(apiKey)
}
