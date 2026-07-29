#!/usr/bin/env node

/**
 * CLI Wiki Importer Local
 * 
 * Busca wiki (HTML parseado), traduz, enriquece com ícones e salva no Supabase
 * ou exporta JSON localmente.
 * 
 * Uso:
 *   node scripts/wiki-import.js <URL> [opções]
 * 
 * Exemplos:
 *   node scripts/wiki-import.js https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons
 *   node scripts/wiki-import.js https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons --draft --no-icons
 *   node scripts/wiki-import.js https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons --local-only
 */

import { createClient } from '@supabase/supabase-js';
import { translate } from '@vitalets/google-translate-api';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
}

// ============================================================
// Argument Parser
// ============================================================

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = {
    draft: false,
    noIcons: false,
    localOnly: false,
    category: null,
    tags: [],
    url: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--draft') {
      flags.draft = true;
    } else if (arg === '--no-icons') {
      flags.noIcons = true;
    } else if (arg === '--local-only') {
      flags.localOnly = true;
    } else if (arg === '--category' && args[i + 1]) {
      flags.category = args[++i];
    } else if (arg === '--tags' && args[i + 1]) {
      flags.tags = args[++i].split(',').map(t => t.trim());
    } else if (!arg.startsWith('--')) {
      flags.url = arg;
    }
  }

  return flags;
}

// ============================================================
// Wiki Fetcher (MediaWiki Parse API — HTML renderizado)
// ============================================================

const WIKI_API = 'https://ffxiv.consolegameswiki.com/mediawiki/api.php';
const WIKI_BASE = 'https://ffxiv.consolegameswiki.com';

