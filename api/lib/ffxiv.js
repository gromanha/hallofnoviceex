const XIVAPI_BASE = 'https://v2.xivapi.com';
const UNIVERSALIS_BASE = 'https://universalis.app/api/v2';
const WIKI_BASE = 'https://ffxiv.consolegameswiki.com/mediawiki/api.php';

const XIVAPI_KEY = process.env.XIVAPI_KEY || '';
const CACHE_TTL = 30 * 60 * 1000;
const REQUEST_TIMEOUT = 15000;

// MediaWiki APIs require a descriptive User-Agent (https://www.mediawiki.org/wiki/API:Etiquette#The_User-Agent_header)
const USER_AGENT = 'HallOfNoviceEX/1.0 (https://github.com/hallofnoviceex; contact@hallofnovice.com)';

const cache = new Map();

function getCacheKey(prefix, params) {
  return `${prefix}:${JSON.stringify(params)}`;
}

function getFromCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  if (cache.size > 1000) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        ...(options.headers || {}),
      },
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

export async function fetchXIVAPI(endpoint, params = {}) {
  const cacheKey = getCacheKey('xivapi', { endpoint, ...params });
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const url = new URL(`${XIVAPI_BASE}${endpoint}`);

  if (XIVAPI_KEY) {
    url.searchParams.set('private_key', XIVAPI_KEY);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const data = await fetchWithTimeout(url.toString());
  setCache(cacheKey, data);
  return data;
}

export async function getItemById(itemId) {
  return fetchXIVAPI(`/api/sheet/Item/${itemId}`, {
    fields: 'Name,Description,LevelItem,LevelEquip,ItemKind,ItemSearchCategory,Icon,PriceMid,PriceLow',
  });
}

export async function searchItems(query, limit = 20) {
  return fetchXIVAPI('/api/search', {
    sheets: 'Item',
    query: `Name~"${query}"`,
    fields: 'Name,LevelItem,ItemKind.Name,Icon',
    limit,
  });
}

export async function getRecipeById(recipeId) {
  return fetchXIVAPI(`/api/sheet/Item/${recipeId}`, {
    fields: 'Name,Description,LevelItem,ItemKind,Icon',
  });
}

export async function searchRecipes(query, limit = 20) {
  return fetchXIVAPI('/api/search', {
    sheets: 'Item',
    query: `Name~"${query}" ItemUICategory.Name="Culinary"`,
    fields: 'Name,LevelItem,ItemKind.Name,Icon',
    limit,
  });
}

export async function getCharacterById(characterId) {
  return fetchXIVAPI(`/character/${characterId}`, {
    data: 'profile',
  });
}

export async function searchQuests(query, limit = 20) {
  return fetchXIVAPI('/api/search', {
    sheets: 'Quest',
    query: `Name~"${query}"`,
    fields: 'Name,Description,LevelQuest,Expansion.Name,Icon',
    limit,
  });
}

export async function searchDungeons(query, limit = 20) {
  return fetchXIVAPI('/api/search', {
    sheets: 'InstanceContent',
    query: `Name~"${query}"`,
    fields: 'Name,Description,Level,InstanceContentType.Name,Icon',
    limit,
  });
}

export async function searchTrials(query, limit = 20) {
  return fetchXIVAPI('/api/search', {
    sheets: 'InstanceContent',
    query: `Name~"${query}"`,
    fields: 'Name,Description,Level,InstanceContentType.Name,Icon',
    limit,
  });
}

export async function searchRaids(query, limit = 20) {
  return fetchXIVAPI('/api/search', {
    sheets: 'InstanceContent',
    query: `Name~"${query}"`,
    fields: 'Name,Description,Level,InstanceContentType.Name,Icon',
    limit,
  });
}

export async function getMarketPrices(world, itemIds) {
  const cacheKey = getCacheKey('universalis', { world, itemIds });
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const ids = Array.isArray(itemIds) ? itemIds.join(',') : itemIds;
  const url = `${UNIVERSALIS_BASE}/${world}/${ids}`;

  const data = await fetchWithTimeout(url);
  setCache(cacheKey, data);
  return data;
}

export async function fetchWiki(action = 'query', params = {}) {
  const cacheKey = getCacheKey('wiki', { action, ...params });
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  const url = new URL(WIKI_BASE);
  url.searchParams.set('action', action);
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const data = await fetchWithTimeout(url.toString());
  setCache(cacheKey, data);
  return data;
}

export async function getWikiPage(title) {
  return fetchWiki('query', {
    titles: title,
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    rvlimit: '1',
  });
}

export async function searchWiki(query, limit = 10) {
  return fetchWiki('query', {
    list: 'search',
    srsearch: query,
    srlimit: limit,
  });
}

export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()).slice(0, 10),
  };
}

export const WORLDS = [
  'Adamantoise', 'Aegis', 'Alpha', 'Anima', 'Asura',
  'Atomos', 'Bahamut', 'Balmung', 'Behemoth', 'Belias',
  'Brynhildr', 'Cactuar', 'Cerberus', 'Chocobo', 'Coeurl',
  'Crystal', 'Diabolos', 'Durandal', 'Excalibur', 'Exodus',
  'Faerie', 'Fenrir', 'Famfrit', 'Gilgamesh', 'Goblin',
  'Hades', 'Hyperion', 'Hyuran', 'Ifrit', 'Ignis',
  'Instantation', 'Ixion', 'Jenova', 'Kujata', 'Lamia',
  'Lich', 'Limon', 'Luna', 'Maduin', 'Malboro',
  'Mandel', 'Masamune', 'Mateus', 'Midgardsormr', 'Moogle',
  'Odin', 'Omega', 'Phoenix', 'Ragnarok', 'Raiden',
  'Ramuh', 'Ravana', 'Ribbon', 'Rosalinde', 'Sargatanas',
  'Shiva', 'Siren', 'Sleipnir', 'Solaris', 'Sophia',
  'Tonberry', 'Typhon', 'Ultima', 'Ultros', 'Unicorn',
  'Valefor', 'Yojimbo', 'Zalera', 'Zeromus', 'Zodiark',
];
