import { requireAdmin } from '../src/lib/auth.js';
import * as cheerio from 'cheerio';

const WIKI_BASE_URL = 'https://ffxiv.consolegameswiki.com';
const ALLOWED_DOMAINS = ['ffxiv.consolegameswiki.com'];
const REQUEST_TIMEOUT = 30000;

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

  const htmlSize = Buffer.byteLength(element.html(), 'utf8');

  return {
    title,
    subtitle,
    coverImage,
    htmlSize,
    imagesCount: images.length,
    tables,
    internalLinks: internalLinks.length,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const claims = requireAdmin(req);
  if (!claims) return res.status(401).json({ error: 'unauthorized' });

  const { url, multilinks = true } = req.body || {};

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
    const $ = cheerio.load(html);
    const content = extractContent($, multilinks);

    if (!content) {
      return res.status(400).json({ error: 'content_not_found', message: 'Conteúdo da wiki não encontrado' });
    }

    return res.json({
      success: true,
      title: content.title,
      subtitle: content.subtitle,
      coverImage: content.coverImage,
      imagesCount: content.imagesCount,
      tables: content.tables,
      internalLinks: content.internalLinks,
      htmlSize: content.htmlSize,
      htmlSizeFormatted: `${(content.htmlSize / 1024).toFixed(1)}KB`,
    });

  } catch (error) {
    console.error('[wiki-preview] error:', error);
    return res.status(500).json({ error: 'preview_failed', message: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
