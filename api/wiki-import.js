import { getSupabaseAdmin } from '../src/lib/supabase.js';
import { requireAdmin } from '../src/lib/auth.js';
import * as cheerio from 'cheerio';

const WIKI_BASE_URL = 'https://ffxiv.consolegameswiki.com';
const ALLOWED_DOMAINS = ['ffxiv.consolegameswiki.com'];
const MAX_HTML_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const REQUEST_TIMEOUT = 30000;

const rateLimitMap = new Map();

function checkRateLimit(adminId) {
  const now = Date.now();
  const last = rateLimitMap.get(adminId) || 0;
  if (now - last < 60000) return false;
  rateLimitMap.set(adminId, now);
  return true;
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function extractContent($, multilinks) {
  const content = $('div.mw-parser-output');
  if (!content.length) {
    const fallback = $('div.mw-content-ltr');
    if (!fallback.length) return null;
    return extractFromElement($, fallback, multilinks);
  }
  return extractFromElement($, content, multilinks);
}

function extractFromElement($, element, multilinks) {
  const selectorsToRemove = [
    '.toc', '.mw-empty-elt', '.hatnote', '.noprint',
    '.mw-editsection', '.page-actions', '.page-header',
    '.footer', '.catlinks', '.printfooter', '.visualClear',
    'script', 'style', '.ad-slot', '[data-fuse]',
    '.ad', '#siteNotice', '.suggestions', '.mw-portlet',
    'iframe',
  ];

  for (const selector of selectorsToRemove) {
    element.find(selector).remove();
  }

  element.find('img').each((_, img) => {
    const $img = $(img);
    const src = $img.attr('src') || '';
    if (src.includes('primis') || src.includes('doubleclick') ||
        src.includes('googleads') || src.includes('googlesyndication') ||
        src.includes('facebook') || src.includes('analytics') ||
        src.includes('pixel') || src.includes('track')) {
      $img.remove();
    }
  });

  const baseUrl = multilinks ? WIKI_BASE_URL : '';

  element.find('a[href]').each((_, a) => {
    const $a = $(a);
    const href = $a.attr('href');
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      $a.attr('href', baseUrl + href);
    }
  });

  element.find('img[src]').each((_, img) => {
    const $img = $(img);
    const src = $img.attr('src');
    if (src && src.startsWith('/') && !src.startsWith('//')) {
      $img.attr('src', WIKI_BASE_URL + src);
    }
    $img.attr('loading', 'lazy');
    $img.removeAttr('srcset');
    $img.removeAttr('data-file-width');
    $img.removeAttr('data-file-height');
    $img.removeAttr('data-file-type');
    $img.removeAttr('decoding');
  });

  element.find('table').each((_, table) => {
    const $table = $(table);
    if (!$table.hasClass('wiki-table')) {
      $table.addClass('wiki-table');
    }
  });

  const titleEl = $('h1.firstHeading .mw-page-title-main')
    .first()
    .add($('h1.firstHeading').first())
    .add($('#firstHeading').first());
  const title = titleEl.first().text().trim() || 'Untitled';

  let subtitle = '';
  const firstParagraph = element.find('p:not(.mw-empty-elt)').first();
  if (firstParagraph.length) {
    subtitle = firstParagraph.text().trim();
    if (subtitle.length > 300) {
      subtitle = subtitle.substring(0, 297) + '...';
    }
  }

  let coverImage = '';
  const firstFigure = element.find('figure img, .thumb img, .image img').first();
  if (firstFigure.length) {
    coverImage = firstFigure.attr('src') || '';
  }

  const images = [];
  element.find('img').each((_, img) => {
    const $img = $(img);
    images.push({
      originalUrl: $img.attr('src') || '',
      alt: $img.attr('alt') || '',
      width: parseInt($img.attr('width') || '0', 10),
      height: parseInt($img.attr('height') || '0', 10),
    });
  });

  const tables = element.find('table').length;

  const internalLinks = [];
  element.find('a[href]').each((_, a) => {
    const href = $(a).attr('href') || '';
    if (href.includes('/wiki/')) {
      internalLinks.push(href);
    }
  });

  return {
    title,
    subtitle,
    coverImage,
    html: element.html(),
    images,
    tables,
    internalLinks: internalLinks.length,
  };
}

async function downloadImage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WikiImporter/1.0)',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (contentType.includes('text/html')) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_IMAGE_SIZE) return null;

    return { buffer, contentType };
  } catch {
    return null;
  }
}

