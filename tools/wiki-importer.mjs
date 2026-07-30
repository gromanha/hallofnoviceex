import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from './utils/logger.mjs'
import { checkSlugExists, createPost, uploadImage } from './utils/supabase-admin.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const APP_URL = process.env.APP_URL || 'http://localhost:3001'

function generateImageFileName(originalUrl, index) {
  try {
    const urlObj = new URL(originalUrl)
    const pathname = urlObj.pathname
    const ext = path.extname(pathname) || '.png'
    const baseName = path.basename(pathname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 50)
    return `wiki/${baseName}-${index}${ext}`
  } catch {
    return `wiki/image-${index}.png`
  }
}

export async function importWikiPage(dataPathOrData, directData = null, options = {}) {
  const data = directData || JSON.parse(fs.readFileSync(dataPathOrData, 'utf8'))

  logger.step(`IMPORTANDO: ${data.title} → Supabase`)
  logger.data('Título', data.title)
  logger.data('Slug', data.slug)
  logger.data('Categoria', data.category || 'guias')

  logger.substep(`Conectando ao Supabase`)

  logger.substep(`Verificando se slug '${data.slug}' já existe`)
  const slugExists = await checkSlugExists(data.slug)

  let finalSlug = data.slug
  if (slugExists) {
    logger.warn(`Slug '${data.slug}' já existe — será adicionado sufixo`)
    finalSlug = `${data.slug}-${Date.now()}`
    logger.info(`Novo slug: ${finalSlug}`)
  } else {
    logger.info(`Slug '${data.slug}' disponível`)
  }

  let coverImage = data.cover_image || ''

  // Extract unique image URLs from content
  const imgRegex = /<img[^>]+src="([^"]+)"/g
  const imageUrls = new Set()
  let match
  while ((match = imgRegex.exec(data.content)) !== null) {
    const url = match[1]
    if (url.startsWith('http') && !url.includes('primis') && !url.includes('doubleclick')) {
      imageUrls.add(url)
    }
  }

  const uniqueImages = [...imageUrls]
  logger.substep(`Encontradas ${uniqueImages.length} imagens únicas para download`)

  // Always rehost images since wiki blocks hotlinking
  if (uniqueImages.length > 0) {
    logger.substep(`Baixando e hospedando imagens no Supabase Storage`)
    
    const urlMap = new Map()
    let uploadedCount = 0
    let failedCount = 0

    for (let i = 0; i < uniqueImages.length; i++) {
      const originalUrl = uniqueImages[i]
      const shortUrl = originalUrl.split('/').pop()?.substring(0, 40) || originalUrl
      logger.progress(i + 1, uniqueImages.length, shortUrl)

      try {
        // Download image with proper headers
        const response = await fetch(originalUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://ffxiv.consolegameswiki.com/',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
          },
        })

        if (!response.ok) {
          failedCount++
          continue
        }

        const contentType = response.headers.get('content-type') || 'image/png'
        
        // Skip non-image content types
        if (!contentType.startsWith('image/')) {
          failedCount++
          continue
        }

        const buffer = Buffer.from(await response.arrayBuffer())
        
        // Skip very small files (likely tracking pixels)
        if (buffer.length < 100) {
          failedCount++
          continue
        }

        const fileName = generateImageFileName(originalUrl, i)
        const newUrl = await uploadImage(buffer, fileName, contentType)
        
        urlMap.set(originalUrl, newUrl)
        uploadedCount++

        if (i === 0 && !coverImage) {
          coverImage = newUrl
        }
      } catch (err) {
        failedCount++
      }
    }

    // Replace all image URLs in content
    for (const [originalUrl, newUrl] of urlMap) {
      data.content = data.content.replaceAll(originalUrl, newUrl)
    }

    // Also replace cover image URL if it was rehosted
    if (coverImage && urlMap.has(data.cover_image)) {
      coverImage = urlMap.get(data.cover_image)
    }

    logger.success(`Imagens: ${uploadedCount} uploadadas, ${failedCount} falharam`)
  }

  const postPayload = {
    title: data.title,
    subtitle: data.subtitle,
    content: data.content,
    category: data.category || 'guias',
    author_name: 'Corpo Docente',
    cover_image: coverImage,
    tags: data.tags && data.tags.length > 0 ? data.tags : ['ffxiv', 'wiki'],
    is_pinned: false,
    status: options.status || 'published',
    slug: finalSlug,
  }

  logger.substep('Inserindo post na tabela posts')
  const post = await createPost(postPayload)

  logger.success(`Post criado com UUID: ${post.id}`)
  logger.success(`URL: ${APP_URL}/post/${finalSlug}`)
  logger.success(`Status: ${postPayload.status}`)
  logger.success(`Categoria: ${postPayload.category}`)

  return {
    success: true,
    slug: finalSlug,
    uuid: post.id,
    url: `${APP_URL}/post/${finalSlug}`,
    status: postPayload.status,
  }
}

if (process.argv[1] && process.argv[1].endsWith('wiki-importer.mjs') && process.argv[2]) {
  const translatedDataPath = process.argv[2]
  importWikiPage(translatedDataPath)
    .then(result => {
      console.log(`\nImportação concluída: ${result.url}`)
    })
    .catch(err => {
      logger.error('Erro na importação:', err.message)
      process.exit(1)
    })
}
