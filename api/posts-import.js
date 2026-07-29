import translate from '@vitalets/google-translate-api';
import { requireAdmin } from './lib/auth.js';
import { getSupabaseAdmin } from './lib/supabase.js';
import { getWikiPage, searchItems, searchQuests } from './lib/ffxiv.js';

// ── Translation helpers (HTML-preserving) ──

function splitIntoChunks(text, maxLen = 4500) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = '';
  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > maxLen && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = current ? current + ' ' + sentence : sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function isHtmlContent(content) {
  const trimmed = content.trim();
  if (/^<(div|p|h[1-6]|table|ul|ol|blockquote|figure|span|img|pre|dl)\b/i.test(trimmed)) return true;
  const tagCount = (trimmed.match(/<\/?[a-z][\s\S]*?>/gi) || []).length;
  return tagCount >= 3;
}

// Use Unicode Private Use Area characters as placeholders — Google Translate won't modify them
const PH_START = '\uE000';
const PH_END = '\uE001';

function extractHtmlBlocks(html) {
  const parts = [];
  let idx = 0;
  let result = html;

  // Protect <table> blocks (do first — they contain nested tags)
  result = result.replace(/<table[\s\S]*?<\/table>/gi, (match) => {
    const key = `${PH_START}T${idx++}${PH_END}`;
    parts.push({ key, value: match });
    return key;
  });

  // Protect <figure> blocks (images with captions)
  result = result.replace(/<figure[\s\S]*?<\/figure>/gi, (match) => {
    const key = `${PH_START}F${idx++}${PH_END}`;
    parts.push({ key, value: match });
    return key;
  });

  // Protect <blockquote> blocks
  result = result.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, (match) => {
    const key = `${PH_START}Q${idx++}${PH_END}`;
    parts.push({ key, value: match });
    return key;
  });

  // Protect <pre> blocks
  result = result.replace(/<pre[\s\S]*?<\/pre>/gi, (match) => {
    const key = `${PH_START}P${idx++}${PH_END}`;
    parts.push({ key, value: match });
    return key;
  });

  // Protect <h1>-<h6> tags
  result = result.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, (match) => {
    const key = `${PH_START}H${idx++}${PH_END}`;
    parts.push({ key, value: match });
    return key;
  });

  // Protect <img> tags
  result = result.replace(/<img[^>]*>/gi, (match) => {
    const key = `${PH_START}I${idx++}${PH_END}`;
    parts.push({ key, value: match });
    return key;
  });

  // Protect <a> tags (links)
  result = result.replace(/<a [^>]*>[\s\S]*?<\/a>/gi, (match) => {
    const key = `${PH_START}A${idx++}${PH_END}`;
    parts.push({ key, value: match });
    return key;
  });

  // Protect <code> blocks
  result = result.replace(/<code[\s\S]*?<\/code>/gi, (match) => {
    const key = `${PH_START}C${idx++}${PH_END}`;
    parts.push({ key, value: match });
    return key;
  });

  // Protect <span class="icon-label-container"> blocks
  result = result.replace(/<span class="icon-label-container[^"]*">[\s\S]*?<\/span>/gi, (match) => {
    const key = `${PH_START}S${idx++}${PH_END}`;
    parts.push({ key, value: match });
    return key;
  });

  return { text: result, parts };
}

function restoreHtmlParts(text, parts) {
  let result = text;
  for (const part of parts) {
    result = result.replace(part.key, part.value);
  }
  return result;
}

async function translateHtmlPreserving(html, from = 'en', to = 'pt') {
  if (!html || typeof html !== 'string') return '';
  const { text, parts } = extractHtmlBlocks(html);
  const chunks = splitIntoChunks(text);
  const translatedChunks = [];
  for (const chunk of chunks) {
    try {
      const res = await translate(chunk, { from, to });
      translatedChunks.push(res.text);
    } catch (err) {
      console.error('[translate] Chunk failed:', err.message);
      translatedChunks.push(chunk);
    }
  }
  return restoreHtmlParts(translatedChunks.join(' '), parts);
}

// ── Legacy markdown translation (kept for fallback) ──

