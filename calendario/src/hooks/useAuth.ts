import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';

export interface AdminProfile {
  username: string;
  display_name: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const me = await apiGet<AdminProfile>('/api/auth?op=me');
      if (!signal?.aborted) {
        setUser(me);
      }
    } catch {
      if (!signal?.aborted) {
        setUser(null);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    void refresh(controller.signal);
    return () => {
      controller.abort();
    };
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    await apiPost('/api/auth?op=login', { username, password });
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiPost('/api/auth?op=logout');
    setUser(null);
  }, []);

  return { user, loading, login, logout, refresh };
}
