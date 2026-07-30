import { marked } from 'marked'
import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'strong', 'em', 'u', 's', 'del', 'ins', 'mark', 'small', 'sub', 'sup',
  'a', 'img',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'div', 'span',
  'dl', 'dt', 'dd',
  'figure', 'figcaption',
]

const ALLOWED_ATTRS = [
  'href', 'src', 'alt', 'title', 'className', 'class',
  'colspan', 'rowspan', 'scope', 'width', 'height',
  'style', 'align', 'valign',
  'id', 'name',
  'loading', 'onerror',
  'srcset', 'typeof',
]

// Custom renderer for marked
const renderer = new marked.Renderer()

// Improve table rendering
renderer.table = function({ header, rows }: { header: any[]; rows: any[][] }) {
  let html = '<div class="wiki-table-wrapper"><table class="wiki-table">'
  
  if (header && header.length > 0) {
    html += '<thead><tr>'
    for (const cell of header) {
      const align = cell.align ? ` style="text-align:${cell.align}"` : ''
      html += `<th${align}>${cell.text}</th>`
    }
    html += '</tr></thead>'
  }
  
  if (rows && rows.length > 0) {
    html += '<tbody>'
    for (const row of rows) {
      html += '<tr>'
      for (const cell of row) {
        const align = cell.align ? ` style="text-align:${cell.align}"` : ''
        html += `<td${align}>${cell.text}</td>`
      }
      html += '</tr>'
    }
    html += '</tbody>'
  }
  
  html += '</table></div>'
  return html
}

// Improve image rendering with lazy loading and error handling
renderer.image = function({ href, title, text }: { href: string; title: string | null; text: string }) {
  const titleAttr = title ? ` title="${title}"` : ''
  const alt = text || ''
  return `<figure class="wiki-image"><img src="${href}" alt="${alt}"${titleAttr} loading="lazy" crossorigin="anonymous" />${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`
}

// Configure marked options
marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
})

function isHtmlContent(content: string): boolean {
  const trimmed = content.trim()
  // If it starts with a known HTML tag, treat as HTML
  if (/^<(div|p|h[1-6]|table|ul|ol|blockquote|figure|span|img|pre|dl)\b/i.test(trimmed)) {
    return true
  }
  // If it contains multiple HTML tags, treat as HTML
  const tagCount = (trimmed.match(/<\/?[a-z][\s\S]*?>/gi) || []).length
  if (tagCount >= 3) return true
  return false
}

/**
 * Sanitize and render content — detects HTML vs markdown automatically.
 * HTML content is sanitized directly with DOMPurify.
 * Markdown content goes through marked.parse() first.
 */
export function renderMarkdown(content: string): string {
  if (!content || typeof content !== 'string') return ''

  // Detect if content is already HTML (from wiki import)
  if (isHtmlContent(content)) {
    return renderHtml(content)
  }

  return renderMarkdownText(content)
}

/**
 * Render raw HTML content from wiki — sanitize only, no markdown parsing.
 */
function renderHtml(html: string): string {
  // Pre-process: fix common wiki artifacts
  let processed = html

  // Fix relative URLs that might have slipped through
  processed = processed.replace(/src="\/mediawiki\//g, 'src="https://ffxiv.consolegameswiki.com/mediawiki/')
  processed = processed.replace(/href="\/wiki\//g, 'href="https://ffxiv.consolegameswiki.com/wiki/')
  
  // Fix srcset with relative URLs
  processed = processed.replace(/srcset="\/mediawiki\//g, 'srcset="https://ffxiv.consolegameswiki.com/mediawiki/')
  
  // Remove srcset to avoid CORS issues and use src only
  processed = processed.replace(/ srcset="[^"]*"/g, '')
  
  // Fix data-file-width/data-file-height attributes that might cause issues
  processed = processed.replace(/data-file-width="/g, 'data-wiki-width="')
  processed = processed.replace(/data-file-height="/g, 'data-wiki-height="')
  
  // Remove onerror handlers that hide content
  processed = processed.replace(/ onerror="[^"]*"/g, '')
  
  // Remove ad/tracking images (primis, doubleclick, etc.)
  processed = processed.replace(/<img[^>]+src="https?:\/\/[^"]*(?:primis|doubleclick|googleads|googlesyndication|facebook|analytics)[^"]*"[^>]*>*/gi, '')

  // Sanitize with DOMPurify — allow wiki-specific tags and attributes
  const sanitized = DOMPurify.sanitize(processed, {
    ALLOWED_TAGS: [
      ...ALLOWED_TAGS,
      'section', 'article', 'header', 'footer', 'nav', 'aside',
    ],
    ALLOWED_ATTR: [
      ...ALLOWED_ATTRS,
      'srcset', 'typeof', 'data-mw', 'data-parsoid',
    ],
    ALLOW_DATA_ATTR: false,
  })

  return sanitized
}

/**
 * Render markdown text through marked + DOMPurify.
 */
function renderMarkdownText(content: string): string {
  // Pre-process: fix common wiki artifacts
  let processed = content
  
  // Fix broken image syntax from wiki conversion
  processed = processed.replace(/\[([^\]]*\.png)\)/g, '![]($1)')
  processed = processed.replace(/\[([^\]]*\.jpg)\)/g, '![]($1)')
  processed = processed.replace(/\[([^\]]*\.gif)\)/g, '![]($1)')
  
  // Fix table syntax that might not have been converted
  const lines = processed.split('\n')
  const tableLines: string[] = []
  let inTable = false
  const result: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    if (line.trim().startsWith('|') && line.trim().endsWith('|') && !line.includes('---TABLE')) {
      if (!inTable) {
        inTable = true
        tableLines.length = 0
      }
      tableLines.push(line)
    } else if (inTable) {
      if (tableLines.length > 0) {
        result.push(processTableLines(tableLines))
      }
      inTable = false
      tableLines.length = 0
      result.push(line)
    } else {
      result.push(line)
    }
  }
  
  if (inTable && tableLines.length > 0) {
    result.push(processTableLines(tableLines))
  }
  
  processed = result.join('\n')
  
  // Parse markdown
  const raw = marked.parse(processed, { async: false }) as string
  
  // Post-process: clean up and enhance
  let html = raw
  
  // Add wiki-table class to tables
  html = html.replace(/<table>/g, '<table class="wiki-table">')
  
  // Wrap images in figure tags if not already wrapped
  html = html.replace(/<img ([^>]+)>/g, '<figure class="wiki-image"><img $1 loading="lazy" /></figure>')
  
  // Sanitize
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
  })
}

function processTableLines(lines: string[]): string {
  if (lines.length < 2) return lines.join('\n')
  
  const contentLines = lines.filter(line => {
    const trimmed = line.trim()
    return trimmed && !trimmed.match(/^\|[\s\-:]+\|$/)
  })
  
  if (contentLines.length === 0) return ''
  
  const header = contentLines[0]
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => `**${cell.trim()}**`)
    .join(' | ')
  
  const result = [header]
  result.push(header.replace(/\*\*/g, '').replace(/[^|]/g, '-'))
  
  for (let i = 1; i < contentLines.length; i++) {
    const row = contentLines[i]
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map(cell => cell.trim())
      .join(' | ')
    result.push(row)
  }
  
  return result.join('\n')
}