function extractBlocks(text) {
  const blocks = [];
  let idx = 0;
  let result = text;
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'image' });
    return key;
  });
  result = result.replace(/(```[\s\S]*?```)/g, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'code' });
    return key;
  });
  result = result.replace(/(`[^`]+`)/g, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'inline_code' });
    return key;
  });
  result = result.replace(/^(\|.+\|[ ]*\n)+/gm, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'table' });
    return key;
  });
  return { text: result, blocks };
}

function restoreBlocks(text, blocks) {
  let result = text;
  for (const block of blocks) {
    result = result.replace(block.key, block.value);
  }
  return result;
}

async function translateMarkdown(text, from = 'en', to = 'pt') {
  if (!text || typeof text !== 'string') return '';
  const { text: sanitized, blocks } = extractBlocks(text);
  const chunks = splitIntoChunks(sanitized);
  const translatedChunks = [];
  for (const chunk of chunks) {
    try {
      const res = await translate(chunk, { from, to });
      translatedChunks.push(res.text);
    } catch (err) {
      console.error('[translate] Chunk failed:', err.message);
      translatedChunks.push(chunk);
    }
  }
  return restoreBlocks(translatedChunks.join(' '), blocks);
}

// ── Icon enrichment helpers (HTML-aware) ──

const MAX_TERMS = 20;
const DELAY_MS = 100;
const MIN_WORDS = 2;

async function searchTerm(term) {
  try {
    const [itemRes, questRes] = await Promise.all([
      searchItems(term, 1).catch(() => null),
      searchQuests(term, 1).catch(() => null),
    ]);
    const itemResults = itemRes?.Results || itemRes?.results || [];
    if (itemResults.length > 0) {
      const item = itemResults[0];
      const icon = item.Icon || item.icon;
      if (icon) return { name: item.Name || item.name, icon, type: 'item' };
    }
    const questResults = questRes?.Results || questRes?.results || [];
    if (questResults.length > 0) {
      const quest = questResults[0];
      const icon = quest.Icon || quest.icon;
      if (icon) return { name: quest.Name || quest.name, icon, type: 'quest' };
    }
    return null;
  } catch {
    return null;
  }
}

function extractCandidateTermsFromHtml(html) {
  const terms = new Set();
  let match;

  // Extract link text: <a href="/wiki/...">Term</a> or <a href="https://...wiki...">Term</a>
  const wikiLinkRe = /<a [^>]*href="[^"]*(?:\/wiki\/|consolegameswiki\.com\/wiki\/)[^"]*"[^>]*>([^<]+)<\/a>/gi;
  while ((match = wikiLinkRe.exec(html)) !== null) terms.add(match[1].trim());

  // Compound capitalized words in text (strip tags first)
  const textContent = html.replace(/<[^>]+>/g, ' ');
  const compoundRe = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  while ((match = compoundRe.exec(textContent)) !== null) terms.add(match[1].trim());

  return [...terms]
    .filter((t) => t.split(/\s+/).length >= MIN_WORDS)
    .slice(0, MAX_TERMS);
}

function extractCandidateTermsFromMarkdown(markdown) {
  const terms = new Set();
  let match;
  const re1 = /\[([^\]]+)\]\(\/wiki\/[^)]+\)/g;
  while ((match = re1.exec(markdown)) !== null) terms.add(match[1].trim());
  const re2 = /\[\[([^\]]+)\]\]/g;
  while ((match = re2.exec(markdown)) !== null) terms.add(match[1].trim());
  const re3 = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  while ((match = re3.exec(markdown)) !== null) terms.add(match[1].trim());
  return [...terms]
    .filter((t) => t.split(/\s+/).length >= MIN_WORDS)
    .slice(0, MAX_TERMS);
}

async function enrichWithIconsHtml(htmlContent) {
  const terms = extractCandidateTermsFromHtml(htmlContent);
  if (terms.length === 0) return { content: htmlContent, found: 0, total: 0 };

  const iconMap = new Map();
  let found = 0;
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const result = await searchTerm(term);
    if (result) {
      const iconUrl = result.icon.startsWith('http') ? result.icon : `https://v2.xivapi.com${result.icon}`;
      iconMap.set(term, { name: result.name, iconUrl, type: result.type });
      found++;
    }
    if (i < terms.length - 1) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  let enriched = htmlContent;
  const sortedTerms = [...iconMap.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [term, { iconUrl }] of sortedTerms) {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Insert icon before term text in HTML (only in text nodes, not inside tags)
    enriched = enriched.replace(
      new RegExp(`(?<!<[^>]*)\\b(${escapedTerm})\\b`, 'g'),
      `<img src="${iconUrl}" alt="${term}" width="20" height="20" style="vertical-align:middle;margin-right:4px;border:none;box-shadow:none;" /> $1`
    );
  }
  return { content: enriched, found, total: terms.length };
}