function extractTitle(url) {
  const match = url.match(/\/wiki\/(.+?)(?:\?|$|#)/);
  if (!match) {
    throw new Error('URL inválida. Use: https://ffxiv.consolegameswiki.com/wiki/Page_Title');
  }
  return decodeURIComponent(match[1]);
}

async function fetchWikiHtml(url) {
  const title = extractTitle(url);
  console.log(`[wiki] Buscando página (HTML parseado): ${title}`);

  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'text',
    format: 'json',
    origin: '*',
  });

  const response = await fetch(`${WIKI_API}?${params}`, {
    headers: {
      'User-Agent': 'HallOfNovice-Importer/1.0 (local CLI)',
    },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Wiki API retornou ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Wiki API error: ${data.error.info || JSON.stringify(data.error)}`);
  }

  const html = data.parse?.text?.['*'];
  const pageTitle = data.parse?.title || title;

  if (!html) {
    throw new Error('HTML parseado vazio');
  }

  console.log(`[wiki] OK — ${html.length} caracteres de HTML renderizado`);
  return { title: pageTitle, html };
}

// ============================================================
// HTML Cleaner (corrigido — matching cliente ImportWikiModal)
// ============================================================

function cleanWikiHtml(html) {
  let cleaned = html;

  // Remove TOC — match the full TOC block including its parent wrapper
  cleaned = cleaned.replace(/<div[^>]*id="toc"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
  cleaned = cleaned.replace(/<div[^>]*class="toc"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, '');
  // Broader TOC removal — catch any remaining TOC structure
  cleaned = cleaned.replace(/<div[^>]*class="toc"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Remove scripts and styles
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<link[^>]*>/gi, '');

  // Remove edit section links (multiple patterns)
  cleaned = cleaned.replace(/<span class="mw-editsection">[\s\S]*?<\/span>/gi, '');
  cleaned = cleaned.replace(/<span class="mw-editsection"[^>]*>[\s\S]*?<\/span>/gi, '');

  // Remove navigation elements
  cleaned = cleaned.replace(/<div class="noprint">[\s\S]*?<\/div>/gi, '');

  // Remove hatnote boxes
  cleaned = cleaned.replace(/<div class="hatnote">[\s\S]*?<\/div>/gi, '');

  // Remove mw-jump links
  cleaned = cleaned.replace(/<a class="mw-jump-link"[^>]*>[\s\S]*?<\/a>/gi, '');

  // Remove content wrapper divs (but keep their children)
  cleaned = cleaned.replace(/<div id="mw-content-text"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<div class="mw-content-ltr mw-parser-output"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<div class="mw-parser-output">/gi, '');

  // Remove category links
  cleaned = cleaned.replace(/<div id="catlinks"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Remove print footer
  cleaned = cleaned.replace(/<div id="printfooter"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Remove indicator divs
  cleaned = cleaned.replace(/<div class="mw-indicators?">[\s\S]*?<\/div>/gi, '');

  // Fix heading wrappers: <div class="mw-heading mw-heading2"><h2>Text</h2></div> → <h2>Text</h2>
  cleaned = cleaned.replace(/<div class="mw-heading mw-heading(\d)"[^>]*>\s*<h\d[^>]*>([\s\S]*?)<\/h\d>\s*<\/div>/gi,
    (_, level, content) => `<h${level}>${content}</h${level}>`
  );

  // Remove data attributes (typeof, data-mw, data-parsoid, etc.)
  cleaned = cleaned.replace(/\s*typeof="mw:File"/gi, '');
  cleaned = cleaned.replace(/\s*typeof="mw:Extension[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s*data-mw[^=]*="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s*data-file-width="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s*data-file-height="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s*data-file-type="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\s*decoding="async"/gi, '');

  // Fix relative image URLs → absolute
  cleaned = cleaned.replace(/src="\/mediawiki\//g, `src="${WIKI_BASE}/mediawiki/`);
  cleaned = cleaned.replace(/src="\/\/upload\.wikimedia\.org/g, `src="https://upload.wikimedia.org`);

  // Fix relative link URLs → absolute
  cleaned = cleaned.replace(/href="\/wiki\//g, `href="${WIKI_BASE}/wiki/`);
  cleaned = cleaned.replace(/href="\/mediawiki\//g, `href="${WIKI_BASE}/mediawiki/`);

  // Fix srcset — make URLs absolute
  cleaned = cleaned.replace(/srcset="([^"]*?)"/g, (match, val) => {
    const fixed = val.replace(/\/mediawiki\//g, `${WIKI_BASE}/mediawiki/`);
    return `srcset="${fixed}"`;
  });

  // Remove empty span tags
  cleaned = cleaned.replace(/<span(?: [^>]*)?>(\s*)<\/span>/gi, '$1');

  // Remove empty div tags
  cleaned = cleaned.replace(/<div(?: [^>]*)?>(\s*)<\/div>/gi, '$1');

  // Fix center tags
  cleaned = cleaned.replace(/<center>/gi, '<div style="text-align:center">');
  cleaned = cleaned.replace(/<\/center>/gi, '</div>');

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/gi, '');

  // Clean up whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

// ============================================================
// Translation (EN → PT-BR) — HTML-preserving (Unicode PUA placeholders)
// ============================================================

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

async function translateHtmlPreserving(html, from = 'en', to = 'pt') {
  if (!html || typeof html !== 'string') return '';

  console.log(`[translate] Traduzindo ${html.length} caracteres de HTML...`);

  const { text, parts } = extractHtmlBlocks(html);
  const chunks = splitIntoChunks(text);

  console.log(`[translate] ${chunks.length} pedaços para traduzir`);

  const translatedChunks = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const res = await translate(chunk, { from, to });
      translatedChunks.push(res.text);
      console.log(`[translate] Pedaço ${i + 1}/${chunks.length} OK`);
    } catch (err) {
      console.error(`[translate] Falha no pedaço ${i + 1}:`, err.message);
      translatedChunks.push(chunk);
    }
  }

  const translated = translatedChunks.join(' ');
  return restoreHtmlParts(translated, parts);
}

// ============================================================
// Icon Enricher (XIVAPI) — HTML version
// ============================================================

