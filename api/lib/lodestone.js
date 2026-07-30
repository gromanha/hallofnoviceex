import axios from 'axios';
import { parseHTML } from 'linkedom';

const BASE_URL = 'https://na.finalfantasyxiv.com/lodestone/freecompany';

// ── In-memory cache ──────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCache(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  cache.delete(key);
  return null;
}

function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// Evict stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (now - entry.ts > CACHE_TTL) cache.delete(key);
  }
}, 10 * 60 * 1000);

// ── FC Profile Parser ────────────────────────────────────────────

export async function getFCProfile(fcId) {
  const cacheKey = `fc:profile:${fcId}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const { data: html } = await axios.get(`${BASE_URL}/${fcId}`, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; HoNEXBot/1.0)',
      'Accept-Language': 'en-us,en;q=0.9',
    },
  });

  const { document } = parseHTML(html).window;

  const texts = document.querySelectorAll('.freecompany__text');
  const tag = texts[1]?.textContent?.trim() || '';
  const slogan = texts[0]?.textContent?.trim() || '';
  const memberCount = parseInt(texts[3]?.textContent?.trim() || '0', 10);
  const rank = texts[4]?.textContent?.trim() || '';
  const activeState = texts[5]?.textContent?.trim() || '';
  const recruitment = texts[6]?.textContent?.trim() || '';

  // Crest images
  const crestImgs = document.querySelectorAll('.entry__freecompany__crest img');
  const crests = [];
  crestImgs.forEach(img => crests.push(img.getAttribute('src') || ''));

  // Grand Company
  const gcEl = document.querySelector('.entry__freecompany__gc');
  const gcText = gcEl?.textContent?.trim() || '';
  const gcMatch = gcText.match(/^(.+?)\s*<(.+?)>$/);
  const grandCompany = {
    Name: gcMatch ? gcMatch[1].trim() : gcText,
    Rank: gcMatch ? gcMatch[2].trim() : '',
  };

  // Estate
  const estateName = document.querySelector('.freecompany__estate__name')?.textContent?.trim() || '';
  const estateGreeting = document.querySelector('.freecompany__estate__greeting')?.textContent?.trim() || '';
  const estateTitle = document.querySelector('.freecompany__estate__title')?.textContent?.trim() || '';

  // Reputation
  const repNames = document.querySelectorAll('.freecompany__reputation__gcname');
  const repRanks = document.querySelectorAll('.freecompany__reputation__rank');
  const reputation = [];
  repNames.forEach((el, i) => {
    reputation.push({
      GrandCompany: el.textContent?.trim() || '',
      Rank: repRanks[i]?.textContent?.trim() || '',
    });
  });

  // Server info from world element
  const worldEl = document.querySelector('.entry__world');
  const worldText = worldEl?.textContent?.trim() || '';
  const worldMatch = worldText.match(/^(.+?)\s*\[(.+?)\]$/);
  const server = {
    World: worldMatch ? worldMatch[1].trim() : worldText,
    DC: worldMatch ? worldMatch[2].trim() : '',
  };

  const result = {
    FreeCompany: {
      ID: Number(fcId),
      Name: document.querySelector('.freecompany__text__name')?.textContent?.trim() || '',
      Tag: tag,
      Slogan: slogan,
      Server: server,
      GrandCompany: grandCompany,
      ActiveState: activeState,
      Recruitment: recruitment,
      ActiveMemberCount: memberCount,
      Rank: rank,
      CrestLayers: {
        Bottom: crests[1] || crests[0] || '',
        Middle: crests[2] || '',
        Top: crests[3] || '',
        Background: crests[0] || '',
      },
      Estate: {
        Name: estateName,
        Greeting: estateGreeting,
        Address: estateTitle,
      },
      Reputation: reputation,
    },
  };

  setCache(cacheKey, result);
  return result;
}

// ── FC Members Parser ────────────────────────────────────────────

function parseMembers(html) {
  const { document } = parseHTML(html).window;
  const entries = document.querySelectorAll('li.entry');
  const members = [];

  entries.forEach(entry => {
    const link = entry.querySelector('a');
    const href = link?.getAttribute('href') || '';
    const charIdMatch = href.match(/character\/(\d+)/);
    const charId = charIdMatch ? Number(charIdMatch[1]) : 0;

    const name = entry.querySelector('.entry__name')?.textContent?.trim() || '';
    const worldText = entry.querySelector('.entry__world')?.textContent?.trim() || '';
    const worldMatch = worldText.match(/^(.+?)\s*\[(.+?)\]$/);

    const avatar = entry.querySelector('.entry__chara__face img')?.getAttribute('src') || '';

    const infoItems = entry.querySelectorAll('.entry__freecompany__info li');
    const fcRankName = infoItems[0]?.querySelector('span')?.textContent?.trim() || '';
    const fcRankIcon = infoItems[0]?.querySelector('img')?.getAttribute('src') || '';
    const level = infoItems[1]?.querySelector('span')?.textContent?.trim() || '';
    const grandCompanyRank = infoItems[2]?.getAttribute('data-tooltip') || '';

    // Parse grand company rank tooltip: "Order of the Twin Adder / Serpent Captain"
    const gcRankMatch = grandCompanyRank.match(/^(.+?)\s*\/\s*(.+)$/);

    members.push({
      ID: charId,
      Name: name,
      Avatar: avatar,
      Server: {
        World: worldMatch ? worldMatch[1].trim() : worldText,
        DC: worldMatch ? worldMatch[2].trim() : '',
      },
      FCRank: fcRankName,
      RankIcon: fcRankIcon,
      Level: level ? Number(level) : 0,
      GrandCompany: {
        Name: gcRankMatch ? gcRankMatch[1].trim() : '',
        Rank: gcRankMatch ? gcRankMatch[2].trim() : grandCompanyRank,
      },
    });
  });

  return members;
}

export async function getFCMembers(fcId, page = 1) {
  const cacheKey = `fc:members:${fcId}:${page}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = page > 1
    ? `${BASE_URL}/${fcId}/member?page=${page}`
    : `${BASE_URL}/${fcId}/member`;

  const { data: html } = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; HoNEXBot/1.0)',
      'Accept-Language': 'en-us,en;q=0.9',
    },
  });

  const members = parseMembers(html);

  // Detect pagination from the page HTML
  const { document } = parseHTML(html).window;
  const pageLinks = document.querySelectorAll('li.ldst_paging__num a, li.ldst_paging__num--current');
  let numPages = 1;
  pageLinks.forEach(el => {
    const num = parseInt(el.textContent?.trim() || '0', 10);
    if (num > numPages) numPages = num;
  });

  // Fallback: if no pagination found but we got 50 results, assume at least 2 pages
  if (numPages === 1 && members.length === 50) numPages = 2;

  const result = {
    FreeCompanyMembers: {
      List: members,
      PageInfo: {
        CurrentPage: page,
        NumPages: numPages,
      },
    },
  };

  setCache(cacheKey, result);
  return result;
}

export async function getFCAllMembers(fcId) {
  const cacheKey = `fc:members:${fcId}:all`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // First page to get pagination info
  const firstPage = await getFCMembers(fcId, 1);
  const { List: firstMembers, PageInfo } = firstPage.FreeCompanyMembers;

  let allMembers = [...firstMembers];

  // Fetch remaining pages with 1s delay
  for (let p = 2; p <= PageInfo.NumPages; p++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const nextPage = await getFCMembers(fcId, p);
    allMembers = allMembers.concat(nextPage.FreeCompanyMembers.List);
  }

  const result = {
    FreeCompanyMembers: {
      List: allMembers,
      PageInfo: {
        CurrentPage: 1,
        NumPages: 1,
        TotalMembers: allMembers.length,
      },
    },
  };

  setCache(cacheKey, result);
  return result;
}
