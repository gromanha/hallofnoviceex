import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from './utils/logger.mjs'
import { cleanHtml, extractImages, extractTables, extractInternalLinks, generateSlug } from './utils/html-helpers.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const WIKI_BASE_URL = 'https://ffxiv.consolegameswiki.com'
const OUTPUT_DIR = path.join(__dirname, 'output')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

export async function scrapeWikiPage(url) {
  const urlObj = new URL(url)
  const pageName = urlObj.pathname.split('/wiki/')[1] || 'unknown'
  const slug = generateSlug(pageName.replace(/_/g, ' '))

  logger.step(`CAPTURANDO WIKI: ${pageName.replace(/_/g, ' ')}`)
  logger.data('URL', url)
  logger.data('Slug', slug)

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage()

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    logger.substep(`Conectando a ${url}`)
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })

    if (!response || response.status() !== 200) {
      throw new Error(`HTTP ${response ? response.status() : 'sem resposta'}`)
    }

    logger.substep('Aguardando carregamento completo da página')
    await page.waitForSelector('div.mw-parser-output', { timeout: 10000 })

    await new Promise(resolve => setTimeout(resolve, 1000))

    logger.substep('Extraindo conteúdo principal')

    const data = await page.evaluate((baseUrl) => {
      const content = document.querySelector('div.mw-parser-output')
      if (!content) return null

      const titleEl = document.querySelector('h1.firstHeading .mw-page-title-main') ||
                      document.querySelector('h1.firstHeading') ||
                      document.querySelector('#firstHeading')
      const title = titleEl ? titleEl.textContent.trim() : 'Untitled'

      let subtitle = ''
      const firstParagraph = content.querySelector('p:not(.mw-empty-elt)')
      if (firstParagraph) {
        subtitle = firstParagraph.textContent.trim()
        if (subtitle.length > 300) {
          subtitle = subtitle.substring(0, 297) + '...'
        }
      }

      let coverImage = ''
      const firstFigure = content.querySelector('figure img, .thumb img, .image img')
      if (firstFigure) {
        coverImage = firstFigure.src
      }

      const selectorsToRemove = [
        '.toc', '.mw-empty-elt', '.hatnote', '.noprint',
        '.mw-editsection', '.page-actions', '.page-header',
        '.footer', '.catlinks', '.printfooter', '.visualClear',
        'script', 'style', '.ad-slot', '[data-fuse]',
        '.ad', '#siteNotice', '.suggestions', '.mw-portlet',
      ]

      for (const selector of selectorsToRemove) {
        content.querySelectorAll(selector).forEach(el => el.remove())
      }

      content.querySelectorAll('a[href]').forEach(a => {
        const href = a.getAttribute('href')
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          a.setAttribute('href', baseUrl + href)
        }
      })

      content.querySelectorAll('img[src]').forEach(img => {
        const src = img.getAttribute('src')
        if (src && src.startsWith('/') && !src.startsWith('//')) {
          img.setAttribute('src', baseUrl + src)
        }
        img.setAttribute('loading', 'lazy')
      })

      content.querySelectorAll('table').forEach(table => {
        if (!table.classList.contains('wiki-table')) {
          table.classList.add('wiki-table')
        }
      })

      const images = [...content.querySelectorAll('img')].map(img => ({
        originalUrl: img.src,
        alt: img.alt || '',
        width: img.width || 0,
        height: img.height || 0,
      }))

      const tables = content.querySelectorAll('table').length

      const internalLinks = [...content.querySelectorAll('a[href]')]
        .filter(a => a.href.includes('/wiki/'))
        .map(a => a.href)

      return {
        title,
        subtitle,
        coverImage,
        html: content.innerHTML,
        images,
        tables,
        internalLinks: internalLinks.length,
      }
    }, WIKI_BASE_URL)

    if (!data) {
      throw new Error('Conteúdo da wiki não encontrado (div.mw-parser-output)')
    }

    logger.success(`Título: ${data.title}`)
    logger.info(`Subtítulo: ${data.subtitle}`)
    logger.info(`Cover image: ${data.coverImage}`)
    logger.success(`Imagens encontradas: ${data.images.length}`)
    logger.success(`Tabelas encontradas: ${data.tables}`)
    logger.success(`Links internos: ${data.internalLinks}`)

    const htmlSize = Buffer.byteLength(data.html, 'utf8')
    logger.info(`Tamanho do HTML: ${(htmlSize / 1024).toFixed(1)}KB`)

    const result = {
      title: data.title,
      slug,
      subtitle: data.subtitle,
      content: data.html,
      cover_image: data.coverImage,
      images: data.images,
      source_url: url,
      category: 'guias',
      tags: [],
      scraped_at: new Date().toISOString(),
    }

    const outputPath = path.join(OUTPUT_DIR, `${slug}-raw.json`)
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))

    const totalSize = Buffer.byteLength(JSON.stringify(result), 'utf8')
    logger.success(`Salvo: ${outputPath} (${(totalSize / 1024).toFixed(1)}KB)`)

    return result

  } finally {
    await browser.close()
  }
}

if (process.argv[1] && process.argv[1].endsWith('wiki-scraper.mjs') && process.argv[2]) {
  const url = process.argv[2]
  scrapeWikiPage(url)
    .then(data => {
      console.log(`\nCaptura concluída: ${data.title}`)
    })
    .catch(err => {
      logger.error('Erro na captura:', err.message)
      process.exit(1)
    })
}