const XIVAPI_BASE = 'https://v2.xivapi.com';
const MAX_TERMS = 20;
const DELAY_MS = 100;
const MIN_WORDS = 2;

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
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
    .filter(t => t.split(/\s+/).length >= MIN_WORDS)
    .slice(0, MAX_TERMS);
}

async function searchTerm(term) {
  try {
    // Search items
    const itemRes = await fetch(
      `${XIVAPI_BASE}/search?q=${encodeURIComponent(term)}&indexes=item&limit=1`,
      { signal: AbortSignal.timeout(10000) }
    );
    const itemData = await itemRes.json();
    const itemResults = itemData.Results || itemData.results || [];
    if (itemResults.length > 0) {
      const item = itemResults[0];
      const icon = item.Icon || item.icon;
      if (icon) {
        return { name: item.Name || item.name, icon, type: 'item' };
      }
    }

    // Search quests
    const questRes = await fetch(
      `${XIVAPI_BASE}/search?q=${encodeURIComponent(term)}&indexes=quest&limit=1`,
      { signal: AbortSignal.timeout(10000) }
    );
    const questData = await questRes.json();
    const questResults = questData.Results || questData.results || [];
    if (questResults.length > 0) {
      const quest = questResults[0];
      const icon = quest.Icon || quest.icon;
      if (icon) {
        return { name: quest.Name || quest.name, icon, type: 'quest' };
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function enrichWithIcons(htmlContent) {
  const terms = extractCandidateTermsFromHtml(htmlContent);

  if (terms.length === 0) {
    console.log('[icons] Nenhum termo candidato encontrado');
    return { content: htmlContent, found: 0, total: 0 };
  }

  console.log(`[icons] ${terms.length} termos para buscar`);

  const iconMap = new Map();
  let found = 0;

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const result = await searchTerm(term);

    if (result) {
      const iconUrl = result.icon.startsWith('http')
        ? result.icon
        : `${XIVAPI_BASE}${result.icon}`;
      iconMap.set(term, { name: result.name, iconUrl, type: result.type });
      found++;
      console.log(`[icons] ${i + 1}/${terms.length} ✓ ${term}`);
    } else {
      console.log(`[icons] ${i + 1}/${terms.length} ✗ ${term}`);
    }

    if (i < terms.length - 1) {
      await delay(DELAY_MS);
    }
  }

  // Add icon images before terms in HTML
  let enriched = htmlContent;
  const sortedTerms = [...iconMap.entries()].sort((a, b) => b[0].length - a[0].length);

  for (const [term, { iconUrl }] of sortedTerms) {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Insert icon image before the term text (in text nodes only)
    enriched = enriched.replace(
      new RegExp(`(?<!<[^>]*)\\b(${escapedTerm})\\b`, 'g'),
      `<img src="${iconUrl}" alt="${term}" width="20" height="20" style="vertical-align:middle;margin-right:4px;border:none;box-shadow:none;" /> $1`
    );
  }

  console.log(`[icons] ${found}/${terms.length} ícones encontrados`);
  return { content: enriched, found, total: terms.length };
}

// ============================================================
// Category Auto-Detection
// ============================================================

function detectCategory(url) {
  const lower = url.toLowerCase();
  if (/phantom_weapons|relics/.test(lower)) return 'guias';
  if (/quests/.test(lower)) return 'noticias';
  if (/crafting|cooking|items/.test(lower)) return 'receitas';
  if (/dungeons|raids|trials/.test(lower)) return 'noticias';
  return 'guias';
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================
// Metadata Extraction (HTML-aware)
// ============================================================

function extractMetadata(html, pageTitle) {
  let title = pageTitle;
  let subtitle = '';
  let cover_image = '';

  // Extract title from <h1>
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) title = h1Match[1].replace(/<[^>]+>/g, '').trim().slice(0, 200);

  // Extract subtitle from first <p> with substantial text
  const pMatches = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const p of pMatches) {
    const text = p.replace(/<[^>]+>/g, '').trim();
    if (text.length > 10) { subtitle = text.slice(0, 300); break; }
  }

  // Extract cover image from first <img>
  const imgMatch = html.match(/<img [^>]*src="([^"]+)"/i);
  cover_image = imgMatch ? imgMatch[1] : '';

  return { title, subtitle, cover_image };
}

// ============================================================
// Supabase Save
// ============================================================

async function saveToSupabase(post) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar no .env');
  }

  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title: post.title,
      slug: post.slug,
      subtitle: post.subtitle,
      content: post.content,
      category: post.category,
      cover_image: post.cover_image,
      tags: post.tags,
      is_pinned: post.is_pinned,
      status: post.status,
      published_at: post.published_at,
      source_url: post.source_url,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }

  return data;
}

