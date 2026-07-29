import { useState, useEffect, useRef, useMemo } from 'react';
import { useDebounce } from './useDebounce';

// ── Types ──────────────────────────────────────────────────────
interface XIVAPIResponse {
  results?: Array<{
    row_id: number;
    sheet: string;
    fields: Record<string, unknown>;
    score?: number;
  }>;
  next?: string;
}

interface MarketResponse {
  items: Record<string, {
    itemID: number;
    nqPrice: number;
    hqPrice: number;
    nqQuantity: number;
    hqQuantity: number;
    lastUploadTime: number;
  }>;
}

interface WikiSearchResult {
  query?: {
    search?: Array<{
      title: string;
      snippet: string;
      pageid: number;
    }>;
  };
}

interface WikiPageResult {
  query?: {
    pages?: Record<string, {
      title: string;
      extract?: string;
      thumbnail?: { source: string };
      pageimage?: string;
      fullurl?: string;
    }>;
  };
}

interface UseFFXIVOptions {
  enabled?: boolean;
  limit?: number;
}

// ── Constantes das APIs externas ───────────────────────────────
const XIVAPI_BASE = 'https://v2.xivapi.com';
const UNIVERSALIS_BASE = 'https://universalis.app/api/v2';
const WIKI_BASE = 'https://ffxiv.consolegameswiki.com/mediawiki/api.php';

const WORLDS = [
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

// ── Helper: buscar JSON de qualquer URL (CORS) ─────────────────
async function fetchJSON<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  const text = await response.text();

  if (!response.ok) {
    let msg = `HTTP ${response.status}`;
    try {
      const errJson = JSON.parse(text);
      if (errJson.error) msg = errJson.error;
      if (errJson.message) msg += `: ${errJson.message}`;
    } catch {}
    throw new Error(msg);
  }

  return JSON.parse(text) as T;
}