async function enrichWithIconsMarkdown(markdownContent) {
  const terms = extractCandidateTermsFromMarkdown(markdownContent);
  if (terms.length === 0) return { content: markdownContent, found: 0, total: 0 };

  const iconMap = new Map();
  let found = 0;
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const result = await searchTerm(term);
    if (result) {
      const iconUrl = result.icon.startsWith('http') ? result.icon : `https://v2.xivapi.com${result.icon}`;
      iconMap.set(term, { name: result.name, iconUrl, type: result.type });
      found++;
    }
    if (i < terms.length - 1) await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  let enriched = markdownContent;
  const sortedTerms = [...iconMap.entries()].sort((a, b) => b[0].length - a[0].length);
  for (const [term, { iconUrl }] of sortedTerms) {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    enriched = enriched.replace(
      new RegExp(`(?<!!\\[)\\b${escapedTerm}\\b`, 'g'),
      (match) => `![${match}](${iconUrl}) **${match}**`
    );
  }
  return { content: enriched, found, total: terms.length };
}

// ── Helpers ──

const WIKI_URL_RE = /^https:\/\/ffxiv\.consolegameswiki\.com\/wiki\/(.+)$/;
const MAX_STR_LEN = 500;

function clampStr(v, max = MAX_STR_LEN) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

const WIKI_CATEGORY_MAP = {
  phantom_weapons: 'guias', relics: 'guias', quests: 'noticias',
  items: 'receitas', crafting: 'receitas', cooking: 'receitas',
  dungeons: 'noticias', raids: 'noticias', trials: 'noticias',
};

function detectCategoryFromUrl(path) {
  const lower = path.toLowerCase();
  for (const [pattern, category] of Object.entries(WIKI_CATEGORY_MAP)) {
    if (lower.includes(pattern)) return category;
  }
  return 'noticias';
}

// ── Rate limiting ──

const rateMap = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000;

