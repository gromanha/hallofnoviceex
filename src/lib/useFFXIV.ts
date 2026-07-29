import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

// ── Types ──────────────────────────────────────────────────────
interface XIVAPIResponse<T = unknown> {
  results?: Array<{
    row_id: number;
    sheet: string;
    fields: T;
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

// ── Helper: fetch JSON seguro ──────────────────────────────────
async function safeFetchJSON(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });

  const contentType = response.headers.get('content-type') || '';
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

  if (!contentType.includes('application/json')) {
    throw new Error('Resposta não é JSON válida');
  }

  return JSON.parse(text);
}

// ── Hook: Busca genérica ──────────────────────────────────────
function useFFXIVSearch<T>(
  endpoint: string,
  query: string,
  options: UseFFXIVOptions = {}
) {
  const { enabled = true, limit = 20 } = options;
  const [data, setData] = useState<T | null>(null);
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
        const params = new URLSearchParams({
          search: debouncedQuery,
          limit: String(limit),
        });

        const result = await safeFetchJSON(
          `/api/ffxiv/${endpoint}?${params.toString()}`,
          controller.signal
        );
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
  }, [endpoint, debouncedQuery, limit, enabled]);

  return { data, loading, error };
}

// ── Hook: Item por ID ─────────────────────────────────────────
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
        const result = await safeFetchJSON(
          `/api/ffxiv/items/${itemId}`,
          controller.signal
        );
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

// ── Hook: Receita por ID ──────────────────────────────────────
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
        const result = await safeFetchJSON(
          `/api/ffxiv/recipes/${recipeId}`,
          controller.signal
        );
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

// ── Hook: Preço Market Board ──────────────────────────────────
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
        const params = new URLSearchParams({ world });
        const result = await safeFetchJSON(
          `/api/ffxiv/market/${itemId}?${params.toString()}`,
          controller.signal
        );
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

// ── Hook: Buscar itens ────────────────────────────────────────
export function useSearchItems(query: string, options?: UseFFXIVOptions) {
  return useFFXIVSearch<XIVAPIResponse>('items', query, options);
}

// ── Hook: Buscar receitas ─────────────────────────────────────
export function useSearchRecipes(query: string, options?: UseFFXIVOptions) {
  return useFFXIVSearch<XIVAPIResponse>('recipes', query, options);
}

// ── Hook: Buscar quests ───────────────────────────────────────
export function useSearchQuests(query: string, options?: UseFFXIVOptions) {
  return useFFXIVSearch<XIVAPIResponse>('quests', query, options);
}

// ── Hook: Buscar instâncias ───────────────────────────────────
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
        const params = new URLSearchParams({
          search: debouncedQuery,
          type,
          limit: String(limit),
        });

        const result = await safeFetchJSON(
          `/api/ffxiv/instances?${params.toString()}`,
          controller.signal
        );
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

// ── Hook: Buscar na wiki ──────────────────────────────────────
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
        const params = new URLSearchParams({
          q: debouncedQuery,
          limit: String(limit),
        });

        const result = await safeFetchJSON(
          `/api/ffxiv/wiki/search?${params.toString()}`,
          controller.signal
        );
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

// ── Hook: Página da wiki ──────────────────────────────────────
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
        const result = await safeFetchJSON(
          `/api/ffxiv/wiki/${encodeURIComponent(title)}`,
          controller.signal
        );
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

// ── Hook: Mundos disponíveis ──────────────────────────────────
export function useFFXIVWorlds() {
  const [worlds, setWorlds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchWorlds() {
      setLoading(true);
      try {
        const result = await safeFetchJSON('/api/ffxiv/worlds');
        setWorlds(result.worlds || []);
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchWorlds();
  }, []);

  return { worlds, loading };
}

// ── Hook: Personagem ──────────────────────────────────────────
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
        const result = await safeFetchJSON(
          `/api/ffxiv/characters/${characterId}`,
          controller.signal
        );
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
