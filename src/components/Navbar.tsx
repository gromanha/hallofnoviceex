import React, { useEffect, useState, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Calendar, Shield, Moon, Sun, Home, LogOut, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import logoUrl from '@/assets/logo.png';

interface NavbarProps {
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = memo(({ onOpenLogin }) => {
  const { admin, onLogout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('hon_theme');
    if (saved === 'dark') {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('hon_theme', next);
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
      isActive
        ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm'
        : 'text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 text-[10px] ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-on-surface-variant)]'}`;

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-secondary)]/30 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-[var(--color-secondary)] shadow-md group-hover:scale-105 transition-transform">
              <img src={logoUrl} alt="HoN EX" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif font-black tracking-widest text-lg sm:text-xl text-[var(--color-primary)] block leading-none">
                HALL OF THE NOVICE <span className="text-[var(--color-secondary)]">EX</span>
              </span>
              <span className="font-sans text-xs tracking-wider text-[var(--color-on-surface-variant)] uppercase block mt-1">
                Majestic Battle Academy
              </span>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Menu principal">
            <NavLink to="/" end className={linkClass}>
              <Home className="w-4 h-4" />
              Início
            </NavLink>

            <NavLink to="/academia" className={linkClass}>
              <BookOpen className="w-4 h-4" />
              Códice & Guias
            </NavLink>

            <NavLink to="/calendario" className={linkClass}>
              <Calendar className="w-4 h-4" />
              Calendario
            </NavLink>

            <NavLink to="/receitas" className={linkClass}>
              <UtensilsCrossed className="w-4 h-4" />
              Receitas
            </NavLink>

            {admin && (
              <NavLink to="/admin" className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border border-[var(--color-secondary)]/50 ${
                  isActive
                    ? 'bg-[var(--color-secondary)] text-slate-900 font-bold shadow-md'
                    : 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20'
                }`
              }>
                <Shield className="w-4 h-4 text-[var(--color-secondary)]" />
                Painel Admin
              </NavLink>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)] transition-colors"
              title="Alternar Tema Escuro/Claro"
              aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {admin ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--color-sage)]/10 text-[var(--color-sage)] border border-[var(--color-sage)]/30">
                  {admin.display_name}
                </span>
                <button
                  onClick={onLogout}
                  className="p-2.5 rounded-xl border border-[var(--color-crimson)]/30 text-[var(--color-crimson)] hover:bg-[var(--color-crimson)]/10 transition-colors"
                  title="Sair do Painel Admin"
                  aria-label="Sair do painel administrativo"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-xs"
                aria-label="Fazer login no painel administrativo"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Painel Admin</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <nav className="md:hidden flex items-center justify-around py-2.5 border-t border-[var(--color-outline-variant)] text-xs font-medium" aria-label="Menu de navegação mobile">
          <NavLink to="/" end className={mobileLinkClass}>
            <Home className="w-4 h-4" />
            Início
          </NavLink>
          <NavLink to="/academia" className={mobileLinkClass}>
            <BookOpen className="w-4 h-4" />
            Códice & Guias
          </NavLink>
          <NavLink to="/calendario" className={mobileLinkClass}>
            <Calendar className="w-4 h-4" />
            Calendario
          </NavLink>
          <NavLink to="/receitas" className={mobileLinkClass}>
            <UtensilsCrossed className="w-4 h-4" />
            Receitas
          </NavLink>
          {admin && (
            <NavLink to="/admin" className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'text-[var(--color-secondary)] font-bold' : 'text-[var(--color-on-surface-variant)]'}`
            }>
              <Shield className="w-4 h-4" />
              Painel
            </NavLink>
          )}
        </nav>

      </div>
    </header>
  );
});

Navbar.displayName = 'Navbar';