async function uploadImageToSupabase(buffer, fileName, contentType) {
  const supabase = getSupabaseAdmin();
  const ext = fileName.split('.').pop() || 'jpg';
  const safeName = `wiki/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(safeName, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(safeName);

  return urlData.publicUrl;
}

async function translateContent(html, title, subtitle) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('GEMINI_API_KEY não configurada');

  const prompt = `Traduza o seguinte conteúdo HTML de uma wiki de Final Fantasy XIV para Português do Brasil (PT-BR).

REGRAS:
- Traduza TODO o texto visível para PT-BR
- NÃO traduza nomes de: itens, habilidades, NPCs, locais, achievements, nomes próprios de FFXIV
- Preservar PERFEITAMENTE todas as tags HTML, classes CSS, e atributos
- Preservar todas as URLs (src, href) inalteradas
- Preservar todos os ícones inline
- Preservar a formatação de tabelas
- Para termos técnicos do jogo, use o formato: "Nome em PT-BR (Nome Original)"
- Seja natural na tradução, não literal

Conteúdo HTML:
${html}

Retorne APENAS o HTML traduzido, sem explicações adicionais.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 65536,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API erro ${response.status}: ${errorData}`);
  }

  const data = await response.json();
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Resposta da API veio vazia');
  }

  const text = data.candidates[0].content.parts[0].text;
  return text
    .replace(/^```html\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const claims = requireAdmin(req);
  if (!claims) return res.status(401).json({ error: 'unauthorized' });

  if (!checkRateLimit(claims.sub)) {
    return res.status(429).json({ error: 'rate_limited', message: 'Aguarde 1 minuto entre importações' });
  }

  const { url, translate = false, multilinks = true, category = 'guias', status = 'draft' } = req.body || {};

  if (!url || !ALLOWED_DOMAINS.some(d => url.includes(d))) {
    return res.status(400).json({ error: 'invalid_url', message: 'URL deve ser de ffxiv.consolegameswiki.com' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    if (Buffer.byteLength(html, 'utf8') > MAX_HTML_SIZE) {
      return res.status(400).json({ error: 'html_too_large', message: 'HTML excede 5MB' });
    }

    const $ = cheerio.load(html);
    const content = extractContent($, multilinks);
    if (!content) {
      return res.status(400).json({ error: 'content_not_found', message: 'Conteúdo da wiki não encontrado' });
    }

    const urlMap = new Map();
    let uploaded = 0;
    const totalImages = content.images.length;

    for (const img of content.images) {
      if (!img.originalUrl || img.originalUrl.startsWith('data:')) continue;

      const downloaded = await downloadImage(img.originalUrl);
      if (!downloaded) continue;

      try {
        const fileName = img.originalUrl.split('/').pop() || `image-${uploaded}.jpg`;
        const supabaseUrl = await uploadImageToSupabase(
          downloaded.buffer,
          fileName,
          downloaded.contentType
        );
        urlMap.set(img.originalUrl, supabaseUrl);
        uploaded++;
      } catch (err) {
        console.error(`[wiki-import] Falha ao上传 imagem: ${img.originalUrl}`, err.message);
      }
    }

    let finalHtml = content.html;
    for (const [original, supabase] of urlMap) {
      finalHtml = finalHtml.replaceAll(original, supabase);
    }

    if (translate) {
      finalHtml = await translateContent(finalHtml, content.title, content.subtitle);
    }

    const supabase = getSupabaseAdmin();
    let generatedSlug = generateSlug(content.title);

    const { data: existing } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', generatedSlug)
      .maybeSingle();

    if (existing) {
      generatedSlug = `${generatedSlug}-${Date.now().toString(36)}`;
    }

    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: content.title,
        slug: generatedSlug,
        subtitle: content.subtitle,
        content: finalHtml,
        category: category,
        author_name: claims.name || claims.username || 'Admin',
        author_id: claims.sub,
        cover_image: urlMap.get(content.coverImage) || content.coverImage || '',
        tags: [],
        is_pinned: false,
        status: status === 'published' ? 'published' : 'draft',
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (postError) throw postError;

    return res.json({
      success: true,
      slug: post.slug,
      url: `/post/${post.slug}`,
      imagesCount: uploaded,
      totalImages,
      title: content.title,
      subtitle: content.subtitle,
      tables: content.tables,
      internalLinks: content.internalLinks,
      translated: translate,
    });

  } catch (error) {
    console.error('[wiki-import] error:', error);
    return res.status(500).json({ error: 'import_failed', message: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
