import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from './utils/logger.mjs'
import { checkSlugExists, createPost, uploadImage } from './utils/supabase-admin.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const APP_URL = process.env.APP_URL || 'http://localhost:3001'

export async function importWikiPage(translatedDataPath, options = {}) {
  const data = JSON.parse(fs.readFileSync(translatedDataPath, 'utf8'))

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

  if (options.rehostImages && data.images && data.images.length > 0) {
    logger.substep(`Re-hospedando imagens no Supabase Storage`)
    for (let i = 0; i < data.images.length; i++) {
      const img = data.images[i]
      logger.substep(`Upload de imagem ${i + 1}/${data.images.length}: ${img.alt || 'sem nome'}`)

      try {
        const response = await fetch(img.originalUrl)
        if (!response.ok) continue

        const buffer = Buffer.from(await response.arrayBuffer())
        const ext = path.extname(new URL(img.originalUrl).pathname) || '.png'
        const fileName = `${data.slug}-${i}${ext}`

        const contentType = response.headers.get('content-type') || 'image/png'
        const newUrl = await uploadImage(buffer, fileName, contentType)

        data.content = data.content.replaceAll(img.originalUrl, newUrl)

        if (i === 0 && !coverImage) {
          coverImage = newUrl
        }
      } catch (err) {
        logger.warn(`Falha ao re-hospedar imagem: ${err.message}`)
      }
    }
    logger.success('Todas as imagens uploadadas para Supabase Storage')
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
