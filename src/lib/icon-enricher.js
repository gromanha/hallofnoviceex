import { searchItems, searchQuests } from './ffxiv-api.js';

const MAX_TERMS = 20;
const DELAY_MS = 100;
const MIN_WORDS = 2;

// Regex patterns for extracting candidate terms
const WIKI_LINK_RE = /\[([^\]]+)\]\(\/wiki\/[^)]+\)/g;
const WIKI_BRACKET_RE = /\[\[([^\]]+)\]\]/g;
const COMPOUND_RE = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Extract candidate terms from markdown content.
 * Returns unique terms with 2+ words (avoids false positives).
 */
export function extractCandidateTerms(markdown) {
  const terms = new Set();

  // Wiki links: [Term](/wiki/...)
  let match;
  const re1 = new RegExp(WIKI_LINK_RE.source, 'g');
  while ((match = re1.exec(markdown)) !== null) {
    terms.add(match[1].trim());
  }

  // Bracket notation: [[Term]]
  const re2 = new RegExp(WIKI_BRACKET_RE.source, 'g');
  while ((match = re2.exec(markdown)) !== null) {
    terms.add(match[1].trim());
  }

  // Compound capitalized words: "Phantom Sword", "Forging the Phantasmal"
  const re3 = new RegExp(COMPOUND_RE.source, 'g');
  while ((match = re3.exec(markdown)) !== null) {
    terms.add(match[1].trim());
  }

  // Filter: only 2+ words, limit count
  return [...terms]
    .filter((t) => t.split(/\s+/).length >= MIN_WORDS)
    .slice(0, MAX_TERMS);
}

/**
 * Search XIVAPI for a term in both items and quests (parallel).
 * Returns { name, icon, type } or null.
 */
async function searchTerm(term) {
  try {
    const [itemRes, questRes] = await Promise.all([
      searchItems(term, 1).catch(() => null),
      searchQuests(term, 1).catch(() => null),
    ]);

    // Check item results first
    const itemResults = itemRes?.Results || itemRes?.results || [];
    if (itemResults.length > 0) {
      const item = itemResults[0];
      const icon = item.Icon || item.icon;
      if (icon) {
        return { name: item.Name || item.name, icon, type: 'item' };
      }
    }

    // Check quest results
    const questResults = questRes?.Results || questRes?.results || [];
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

/**
 * Enrich markdown content with inline icons from XIVAPI.
 * Replaces term occurrences with: ![Term](icon_url) **Term**
 */
export async function enrichWithIcons(markdownContent, onProgress) {
  const terms = extractCandidateTerms(markdownContent);

  if (terms.length === 0) {
    return { content: markdownContent, found: 0, total: 0 };
  }

  const iconMap = new Map();
  let found = 0;

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const result = await searchTerm(term);

    if (result) {
      const iconUrl = result.icon.startsWith('http')
        ? result.icon
        : `https://v2.xivapi.com${result.icon}`;
      iconMap.set(term, { name: result.name, iconUrl, type: result.type });
      found++;
    }

    onProgress?.({ current: i + 1, total: terms.length, term, found });

    if (i < terms.length - 1) {
      await delay(DELAY_MS);
    }
  }

  // Replace terms in markdown (longer terms first to avoid partial matches)
  let enriched = markdownContent;
  const sortedTerms = [...iconMap.entries()].sort((a, b) => b[0].length - a[0].length);

  for (const [term, { iconUrl }] of sortedTerms) {
    // Avoid replacing inside existing image markdown
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Replace only first occurrence per paragraph to avoid over-enriching
    enriched = enriched.replace(
      new RegExp(`(?<!!\\[)\\b${escapedTerm}\\b`, 'g'),
      (match) => `![${match}](${iconUrl}) **${match}**`
    );
  }

  return { content: enriched, found, total: terms.length };
}
