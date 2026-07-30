import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────
export interface LodestoneFCProfile {
  FreeCompany: {
    ID: number;
    Name: string;
    Tag: string;
    Slogan: string;
    Server: { World: string; DC: string };
    GrandCompany: { Name: string; Rank: string };
    ActiveState: string;
    Recruitment: string;
    ActiveMemberCount: number;
    Rank: string;
    CrestLayers: { Bottom: string; Middle: string; Top: string; Background: string };
    Estate: { Name: string; Greeting: string; Address: string };
    Reputation: Array<{ GrandCompany: string; Rank: string }>;
  };
}

export interface LodestoneMember {
  ID: number;
  Name: string;
  Avatar: string;
  Server: { World: string; DC: string };
  FCRank: string;
  RankIcon: string;
  Level: number;
  GrandCompany: { Name: string; Rank: string };
}

interface LodestoneMembersResponse {
  FreeCompanyMembers: {
    List: LodestoneMember[];
    PageInfo: { CurrentPage: number; NumPages: number; TotalMembers?: number };
  };
}

export interface UseLodestoneFCReturn {
  fc: LodestoneFCProfile | null;
  members: LodestoneMember[];
  memberPageInfo: { CurrentPage: number; NumPages: number; TotalMembers?: number } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  loadMoreMembers: () => void;
  hasMoreMembers: boolean;
}

// ── Client-side cache (localStorage with 1h TTL) ───────────────
const LS_KEY_PREFIX = 'hon_lodestone_';
const CLIENT_CACHE_TTL = 60 * 60 * 1000;

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(LS_KEY_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CLIENT_CACHE_TTL) {
      localStorage.removeItem(LS_KEY_PREFIX + key);
      return null;
    }
    return data as T;
  } catch {
    return null;
  }
}

function setCache(key: string, data: unknown): void {
  try {
    localStorage.setItem(LS_KEY_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

// ── Hook ───────────────────────────────────────────────────────
export function useLodestoneFC(): UseLodestoneFCReturn {
  const [fc, setFc] = useState<LodestoneFCProfile | null>(null);
  const [members, setMembers] = useState<LodestoneMember[]>([]);
  const [memberPageInfo, setMemberPageInfo] = useState<LodestoneMembersResponse['FreeCompanyMembers']['PageInfo'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check client cache first
    const cachedFc = getCached<LodestoneFCProfile>('fc');
    const cachedMembers = getCached<LodestoneMembersResponse>('members_all');

    if (cachedFc && cachedMembers) {
      setFc(cachedFc);
      setMembers(cachedMembers.FreeCompanyMembers.List);
      setMemberPageInfo(cachedMembers.FreeCompanyMembers.PageInfo);
      setLoading(false);
      return;
    }

    try {
      const [fcRes, membersRes] = await Promise.all([
        fetch('/api/lodestone/fc').then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))),
        fetch('/api/lodestone/fc/members/all').then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))),
      ]);

      if (!mountedRef.current) return;

      setFc(fcRes);
      setMembers(membersRes.FreeCompanyMembers.List);
      setMemberPageInfo(membersRes.FreeCompanyMembers.PageInfo);

      setCache('fc', fcRes);
      setCache('members_all', membersRes);
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : 'unknown_error';
      setError(msg);

      // Auto-retry once after 5s
      if (!retryRef.current) {
        retryRef.current = setTimeout(() => {
          retryRef.current = null;
          if (mountedRef.current) fetchAll();
        }, 5000);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();
    return () => {
      mountedRef.current = false;
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [fetchAll]);

  const refetch = useCallback(() => {
    // Clear client cache and re-fetch
    try {
      localStorage.removeItem(LS_KEY_PREFIX + 'fc');
      localStorage.removeItem(LS_KEY_PREFIX + 'members_all');
    } catch {}
    fetchAll();
  }, [fetchAll]);

  const loadMoreMembers = useCallback(async () => {
    if (!memberPageInfo || memberPageInfo.CurrentPage >= memberPageInfo.NumPages) return;
    try {
      const nextPage = memberPageInfo.CurrentPage + 1;
      const res = await fetch(`/api/lodestone/fc/members?page=${nextPage}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: LodestoneMembersResponse = await res.json();
      if (!mountedRef.current) return;
      setMembers(prev => [...prev, ...data.FreeCompanyMembers.List]);
      setMemberPageInfo(data.FreeCompanyMembers.PageInfo);
    } catch (err) {
      // silent fail for load more
    }
  }, [memberPageInfo]);

  const hasMoreMembers = memberPageInfo
    ? memberPageInfo.CurrentPage < memberPageInfo.NumPages
    : false;

  return { fc, members, memberPageInfo, loading, error, refetch, loadMoreMembers, hasMoreMembers };
}