function checkRate(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// ── Vercel handler ──

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Auth
  const claims = requireAdmin(req);
  if (!claims) {
    return res.status(401).json({ error: 'unauthenticated' });
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRate(ip)) {
    return res.status(429).json({ error: 'import_rate_limit', message: 'Max 5 imports per hour' });
  }

  const { url, rawContent: clientContent, pageTitle: clientTitle, category, tags = [], status = 'published', enrichIcons = true } = req.body || {};

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url_required' });
  }

  const urlMatch = url.trim().match(WIKI_URL_RE);
  if (!urlMatch) {
    return res.status(400).json({ error: 'invalid_wiki_url', message: 'URL must be from ffxiv.consolegameswiki.com/wiki/' });
  }

  const wikiTitle = decodeURIComponent(urlMatch[1]).replace(/_/g, ' ');
  const steps = [];
  const ts = Date.now();

  function addStep(id, label, stepStatus, detail) {
    steps.push({ id, label, status: stepStatus, detail: detail || null, ts: Date.now() - ts });
  }

  try {
    // 1. Wiki content (provided by client — server can't reach ConsoleGamesWiki from Vercel IPs)
    addStep('wiki_fetch', 'Buscando página na Wiki', 'running');

    let rawContent = clientContent || '';
    let pageTitle = clientTitle || wikiTitle;

    // Fallback: try server-side fetch if client didn't provide content
    if (!rawContent.trim()) {
      try {
        const wikiData = await getWikiPage(wikiTitle);
        const pages = wikiData?.query?.pages || {};
        const page = Object.values(pages)[0];
        if (page && page.missing === undefined) {
          const wikitext = page.revisions?.[0]?.slots?.main?.['*'] || '';
          pageTitle = page.title || wikiTitle;
          if (wikitext) {
            rawContent = wikitext
              .replace(/\{\{[^}]*\|([^}]*)\}\}/g, (_, inner) => inner.split('|')[0] || '')
              .replace(/\{\{[^}]+\}\}/g, '')
              .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
              .replace(/\[\[([^\]]+)\]\]/g, '$1')
              .replace(/'{3}(.+?)'{3}/g, '**$1**')
              .replace(/'{2}(.+?)'{2}/g, '*$1*')
              .replace(/<ref[^>]*>.*?<\/ref>/g, '')
              .replace(/<ref[^>]*\/>/g, '')
              .replace(/<[^>]+>/g, '')
              .trim();
          }
        }
      } catch {
        // Ignore — will fail on empty check below
      }
    }

    if (!rawContent.trim()) {
      addStep('wiki_fetch', 'Buscando página na Wiki', 'error', clientContent ? 'Conteúdo vazio recebido do cliente' : `Página não encontrada: ${wikiTitle}`);
      return res.status(400).json({ error: 'wiki_page_empty', steps });
    }

    addStep('wiki_fetch', 'Buscando página na Wiki', 'success', `Obtido: "${pageTitle}" (${rawContent.length} caracteres)`);

    // 2. Translate (auto-detect HTML vs markdown)
    addStep('translate', 'Traduzindo para PT-BR', 'running');
    const contentIsHtml = isHtmlContent(rawContent);
    let translated;
    try {
      if (contentIsHtml) {
        translated = await translateHtmlPreserving(rawContent, 'en', 'pt');
      } else {
        translated = await translateMarkdown(rawContent, 'en', 'pt');
      }
      addStep('translate', 'Traduzindo para PT-BR', 'success', `${translated.length} caracteres traduzidos`);
    } catch (err) {
      addStep('translate', 'Traduzindo para PT-BR', 'error', err.message);
      return res.status(500).json({ error: 'import_failed', steps });
    }

    // 3. Enrich with icons
    let enriched = translated;
    let iconStats = { found: 0, total: 0 };

    if (enrichIcons) {
      addStep('enrich', 'Buscando ícones na XIVAPI', 'running');
      try {
        const result = contentIsHtml
          ? await enrichWithIconsHtml(translated)
          : await enrichWithIconsMarkdown(translated);
        enriched = result.content;
        iconStats = { found: result.found, total: result.total };
        const detail = result.total > 0 ? `${result.found}/${result.total} termos encontrados` : 'Nenhum termo encontrado na XIVAPI';
        addStep('enrich', 'Buscando ícones na XIVAPI', 'success', detail);
      } catch (err) {
        addStep('enrich', 'Buscando ícones na XIVAPI', 'error', err.message);
      }
    } else {
      addStep('enrich', 'Buscando ícones na XIVAPI', 'skip', 'Desabilitado pelo usuário');
    }

    // 4. Metadata (HTML-aware)
    addStep('metadata', 'Extraindo metadados', 'running');
    let title = pageTitle;
    let subtitle = '';
    let cover_image = '';

    if (contentIsHtml) {
      // Extract title from <h1>
      const h1Match = enriched.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) title = h1Match[1].replace(/<[^>]+>/g, '').trim().slice(0, 200);

      // Extract subtitle from first <p> with substantial text
      const pMatches = enriched.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
      for (const p of pMatches) {
        const text = p.replace(/<[^>]+>/g, '').trim();
        if (text.length > 10) { subtitle = text.slice(0, 300); break; }
      }

      // Extract cover image from first <img>
      const imgMatch = enriched.match(/<img [^>]*src="([^"]+)"/i);
      cover_image = imgMatch ? imgMatch[1] : '';
    } else {
      // Legacy markdown extraction
      const lines = translated.split('\n').filter((l) => l.trim());
      for (const line of lines) {
        const h1 = line.match(/^#\s+(.+)/);
        if (h1) { title = h1[1].trim().slice(0, 200); break; }
      }
      subtitle = lines.find((l) => !l.startsWith('#') && l.trim().length > 10)?.trim().slice(0, 300) || '';
      const imgMatch = enriched.match(/!\[.*?\]\((.*?)\)/);
      cover_image = imgMatch ? imgMatch[1] : '';
    }

    const detectedCategory = category || detectCategoryFromUrl(urlMatch[1]);
    addStep('metadata', 'Extraindo metadados', 'success', `Título: "${title}" | Categoria: ${detectedCategory}`);

    // 5. Slug
    addStep('slug', 'Gerando slug', 'running');
    let slug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (!slug) slug = `import-${Date.now()}`;

    const { data: existing } = await getSupabaseAdmin().from('posts').select('id').eq('slug', slug).maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
    addStep('slug', 'Gerando slug', 'success', `Slug: ${slug}`);

    // 6. Save
    addStep('save', 'Salvando no Supabase', 'running');
    const payload = {
      title: clampStr(title, 200),
      slug,
      subtitle: clampStr(subtitle, 500),
      content: enriched,
      category: clampStr(detectedCategory, 50),
      author_name: claims.name || 'Corpo Docente',
      author_id: claims.sub,
      cover_image: clampStr(cover_image, 500),
      tags: Array.isArray(tags) ? tags : [],
      is_pinned: false,
      status: status === 'draft' ? 'draft' : 'published',
      published_at: new Date().toISOString(),
    };

    const { data, error } = await getSupabaseAdmin().from('posts').insert(payload).select().single();
    if (error) throw error;

    addStep('save', 'Salvando no Supabase', 'success', `Post criado com ID: ${data.id}`);

    return res.json({
      post: data,
      meta: { wikiTitle: pageTitle, iconStats, translated: true },
      steps,
    });
  } catch (err) {
    console.error('[wiki-import] error', err);
    addStep('error', 'Erro inesperado', 'error', err.message);
    return res.status(500).json({ error: 'import_failed', message: err.message, steps });
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: '1mb' },
  },
};