// ── Helper: buscar na XIVAPI v2 ────────────────────────────────
function xivapiURL(endpoint: string, params: Record<string, string | number> = {}): string {
  const url = new URL(`${XIVAPI_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

// ── Hook: Busca genérica (XIVAPI) ──────────────────────────────
function useFFXIVSearch(
  buildURL: (query: string, limit: number) => string,
  query: string,
  options: UseFFXIVOptions = {}
) {
  const { enabled = true, limit = 20 } = options;
  const [data, setData] = useState<XIVAPIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (!enabled || !debouncedQuery || debouncedQuery.length < 2) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const url = buildURL(debouncedQuery, Math.min(limit, 50));
        const result = await fetchJSON<XIVAPIResponse>(url, controller.signal);
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => controller.abort();
  }, [debouncedQuery, limit, enabled, buildURL]);

  return { data, loading, error };
}

// ── Buscar itens ───────────────────────────────────────────────
function buildItemURL(query: string, limit: number): string {
  return xivapiURL('/api/search', {
    sheets: 'Item',
    query: `Name~"${query}"`,
    fields: 'Name,LevelItem,ItemKind.Name,Icon',
    limit,
  });
}

export function useSearchItems(query: string, options?: UseFFXIVOptions) {
  const buildURL = useStableCallback(buildItemURL);
  return useFFXIVSearch(buildURL, query, options);
}

// ── Buscar receitas ────────────────────────────────────────────
function buildRecipeURL(query: string, limit: number): string {
  return xivapiURL('/api/search', {
    sheets: 'Item',
    query: `Name~"${query}" ItemUICategory.Name="Culinary"`,
    fields: 'Name,LevelItem,ItemKind.Name,Icon',
    limit,
  });
}

export function useSearchRecipes(query: string, options?: UseFFXIVOptions) {
  const buildURL = useStableCallback(buildRecipeURL);
  return useFFXIVSearch(buildURL, query, options);
}

// ── Buscar quests ──────────────────────────────────────────────
function buildQuestURL(query: string, limit: number): string {
  return xivapiURL('/api/search', {
    sheets: 'Quest',
    query: `Name~"${query}"`,
    fields: 'Name,Description,LevelQuest,Expansion.Name,Icon',
    limit,
  });
}

export function useSearchQuests(query: string, options?: UseFFXIVOptions) {
  const buildURL = useStableCallback(buildQuestURL);
  return useFFXIVSearch(buildURL, query, options);
}

// ── Buscar instâncias ──────────────────────────────────────────
export function useSearchInstances(
  query: string,
  type: 'dungeon' | 'trial' | 'raid' = 'dungeon',
  options?: UseFFXIVOptions
) {
  const [data, setData] = useState<XIVAPIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 400);
  const { enabled = true, limit = 20 } = options || {};

  useEffect(() => {
    if (!enabled || !debouncedQuery || debouncedQuery.length < 2) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function fetchInstances() {
      setLoading(true);
      setError(null);

      try {
        const url = xivapiURL('/api/search', {
          sheets: 'InstanceContent',
          query: `Name~"${debouncedQuery}"`,
          fields: 'Name,Description,Level,InstanceContentType.Name,Icon',
          limit: Math.min(limit, 50),
        });

        const result = await fetchJSON<XIVAPIResponse>(url, controller.signal);
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchInstances();

    return () => controller.abort();
  }, [debouncedQuery, type, limit, enabled]);

  return { data, loading, error };
}

// ── Item por ID ────────────────────────────────────────────────
export function useFFXIVItem(itemId: number | null) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function fetchItem() {
      setLoading(true);
      setError(null);

      try {
        const url = xivapiURL(`/api/sheet/Item/${itemId}`, {
          fields: 'Name,Description,LevelItem,LevelEquip,ItemKind,ItemSearchCategory,Icon,PriceMid,PriceLow',
        });
        const result = await fetchJSON<unknown>(url, controller.signal);
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchItem();

    return () => controller.abort();
  }, [itemId]);

  return { data, loading, error };
}

// ── Receita por ID ─────────────────────────────────────────────
export function useFFXIVRecipe(recipeId: number | null) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function fetchRecipe() {
      setLoading(true);
      setError(null);

      try {
        const url = xivapiURL(`/api/sheet/Item/${recipeId}`, {
          fields: 'Name,Description,LevelItem,ItemKind,Icon',
        });
        const result = await fetchJSON<unknown>(url, controller.signal);
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRecipe();

    return () => controller.abort();
  }, [recipeId]);

  return { data, loading, error };
}

// ── Preço Market Board (Universalis) ───────────────────────────
export function useMarketPrice(itemId: number | null, world = 'Excalibur') {
  const [data, setData] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function fetchMarket() {
      setLoading(true);
      setError(null);

      try {
        const url = `${UNIVERSALIS_BASE}/${world}/${itemId}`;
        const result = await fetchJSON<MarketResponse>(url, controller.signal);
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchMarket();

    return () => controller.abort();
  }, [itemId, world]);

  return { data, loading, error };
}

// ── Buscar na wiki ─────────────────────────────────────────────
export function useSearchWiki(query: string, options?: UseFFXIVOptions) {
  const [data, setData] = useState<WikiSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 400);
  const { enabled = true, limit = 10 } = options || {};

  useEffect(() => {
    if (!enabled || !debouncedQuery || debouncedQuery.length < 2) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function fetchWikiSearch() {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(WIKI_BASE);
        url.searchParams.set('action', 'query');
        url.searchParams.set('list', 'search');
        url.searchParams.set('srsearch', debouncedQuery);
        url.searchParams.set('srlimit', String(Math.min(limit, 50)));
        url.searchParams.set('format', 'json');
        url.searchParams.set('origin', '*');

        const result = await fetchJSON<WikiSearchResult>(url.toString(), controller.signal);
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWikiSearch();

    return () => controller.abort();
  }, [debouncedQuery, limit, enabled]);

  return { data, loading, error };
}

// ── Página da wiki ─────────────────────────────────────────────
export function useWikiPage(title: string | null) {
  const [data, setData] = useState<WikiPageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function fetchWikiPage() {
      setLoading(true);
      setError(null);

      try {
        const url = new URL(WIKI_BASE);
        url.searchParams.set('action', 'query');
        url.searchParams.set('titles', title);
        url.searchParams.set('prop', 'extracts|pageimages|info');
        url.searchParams.set('exintro', 'true');
        url.searchParams.set('explaintext', 'true');
        url.searchParams.set('pithumbsize', '300');
        url.searchParams.set('inprop', 'url');
        url.searchParams.set('format', 'json');
        url.searchParams.set('origin', '*');

        const result = await fetchJSON<WikiPageResult>(url.toString(), controller.signal);
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWikiPage();

    return () => controller.abort();
  }, [title]);

  return { data, loading, error };
}

// ── Mundos disponíveis ──────────────────────────────────────────
export function useFFXIVWorlds() {
  const [worlds, setWorlds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setWorlds(WORLDS);
  }, []);

  return { worlds, loading };
}

// ── Personagem ──────────────────────────────────────────────────
export function useFFXIVCharacter(characterId: number | null) {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!characterId) {
      setData(null);
      return;
    }

    const controller = new AbortController();

    async function fetchCharacter() {
      setLoading(true);
      setError(null);

      try {
        const url = xivapiURL(`/character/${characterId}`, {
          data: 'profile',
        });
        const result = await fetchJSON<unknown>(url, controller.signal);
        setData(result);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCharacter();

    return () => controller.abort();
  }, [characterId]);

  return { data, loading, error };
}

// ── Helper: manter callback estável ────────────────────────────
function useStableCallback<T extends (...args: never[]) => unknown>(fn: T): T {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFn = useMemo(() => ((...args: never[]) => fnRef.current(...args)) as T, []);
  return stableFn;
}
