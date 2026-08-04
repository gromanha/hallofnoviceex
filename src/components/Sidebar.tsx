import React, { memo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { FCCard } from './FCCard';
import type { UseLodestoneFCReturn } from '../lib/useLodestoneFC';
import logoUrl from '@/assets/logo.png';

interface SidebarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenLogin?: () => void;
  lodestone?: UseLodestoneFCReturn;
}

export const Sidebar: React.FC<SidebarProps> = memo(({ theme, onToggleTheme, onOpenLogin, lodestone }) => {
  const { admin, onLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
      isActive
        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] sidebar-nav-active'
        : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)] hover:shadow-sm'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 text-[10px] transition-colors ${isActive ? 'text-[var(--color-secondary)] font-bold' : 'text-[var(--color-on-surface-variant)]'}`;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline)]/50 shadow-lg text-[var(--color-on-surface)]"
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 lg:z-auto
        flex flex-col w-64 shrink-0 h-screen
        bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-alt)] border-r border-[var(--color-outline)]/50 overflow-hidden
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Golden ornamental border - top */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" aria-hidden="true" />

        {/* Brand */}
        <div className="px-5 py-6 border-b border-[var(--color-outline)]/30 sidebar-brand-shimmer">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#C9A84C]/30 shadow-md shrink-0">
              <img src={logoUrl} alt="HoN EX" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="font-display font-bold tracking-wider text-xs text-[var(--color-on-surface)] block leading-none truncate">
                HALL OF THE NOVICE <span className="text-[var(--color-primary)]">EX</span>
              </span>
              <span className="font-sans text-[10px] tracking-widest text-[var(--color-secondary)] uppercase block mt-1">
                Majestic Battle Academy
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll" aria-label="Menu lateral">
          <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 21V9l8-6 8 6v12" />
              <path d="M9 21v-6h6v6" />
              <path d="M3 9h18" />
              <rect x="8" y="11" width="2" height="2" fill="currentColor" opacity="0.5" />
              <rect x="14" y="11" width="2" height="2" fill="currentColor" opacity="0.5" />
            </svg>
            Início
          </NavLink>

          <NavLink to="/academia" className={linkClass} onClick={() => setMobileOpen(false)}>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              <path d="M8 8h1" />
              <path d="M15 8h1" />
              <path d="M10 12h1" />
              <path d="M13 12h1" />
              <circle cx="8" cy="8" r="0.5" fill="currentColor" opacity="0.6" />
              <circle cx="15" cy="8" r="0.5" fill="currentColor" opacity="0.6" />
            </svg>
            Códice & Guias
          </NavLink>

          <NavLink to="/calendario" className={linkClass} onClick={() => setMobileOpen(false)}>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v16H4z" />
              <path d="M4 8h16" />
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.4" />
              <path d="M12 14v-1" />
              <path d="M12 14h1" />
            </svg>
            Calendário
          </NavLink>

          <NavLink to="/receitas" className={linkClass} onClick={() => setMobileOpen(false)}>
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 12c0-4 2-8 6-8s6 4 6 8" />
              <ellipse cx="12" cy="12" rx="6" ry="2" />
              <path d="M6 12c0 3 2 6 6 6s6-3 6-6" />
              <path d="M10 4v2" />
              <path d="M14 4v2" />
              <circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.4" />
            </svg>
            Receitas
          </NavLink>

          {admin && (
            <NavLink to="/admin" className={linkClass} onClick={() => setMobileOpen(false)}>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="currentColor" opacity="0.1" />
                <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" />
                <path d="M9 18v3h6v-3" />
              </svg>
              Painel Admin
            </NavLink>
          )}
        </nav>

        {/* FC Card — desktop only */}
        {lodestone && (
          <div className="hidden lg:block border-t border-[var(--color-outline)]/30 pt-3">
            <FCCard lodestone={lodestone} />
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-3 py-4 border-t border-[var(--color-outline)]/30 space-y-2">
          <button
            onClick={onToggleTheme}
            className="sidebar-theme-toggle flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)] transition-all border border-[#C9A84C]/20 hover:border-[#C9A84C]/40"
            title="Alternar Tema"
            aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'light' ? <Moon className="w-4 h-4 shrink-0" /> : <Sun className="w-4 h-4 shrink-0 text-[var(--color-amber)]" />}
            {theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
          </button>

          {admin ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-crimson)] hover:bg-[var(--color-crimson)]/10 transition-all"
              title="Sair"
              aria-label="Sair do painel administrativo"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sair
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40"
              title="Fazer login"
              aria-label="Fazer login no painel administrativo"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Admin Login
            </button>
          )}
        </div>

        {/* Arcane Flourish */}
        <div className="px-5 py-3 flex justify-center" aria-hidden="true">
          <img src="/svg/rune-circle.svg" alt="" className="sidebar-sigil w-8 h-8 opacity-30" />
        </div>

        {/* Golden ornamental border - bottom */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" aria-hidden="true" />
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 px-4 bg-[var(--color-surface)] border-t-2 border-t-[#C9A84C]/20 text-[10px] font-medium" aria-label="Menu de navegação mobile">
        <NavLink to="/" end className={mobileLinkClass}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21V9l8-6 8 6v12" />
            <path d="M9 21v-6h6v6" />
          </svg>
          Início
        </NavLink>
        <NavLink to="/academia" className={mobileLinkClass}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Códice
        </NavLink>
        <NavLink to="/calendario" className={mobileLinkClass}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z" />
            <path d="M4 8h16" />
            <path d="M8 2v4" />
            <path d="M16 2v4" />
          </svg>
          Calendário
        </NavLink>
        <NavLink to="/receitas" className={mobileLinkClass}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12c0-4 2-8 6-8s6 4 6 8" />
            <ellipse cx="12" cy="12" rx="6" ry="2" />
            <path d="M6 12c0 3 2 6 6 6s6-3 6-6" />
          </svg>
          Receitas
        </NavLink>
        {admin && (
          <NavLink to="/admin" className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'text-[var(--color-secondary)] font-bold' : 'text-[var(--color-on-surface-variant)]'}`
          }>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" />
              <path d="M9 18v3h6v-3" />
            </svg>
            Painel
          </NavLink>
        )}
      </nav>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
