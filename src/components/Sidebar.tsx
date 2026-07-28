import React, { memo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Home, BookOpen, Calendar, UtensilsCrossed, Shield, Moon, Sun, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import logoUrl from '@/assets/logo.png';

interface SidebarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = memo(({ theme, onToggleTheme, onOpenLogin }) => {
  const { admin, onLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all relative ${
      isActive
        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] sidebar-nav-active'
        : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)]'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 text-[10px] transition-colors ${isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-on-surface-variant)]'}`;

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
        bg-[var(--color-surface)] border-r border-[var(--color-outline)]/50 overflow-hidden
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="px-5 py-6 border-b border-[var(--color-outline)]/30 sidebar-brand-shimmer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-outline)] shadow-md shrink-0">
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
            <Home className="w-4 h-4 shrink-0" />
            Início
          </NavLink>

          <NavLink to="/academia" className={linkClass} onClick={() => setMobileOpen(false)}>
            <BookOpen className="w-4 h-4 shrink-0" />
            Códice & Guias
          </NavLink>

          <NavLink to="/calendario" className={linkClass} onClick={() => setMobileOpen(false)}>
            <Calendar className="w-4 h-4 shrink-0" />
            Calendário
          </NavLink>

          <NavLink to="/receitas" className={linkClass} onClick={() => setMobileOpen(false)}>
            <UtensilsCrossed className="w-4 h-4 shrink-0" />
            Receitas
          </NavLink>

          {admin && (
            <NavLink to="/admin" className={linkClass} onClick={() => setMobileOpen(false)}>
              <Shield className="w-4 h-4 shrink-0" />
              Painel Admin
            </NavLink>
          )}
        </nav>

        {/* Footer Actions */}
        <div className="px-3 py-4 border-t border-[var(--color-outline)]/30 space-y-2">
          <button
            onClick={onToggleTheme}
            className="sidebar-theme-toggle flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)] transition-all"
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
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all"
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
          <svg className="sidebar-sigil w-5 h-5 text-[var(--color-outline)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" opacity="0.4" />
            <path d="M12 2 L14 8 L12 6 L10 8 Z" opacity="0.6" />
            <path d="M12 22 L14 16 L12 18 L10 16 Z" opacity="0.6" />
            <path d="M2 12 L8 10 L6 12 L8 14 Z" opacity="0.6" />
            <path d="M22 12 L16 10 L18 12 L16 14 Z" opacity="0.6" />
          </svg>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 px-4 bg-[var(--color-surface)] border-t border-[var(--color-outline)]/50 text-[10px] font-medium" aria-label="Menu de navegação mobile">
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
    </>
  );
});

Sidebar.displayName = 'Sidebar';
