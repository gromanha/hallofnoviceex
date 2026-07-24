import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Calendar, Shield, Moon, Sun, Home, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

interface NavbarProps {
  onOpenLogin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin }) => {
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
        ? 'bg-[var(--color-primary)] text-white shadow-sm'
        : 'text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 ${isActive ? 'text-[#1D6A6A] font-bold' : 'text-slate-500'}`;

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-secondary)]/30 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1D6A6A] to-[#124949] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="font-serif font-black tracking-widest text-lg sm:text-xl text-[#1D6A6A] dark:text-[#4ECDC4] block leading-none">
                HALL OF THE NOVICE <span className="text-[#D4AF37]">EX</span>
              </span>
              <span className="font-sans text-xs tracking-wider text-[var(--color-on-surface-variant)] uppercase block mt-1">
                Majestic Battle Academy
              </span>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
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
              Calendário
            </NavLink>

            {admin && (
              <NavLink to="/admin" className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border border-[#D4AF37]/50 ${
                  isActive
                    ? 'bg-[#D4AF37] text-slate-900 font-bold shadow-md'
                    : 'bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20'
                }`
              }>
                <Shield className="w-4 h-4 text-[#D4AF37]" />
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
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </button>

            {admin ? (
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {admin.display_name}
                </span>
                <button
                  onClick={onLogout}
                  className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Sair do Painel Admin"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-xs"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Acesso Restrito</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-[var(--color-outline-variant)] text-xs font-medium">
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
            Calendário
          </NavLink>
          {admin && (
            <NavLink to="/admin" className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${isActive ? 'text-[#D4AF37] font-bold' : 'text-slate-500'}`
            }>
              <Shield className="w-4 h-4" />
              Admin
            </NavLink>
          )}
        </div>

      </div>
    </header>
  );
};
