export function cleanHtml(content, baseUrl) {
  const selectorsToRemove = [
    '.toc',
    '.mw-empty-elt',
    '.hatnote',
    '.noprint',
    '.mw-editsection',
    '.page-actions',
    '.page-header',
    '.footer',
    '.catlinks',
    '.printfooter',
    '.visualClear',
    'script',
    'style',
    '.ad-slot',
    '[data-fuse]',
    '.ad',
    '#siteNotice',
    '.suggestions',
    '.mw-portlet',
  ]

  for (const selector of selectorsToRemove) {
    content.querySelectorAll(selector).forEach(el => el.remove())
  }

  convertUrlsToAbsolute(content, baseUrl)
  addWikiTableClasses(content)
  processImages(content)

  return content.innerHTML
}

function convertUrlsToAbsolute(element, baseUrl) {
  element.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href')
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      a.setAttribute('href', baseUrl + href)
    }
  })

  element.querySelectorAll('img[src]').forEach(img => {
    const src = img.getAttribute('src')
    if (src && src.startsWith('/') && !src.startsWith('//')) {
      img.setAttribute('src', baseUrl + src)
    }
  })
}

function addWikiTableClasses(element) {
  element.querySelectorAll('table').forEach(table => {
    if (!table.classList.contains('wiki-table')) {
      table.classList.add('wiki-table')
    }
  })
}

function processImages(element) {
  element.querySelectorAll('img').forEach(img => {
    img.setAttribute('loading', 'lazy')

    const src = img.getAttribute('src')
    if (src && !img.closest('figure')) {
      const figure = document.createElement('figure')
      figure.className = 'wiki-image'
      img.parentNode.insertBefore(figure, img)
      figure.appendChild(img)
    }
  })
}

export function extractImages(html) {
  const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi
  const images = []
  let match

  while ((match = imageRegex.exec(html)) !== null) {
    const fullTag = match[0]
    const src = match[1]

    const altMatch = fullTag.match(/alt="([^"]*)"/i)
    const alt = altMatch ? altMatch[1] : ''

    const widthMatch = fullTag.match(/width="(\d+)"/i)
    const width = widthMatch ? parseInt(widthMatch[1]) : 0

    const heightMatch = fullTag.match(/height="(\d+)"/i)
    const height = heightMatch ? parseInt(heightMatch[1]) : 0

    images.push({ originalUrl: src, alt, width, height })
  }

  return images
}

export function extractTables(html) {
  const tableRegex = /<table[\s>]/gi
  let count = 0
  while (tableRegex.exec(html)) count++
  return count
}

export function extractInternalLinks(html, baseUrl) {
  const linkRegex = /<a[^>]+href="([^"]*)"[^>]*>/gi
  const internalLinks = []
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    if (href.startsWith('/wiki/') || href.startsWith(baseUrl + '/wiki/')) {
      internalLinks.push(href)
    }
  }

  return internalLinks
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function splitBySections(html) {
  const sections = []
  const sectionRegex = /<h2[^>]*>.*?<\/h2>/gi
  const parts = html.split(sectionRegex)

  if (parts.length <= 1) {
    return [html]
  }

  const h2Matches = html.match(sectionRegex) || []

  for (let i = 0; i < parts.length; i++) {
    if (parts[i].trim()) {
      sections.push(parts[i])
    }
    if (i < h2Matches.length) {
      sections.push(h2Matches[i])
    }
  }

  return sections.filter(s => s.trim())
}
