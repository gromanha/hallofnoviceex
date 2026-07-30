import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from './utils/logger.mjs'
import { createGeminiClient } from './utils/gemini-client.mjs'
import { splitBySections } from './utils/html-helpers.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const OUTPUT_DIR = path.join(__dirname, 'output')

export async function translateWikiPage(rawDataPath) {
  const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'))

  logger.step(`TRADUZINDO: ${rawData.title}`)
  logger.data('Título original', rawData.title)
  logger.data('Tamanho HTML', `${(Buffer.byteLength(rawData.content, 'utf8') / 1024).toFixed(1)}KB`)

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada no .env')
  }

  const gemini = createGeminiClient(apiKey)

  logger.substep('Conectando à Gemini API')

  logger.substep('Traduzindo título e subtítulo')
  const titlePtBr = await gemini.translateText(rawData.title)
  const subtitlePtBr = await gemini.translateText(rawData.subtitle)
  logger.success(`Título PT-BR: ${titlePtBr}`)
  logger.success(`Subtítulo PT-BR: ${subtitlePtBr}`)

  logger.substep('Traduzindo conteúdo principal')
  const htmlSize = Buffer.byteLength(rawData.content, 'utf8')

  let translatedHtml
  if (htmlSize > 50000) {
    logger.info('Conteúdo longo detectado, dividindo por seções...')
    translatedHtml = await translateInSections(rawData.content, gemini)
  } else {
    translatedHtml = await gemini.translateHtml(rawData.content)
  }

  const translatedSize = Buffer.byteLength(translatedHtml, 'utf8')
  const sizeDiff = ((translatedSize - htmlSize) / htmlSize * 100).toFixed(1)
  logger.success(`HTML traduzido: ${(translatedSize / 1024).toFixed(1)}KB (+${sizeDiff}%)`)

  const originalImages = (rawData.content.match(/<img[^>]+>/gi) || []).length
  const translatedImages = (translatedHtml.match(/<img[^>]+>/gi) || []).length
  logger.success(`Imagens preservadas: ${translatedImages}/${originalImages}`)

  const originalTables = (rawData.content.match(/<table[\s>]/gi) || []).length
  const translatedTables = (translatedHtml.match(/<table[\s>]/gi) || []).length
  logger.success(`Tabelas preservadas: ${translatedTables}/${originalTables}`)

  const originalLinks = (rawData.content.match(/<a[^>]+>/gi) || []).length
  const translatedLinks = (translatedHtml.match(/<a[^>]+>/gi) || []).length
  logger.success(`Links preservados: ${translatedLinks}/${originalLinks}`)

  const translatedData = {
    ...rawData,
    title: titlePtBr,
    subtitle: subtitlePtBr,
    content: translatedHtml,
    translated: true,
    translated_at: new Date().toISOString(),
  }

  const outputPath = path.join(OUTPUT_DIR, `${rawData.slug}-translated.json`)
  fs.writeFileSync(outputPath, JSON.stringify(translatedData, null, 2))

  const totalSize = Buffer.byteLength(JSON.stringify(translatedData), 'utf8')
  logger.success(`Salvo: ${outputPath} (${(totalSize / 1024).toFixed(1)}KB)`)

  return translatedData
}

async function translateInSections(html, gemini) {
  const sections = splitBySections(html)
  logger.info(`Dividido em ${sections.length} seções`)

  const translatedSections = []
  for (let i = 0; i < sections.length; i++) {
    logger.substep(`Traduzindo seção ${i + 1}/${sections.length}`)
    const translated = await gemini.translateHtml(sections[i])
    translatedSections.push(translated)

    if (i < sections.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return translatedSections.join('\n')
}

if (process.argv[1] && process.argv[1].endsWith('wiki-translator.mjs') && process.argv[2]) {
  const rawDataPath = process.argv[2]
  translateWikiPage(rawDataPath)
    .then(data => {
      console.log(`\nTradução concluída: ${data.title}`)
    })
    .catch(err => {
      logger.error('Erro na tradução:', err.message)
      process.exit(1)
    })
}