// ============================================================
// Main
// ============================================================

async function main() {
  const flags = parseArgs(process.argv);

  if (!flags.url) {
    console.error('Uso: node scripts/wiki-import.js <URL> [opções]');
    console.error('');
    console.error('Opções:');
    console.error('  --draft         Salva como rascunho');
    console.error('  --no-icons      Pula enriquecimento de ícones');
    console.error('  --local-only    Exporta JSON, não salva no Supabase');
    console.error('  --category X    Categoria do post');
    console.error('  --tags "a,b"    Tags separadas por vírgula');
    process.exit(1);
  }

  console.log('=== Wiki Importer Local (HTML Parseado) ===');
  console.log(`URL: ${flags.url}`);
  console.log(`Draft: ${flags.draft}`);
  console.log(`Icons: ${!flags.noIcons}`);
  console.log(`Local Only: ${flags.localOnly}`);
  console.log('');

  try {
    // Step 1: Fetch wiki HTML (action=parse)
    const { title, html: rawHtml } = await fetchWikiHtml(flags.url);
    console.log('');

    // Step 2: Clean HTML
    console.log('[clean] Limpando HTML da wiki...');
    let cleanedHtml = cleanWikiHtml(rawHtml);
    console.log(`[clean] OK — ${cleanedHtml.length} caracteres`);
    console.log('');

    // Step 3: Translate (preserving HTML with Unicode PUA placeholders)
    cleanedHtml = await translateHtmlPreserving(cleanedHtml);
    console.log(`[translate] OK — ${cleanedHtml.length} caracteres após tradução`);
    console.log('');

    // Step 4: Enrich with icons
    if (!flags.noIcons) {
      const iconResult = await enrichWithIcons(cleanedHtml);
      cleanedHtml = iconResult.content;
      console.log('');
    }

    // Step 5: Extract metadata from cleaned HTML
    const { title: metaTitle, subtitle, cover_image } = extractMetadata(cleanedHtml, title);

    // Step 6: Build post object
    const category = flags.category || detectCategory(flags.url);
    const slug = generateSlug(title);

    const post = {
      title: metaTitle || title.replace(/_/g, ' '),
      slug,
      subtitle: subtitle || `Importado de ConsoleGamesWiki`,
      content: cleanedHtml,
      category,
      cover_image: cover_image || null,
      tags: flags.tags,
      is_pinned: false,
      status: flags.draft ? 'draft' : 'published',
      published_at: flags.draft ? null : new Date().toISOString(),
      source_url: flags.url,
    };

    // Step 7: Output
    if (flags.localOnly) {
      const outputPath = join(__dirname, '..', `${slug}.json`);
      writeFileSync(outputPath, JSON.stringify(post, null, 2), 'utf-8');
      console.log(`[export] JSON salvo em: ${outputPath}`);
    } else {
      console.log('[save] Salvando no Supabase...');
      const saved = await saveToSupabase(post);
      console.log(`[save] OK — ID: ${saved.id}`);
      console.log(`[save] Slug: ${saved.slug}`);
    }

    console.log('');
    console.log('=== Concluído! ===');
  } catch (err) {
    console.error('');
    console.error(`[ERRO] ${err.message}`);
    process.exit(1);
  }
}

main();
