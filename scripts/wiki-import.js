#!/usr/bin/env node

/**
 * CLI Wiki Importer Local
 * 
 * Busca wiki, traduz, enriquece com ícones e salva no Supabase
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
// Wiki Fetcher (MediaWiki Revisions API)
// ============================================================

const WIKI_API = 'https://ffxiv.consolegameswiki.com/mediawiki/api.php';

async function fetchWikiPage(url) {
  // Extract page title from URL
  const match = url.match(/\/wiki\/(.+?)(?:\?|$|#)/);
  if (!match) {
    throw new Error('URL inválida. Use: https://ffxiv.consolegameswiki.com/wiki/Page_Title');
  }

  const title = decodeURIComponent(match[1]);
  console.log(`[wiki] Buscando página: ${title}`);

  // Fetch raw wikitext via revisions API
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    format: 'json',
    formatversion: '2',
    rvlimit: '1',
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
  const pages = data.query?.pages || [];

  if (pages.length === 0 || pages[0].missing) {
    throw new Error(`Página não encontrada: ${title}`);
  }

  const page = pages[0];
  const content = page.revisions?.[0]?.slots?.main?.content || '';

  if (!content) {
    throw new Error('Conteúdo da página vazio');
  }

  console.log(`[wiki] OK — ${content.length} caracteres de wikitext`);
  return { title: page.title, content };
}

// ============================================================
// Wikitext → Markdown Converter (Improved)
// ============================================================

function wikitextToMarkdown(wikitext) {
  let md = wikitext;

  // Step 1: Remove complex templates {{...|...}} (multiline, nested)
  md = md.replace(/\{\{[^{}]*\}\}/g, '');
  md = md.replace(/\{\{[\s\S]*?\}\}/g, '');

  // Step 2: Remove HTML comments
  md = md.replace(/<!--[\s\S]*?-->/g, '');

  // Step 3: Remove ref tags
  md = md.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '');
  md = md.replace(/<ref[^>]*\/>/gi, '');
  md = md.replace(/<\/?references[^>]*>/gi, '');

  // Step 4: Convert images BEFORE links (to avoid conflicts)
  // [[File:Name.png|thumb|right|350px|Caption]] or [[File:Name.png|Caption]]
  md = md.replace(/\[\[File:([^|\]]+)(?:\|([^|\]]*))?(?:\|([^|\]]*))?(?:\|([^|\]]*))?\]\]/g, (_, file, opt1, opt2, opt3) => {
    // Find caption (last non-size, non-thumb/right/left/center option)
    const opts = [opt1, opt2, opt3].filter(Boolean);
    let caption = '';
    let width = '';
    for (const opt of opts) {
      if (/^\d+px$/.test(opt)) {
        width = opt;
      } else if (!/^(thumb|right|left|center|frameless|frame|border)$/i.test(opt)) {
        caption = opt;
      }
    }
    const url = `https://ffxiv.consolegameswiki.com/wiki/Special:Filepath/${file}`;
    const title = width ? ` title="${width}"` : '';
    return `![${caption}](${url}${title})`;
  });

  // Step 5: Convert internal links [[Page|Text]] or [[Page]]
  // Handle nested brackets and complex cases
  md = md.replace(/\[\[([^[\]]+)\|([^\]]+)\]\]/g, (_, page, text) => {
    // Clean up page name (remove any leftover wiki syntax)
    const cleanPage = page.replace(/\[\[|\]\]/g, '').trim();
    const cleanText = text.replace(/\[\[|\]\]/g, '').trim();
    return `[${cleanText}](/wiki/${encodeURIComponent(cleanPage)})`;
  });
  md = md.replace(/\[\[([^\]]+)\]\]/g, (_, page) => {
    const cleanPage = page.replace(/\[\[|\]\]/g, '').trim();
    return `[${cleanPage}](/wiki/${encodeURIComponent(cleanPage)})`;
  });

  // Step 6: Convert external links [http://url text] or [URL text]
  md = md.replace(/\[(https?:\/\/[^\s]+)\s+([^\]]+)\]/g, '[$2]($1)');
  md = md.replace(/\[(https?:\/\/[^\]]+)\]/g, '[$1]($1)');

  // Step 7: Convert headers: == Heading == → ## Heading
  md = md.replace(/^={6}\s*(.+?)\s*={6}$/gm, '###### $1');
  md = md.replace(/^={5}\s*(.+?)\s*={5}$/gm, '##### $1');
  md = md.replace(/^={4}\s*(.+?)\s*={4}$/gm, '#### $1');
  md = md.replace(/^={3}\s*(.+?)\s*={3}$/gm, '### $1');
  md = md.replace(/^={2}\s*(.+?)\s*={2}$/gm, '## $1');
  md = md.replace(/^={1}\s*(.+?)\s*={1}$/gm, '# $1');

  // Step 8: Convert bold and italic
  md = md.replace(/'{5}(.+?)'{5}/g, '***$1***');
  md = md.replace(/'{3}(.+?)'{3}/g, '**$1**');
  md = md.replace(/'{2}(.+?)'{2}/g, '*$1*');

  // Step 9: Convert wiki tables to markdown tables
  // {| class="wikitable" ... → start table
  md = md.replace(/\{\|[^}]*\}/g, '\n|---TABLE_START---|\n');
  // |} → end table
  md = md.replace(/\|\}/g, '\n|---TABLE_END---|\n');
  // |- → row separator
  md = md.replace(/^\|\-$/gm, '|---ROW---|');
  // ! Header → **Header**
  md = md.replace(/^!\s*(.+)$/gm, (_, text) => `**${text.trim()}**`);
  // | style="..." | content → content
  md = md.replace(/^\|\s*style="[^"]*"\s*\|\s*(.+)$/gm, '| $1');
  // |+ caption → caption
  md = md.replace(/^\|\+\s*(.+)$/gm, '\n**$1**\n');

  // Step 10: Convert ordered lists
  md = md.replace(/^#\s+(.+)$/gm, '1. $1');
  md = md.replace(/^##\s+(.+)$/gm, '   1. $1');

  // Step 11: Convert unordered lists
  md = md.replace(/^\*\s+(.+)$/gm, '- $1');
  md = md.replace(/^\*\*\s+(.+)$/gm, '  - $1');

  // Step 12: Remove category links
  md = md.replace(/\[\[Category:[^\]]*\]\]/g, '');

  // Step 13: Clean up HTML tags (keep basic ones)
  md = md.replace(/<centro>/gi, '<div style="text-align:center">');
  md = md.replace(/<\/centro>/gi, '</div>');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n');

  // Step 14: Clean up multiple blank lines
  md = md.replace(/\n{3,}/g, '\n\n');

  // Step 15: Trim
  md = md.trim();

  return md;
}

// ============================================================
// Translation (EN → PT-BR)
// ============================================================

function extractBlocks(text) {
  const blocks = [];
  let idx = 0;
  let result = text;

  // Preserve images
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'image' });
    return key;
  });

  // Preserve fenced code blocks
  result = result.replace(/(```[\s\S]*?```)/g, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'code' });
    return key;
  });

  // Preserve inline code
  result = result.replace(/(`[^`]+`)/g, (match) => {
    const key = `\u00A7\u00A7BLOCK_${idx++}\u00A7\u00A7`;
    blocks.push({ key, value: match, type: 'inline_code' });
    return key;
  });

  // Preserve tables
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

async function translateMarkdown(text, from = 'en', to = 'pt') {
  if (!text || typeof text !== 'string') return '';

  console.log(`[translate] Traduzindo ${text.length} caracteres...`);

  const { text: sanitized, blocks } = extractBlocks(text);
  const chunks = splitIntoChunks(sanitized);

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
  return restoreBlocks(translated, blocks);
}

// ============================================================
// Icon Enricher (XIVAPI)
// ============================================================

const XIVAPI_BASE = 'https://v2.xivapi.com';
const MAX_TERMS = 20;
const DELAY_MS = 100;

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function extractCandidateTerms(markdown) {
  const terms = new Set();
  const MIN_WORDS = 2;

  // Wiki links: [Term](/wiki/...)
  const wikiLinkRe = /\[([^\]]+)\]\(\/wiki\/[^)]+\)/g;
  let match;
  while ((match = wikiLinkRe.exec(markdown)) !== null) {
    terms.add(match[1].trim());
  }

  // Bracket notation: [[Term]]
  const bracketRe = /\[\[([^\]]+)\]\]/g;
  while ((match = bracketRe.exec(markdown)) !== null) {
    terms.add(match[1].trim());
  }

  // Compound capitalized words
  const compoundRe = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  while ((match = compoundRe.exec(markdown)) !== null) {
    terms.add(match[1].trim());
  }

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

async function enrichWithIcons(markdownContent) {
  const terms = extractCandidateTerms(markdownContent);

  if (terms.length === 0) {
    console.log('[icons] Nenhum termo candidato encontrado');
    return { content: markdownContent, found: 0, total: 0 };
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

  // Replace terms in markdown
  let enriched = markdownContent;
  const sortedTerms = [...iconMap.entries()].sort((a, b) => b[0].length - a[0].length);

  for (const [term, { iconUrl }] of sortedTerms) {
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    enriched = enriched.replace(
      new RegExp(`(?<!!\\[)\\b${escapedTerm}\\b`, 'g'),
      (match) => `![${match}](${iconUrl}) **${match}**`
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

  console.log('=== Wiki Importer Local ===');
  console.log(`URL: ${flags.url}`);
  console.log(`Draft: ${flags.draft}`);
  console.log(`Icons: ${!flags.noIcons}`);
  console.log(`Local Only: ${flags.localOnly}`);
  console.log('');

  try {
    // Step 1: Fetch wiki
    const { title, content: wikitext } = await fetchWikiPage(flags.url);
    console.log('');

    // Step 2: Convert to markdown
    console.log('[convert] Convertendo wikitext → markdown...');
    let markdown = wikitextToMarkdown(wikitext);
    console.log(`[convert] OK — ${markdown.length} caracteres`);
    console.log('');

    // Step 3: Translate
    markdown = await translateMarkdown(markdown);
    console.log(`[translate] OK — ${markdown.length} caracteres após tradução`);
    console.log('');

    // Step 4: Enrich with icons
    if (!flags.noIcons) {
      const iconResult = await enrichWithIcons(markdown);
      markdown = iconResult.content;
      console.log('');
    }

    // Step 5: Build post object
    const category = flags.category || detectCategory(flags.url);
    const slug = generateSlug(title);

    const post = {
      title: title.replace(/_/g, ' '),
      slug,
      subtitle: `Importado de ConsoleGamesWiki`,
      content: markdown,
      category,
      cover_image: null,
      tags: flags.tags,
      is_pinned: false,
      status: flags.draft ? 'draft' : 'published',
      published_at: flags.draft ? null : new Date().toISOString(),
      source_url: flags.url,
    };

    // Step 6: Output
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
