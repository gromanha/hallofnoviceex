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
]

// Custom renderer for marked
const renderer = new marked.Renderer()

// Improve table rendering
renderer.table = function({ header, rows }: { header: any[]; rows: any[][] }) {
  let html = '<div class="wiki-table-wrapper"><table>'
  
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
  return `<figure class="wiki-image"><img src="${href}" alt="${alt}"${titleAttr} loading="lazy" onerror="this.style.display='none'" />${alt ? `<figcaption>${alt}</figcaption>` : ''}</figure>`
}

// Configure marked options
marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
})

export function renderMarkdown(content: string): string {
  // Pre-process: fix common wiki artifacts
  let processed = content
  
  // Fix broken image syntax from wiki conversion
  processed = processed.replace(/\[([^\]]*\.png)\)/g, '![]($1)')
  processed = processed.replace(/\[([^\]]*\.jpg)\)/g, '![]($1)')
  processed = processed.replace(/\[([^\]]*\.gif)\)/g, '![]($1)')
  
  // Fix table syntax that might not have been converted
  // Convert simple pipe tables to proper markdown tables
  const lines = processed.split('\n')
  const tableLines: string[] = []
  let inTable = false
  const result: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Detect table start (line with pipes at start and end)
    if (line.trim().startsWith('|') && line.trim().endsWith('|') && !line.includes('---TABLE')) {
      if (!inTable) {
        inTable = true
        tableLines.length = 0
      }
      tableLines.push(line)
    } else if (inTable) {
      // Process accumulated table lines
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
  
  // Handle table at end of content
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
  
  // Filter out separator lines and process content
  const contentLines = lines.filter(line => {
    const trimmed = line.trim()
    return trimmed && !trimmed.match(/^\|[\s\-:]+\|$/)
  })
  
  if (contentLines.length === 0) return ''
  
  // First line is header
  const header = contentLines[0]
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => `**${cell.trim()}**`)
    .join(' | ')
  
  const result = [header]
  
  // Add separator
  result.push(header.replace(/\*\*/g, '').replace(/[^|]/g, '-'))
  
  // Add data rows
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
