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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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
    `flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
      isActive
        ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
        : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)]'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 text-[10px] transition-colors ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-on-surface-variant)]'}`;

  return (
    <header className="sticky top-0 z-40 glass border-b border-[var(--color-outline)]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-outline)] shadow-md group-hover:scale-105 transition-transform">
              <img src={logoUrl} alt="HoN EX" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-display font-bold tracking-wider text-sm sm:text-base text-[var(--color-on-surface)] block leading-none">
                HALL OF THE NOVICE <span className="text-[var(--color-primary)]">EX</span>
              </span>
              <span className="font-sans text-[10px] tracking-widest text-[var(--color-on-surface-variant)] uppercase block mt-0.5">
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
                `flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all border border-[var(--color-secondary)]/30 ${
                  isActive
                    ? 'bg-[var(--color-secondary)] text-[var(--color-background)] font-bold shadow-md'
                    : 'text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10'
                }`
              }>
                <Shield className="w-4 h-4" />
                Painel Admin
              </NavLink>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[var(--color-outline)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)] transition-all"
              title="Alternar Tema Escuro/Claro"
              aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
              aria-pressed={theme === 'dark'}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[var(--color-amber)]" />}
            </button>

            {admin ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--color-sage)]/10 text-[var(--color-sage)] border border-[var(--color-sage)]/20">
                  {admin.display_name}
                </span>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl border border-[var(--color-crimson)]/20 text-[var(--color-crimson)] hover:bg-[var(--color-crimson)]/10 transition-all"
                  title="Sair do Painel Admin"
                  aria-label="Sair do painel administrativo"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-deep)] transition-all shadow-md shadow-[var(--color-primary)]/20"
                aria-label="Fazer login no painel administrativo"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <nav className="md:hidden flex items-center justify-around py-2 border-t border-[var(--color-outline)]/30 text-[10px] font-medium" aria-label="Menu de navegação mobile">
          <NavLink to="/" end className={mobileLinkClass}>
            <Home className="w-4 h-4" />
            Início
          </NavLink>
          <NavLink to="/academia" className={mobileLinkClass}>
            <BookOpen className="w-4 h-4" />
            Códice
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
