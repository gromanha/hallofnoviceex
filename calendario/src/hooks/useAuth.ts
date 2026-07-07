import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';

export interface AdminProfile {
  username: string;
  display_name: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const me = await apiGet<AdminProfile>('/api/auth/me');
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    await apiPost('/api/auth/login', { username, password });
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await apiPost('/api/auth/logout');
    setUser(null);
  }, []);

  return { user, loading, login, logout, refresh };
}
