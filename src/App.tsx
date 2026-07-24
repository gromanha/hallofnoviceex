import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginGate } from './components/LoginGate';
import { ErrorBoundary } from './components/ErrorBoundary';

import { HomePage } from './pages/HomePage';
import { AcademiaPage } from './pages/AcademiaPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { AdminPage } from './pages/AdminPage';

import { AdminUser } from './types';
import { apiGet, apiPost } from './lib/api';

function getPathFromLocation(): string {
  if (typeof window === 'undefined') return '/';
  const path = window.location.pathname;
  const hash = window.location.hash;
  if (hash.startsWith('#/')) {
    return hash.slice(1);
  }
  return path || '/';
}

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => getPathFromLocation());
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Check auth session on startup
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

  // Listen to popstate & hashchange
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(getPathFromLocation());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path && window.location.hash !== `#${path}`) {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogin = async (username: string, password: string) => {
    const res = await apiPost<{ ok: boolean; admin: AdminUser }>('/api/auth?op=login', {
      username,
      password,
    });
    if (res?.admin) {
      setAdmin(res.admin);
      setIsLoginOpen(false);
      navigate('/admin');
    }
  };

  const handleLogout = async () => {
    try {
      await apiPost('/api/auth?op=logout');
    } finally {
      setAdmin(null);
      navigate('/');
    }
  };

  // Render correct page
  const renderContent = () => {
    if (currentPath === '/admin') {
      if (!admin) {
        return (
          <LoginGate
            onLogin={handleLogin}
            onClose={() => navigate('/')}
          />
        );
      }
      return (
        <AdminPage
          admin={admin}
          onLogout={handleLogout}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/academia') {
      return <AcademiaPage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/post/')) {
      const slug = currentPath.replace('/post/', '');
      return <PostDetailPage slug={slug} onNavigate={navigate} />;
    }

    if (currentPath === '/calendario') {
      return <CalendarPage onOpenAdmin={() => navigate('/admin')} />;
    }

    return <HomePage onNavigate={navigate} />;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-on-background)] font-sans antialiased">
        <Navbar
          currentPath={currentPath}
          onNavigate={navigate}
          admin={admin}
          onOpenLogin={() => setIsLoginOpen(true)}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          {renderContent()}
        </main>

        <Footer />

        {isLoginOpen && !admin && (
          <LoginGate
            onLogin={handleLogin}
            onClose={() => setIsLoginOpen(false)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
