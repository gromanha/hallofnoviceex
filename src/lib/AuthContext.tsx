import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AdminUser } from '../types';
import { apiGet, apiPost } from '../lib/api';

interface AuthContextType {
  admin: AdminUser | null;
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await apiGet<{ username: string; display_name: string }>('/api/auth?op=me');
        if (res?.username) {
          setAdmin(res);
        } else {
          setAdmin(null);
        }
      } catch {
        setAdmin(null);
      }
    }
    checkAuth();
  }, []);

  const onLogin = useCallback(async (username: string, password: string) => {
    const res = await apiPost<{ ok: boolean; admin: AdminUser }>('/api/auth?op=login', {
      username,
      password,
    });
    if (res?.admin) {
      setAdmin(res.admin);
    }
  }, []);

  const onLogout = useCallback(async () => {
    try {
      await apiPost('/api/auth?op=logout');
    } finally {
      setAdmin(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ admin, onLogin, onLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
