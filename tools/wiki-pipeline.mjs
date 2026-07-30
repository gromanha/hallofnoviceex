import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import { logger } from './utils/logger.mjs'
import { scrapeWikiPage } from './wiki-scraper.mjs'
import { translateWikiPage } from './wiki-translator.mjs'
import { importWikiPage } from './wiki-importer.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

config({ path: path.join(__dirname, '..', '.env') })

const OUTPUT_DIR = path.join(__dirname, 'output')
const LOG_DIR = path.join(OUTPUT_DIR, 'logs')

const args = process.argv.slice(2)
const flags = {
  noImport: args.includes('--no-import'),
  noTranslate: args.includes('--no-translate'),
  verbose: args.includes('--verbose'),
  quiet: args.includes('--quiet'),
  rehost: args.includes('--rehost'),
  status: args.includes('--draft') ? 'draft' : 'published',
}

const url = args.find(a => a.startsWith('http'))
const importFile = args.includes('--import') ? args[args.indexOf('--import') + 1] : null
const batchFile = args.includes('--batch') ? args[args.indexOf('--batch') + 1] : null

async function runPipeline(targetUrl, options = {}) {
  const results = []
  let rawDataPath = null
  let dataToImport = null

  try {
    const slug = targetUrl.split('/wiki/')[1]?.toLowerCase().replace(/_/g, '-') || 'unknown'
    logger.initLogFile(LOG_DIR, slug)

    const rawData = await scrapeWikiPage(targetUrl)
    rawDataPath = path.join(OUTPUT_DIR, `${rawData.slug}-raw.json`)
    results.push({
      step: 'CAPTURA WIKI',
      success: true,
      message: `${rawData.title} — ${rawData.images.length} imagens, ${rawData.tables} tabelas`,
    })

    if (options.noTranslate) {
      dataToImport = rawData
      results.push({
        step: 'TRADUÇÃO PT-BR',
        success: true,
        skipped: true,
        message: 'Ignorado (--no-translate)',
      })
    } else {
      const translatedData = await translateWikiPage(rawDataPath)
      dataToImport = translatedData
      results.push({
        step: 'TRADUÇÃO PT-BR',
        success: true,
        message: `${translatedData.title} — ${(Buffer.byteLength(translatedData.content, 'utf8') / 1024).toFixed(1)}KB traduzidos`,
      })
    }

    if (!options.noImport) {
      const importResult = await importWikiPage(rawDataPath, dataToImport, {
        status: options.status || 'published',
        rehostImages: options.rehost || false,
      })
      results.push({
        step: 'IMPORTAÇÃO SUPABASE',
        success: true,
        message: `Post publicado: ${importResult.url}`,
      })
    } else {
      results.push({
        step: 'IMPORTAÇÃO SUPABASE',
        success: true,
        skipped: true,
        message: 'Ignorado (--no-import)',
      })
    }

  } catch (error) {
    const lastStep = results.length === 0 ? 'CAPTURA WIKI' :
                    results.length === 1 ? 'TRADUÇÃO PT-BR' : 'IMPORTAÇÃO SUPABASE'

    results.push({
      step: lastStep,
      success: false,
      error: error.message,
    })

    for (let i = results.length; i < 3; i++) {
      const stepName = i === 0 ? 'CAPTURA WIKI' : i === 1 ? 'TRADUÇÃO PT-BR' : 'IMPORTAÇÃO SUPABASE'
      results.push({
        step: stepName,
        success: false,
        skipped: true,
        message: 'Não executada (etapa anterior falhou)',
      })
    }
  }

  logger.summary(results)

  return {
    success: results.every(r => r.success || r.skipped),
    results,
  }
}

async function runBatch(batchPath) {
  const urls = fs.readFileSync(batchPath, 'utf8')
    .split('\n')
    .map(u => u.trim())
    .filter(u => u.startsWith('http'))

  console.log(`\nProcessando batch: ${urls.length} páginas\n`)

  const batchResults = []
  for (let i = 0; i < urls.length; i++) {
    console.log(`\n[${i + 1}/${urls.length}] ${urls[i]}`)
    const result = await runPipeline(urls[i], {
      noImport: flags.noImport,
      noTranslate: flags.noTranslate,
      rehost: flags.rehost,
      status: flags.status,
    })
    batchResults.push(result)

    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  const successCount = batchResults.filter(r => r.success).length
  console.log(`\nBatch concluído: ${successCount}/${urls.length} páginas processadas com sucesso`)
}

async function main() {
  if (batchFile) {
    await runBatch(batchFile)
  } else if (importFile) {
    await importWikiPage(importFile, null, {
      status: flags.status,
      rehostImages: flags.rehost,
    })
  } else if (url) {
    await runPipeline(url, {
      noImport: flags.noImport,
      noTranslate: flags.noTranslate,
      rehost: flags.rehost,
      status: flags.status,
    })
  } else {
    console.log(`
Uso:
  node tools/wiki-pipeline.mjs <url>                    # Pipeline completo
  node tools/wiki-pipeline.mjs <url> --no-translate     # Sem tradução (inglês)
  node tools/wiki-pipeline.mjs <url> --no-import        # Apenas scrape + traduz
  node tools/wiki-pipeline.mjs --import <arquivo.json>  # Apenas importar
  node tools/wiki-pipeline.mjs --batch <arquivo.txt>    # Batch de URLs

Flags:
  --no-translate Pular etapa de tradução (importa em inglês)
  --no-import    Pular etapa de importação
  --draft        Importar como draft (não publicado)
  --rehost       Re-hospedar imagens no Supabase Storage
  --verbose      Logs detalhados
  --quiet        Modo silencioso (apenas erros)
    `)
  }
}

main().catch(err => {
  logger.error('Erro fatal:', err.message)
  process.exit(1)
})
