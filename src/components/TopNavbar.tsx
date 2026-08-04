import React, { memo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, LogOut, ShieldCheck, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import logoUrl from '@/assets/logo.png';

interface TopNavbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenLogin?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = memo(({ theme, onToggleTheme, onOpenLogin }) => {
  const { admin, onLogout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all ${
      isActive
        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
        : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-outline)]/30 shadow-[0_2px_8px_rgba(45,52,54,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-[#C9A84C]/30 shadow-md">
              <img src={logoUrl} alt="HoN EX" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:block">
              <span className="font-cinzel font-bold tracking-wider text-xs text-[var(--color-on-surface)] block leading-none">
                HALL OF THE NOVICE <span className="text-[var(--color-primary)]">EX</span>
              </span>
              <span className="font-sans text-[9px] tracking-widest text-[var(--color-secondary)] uppercase block mt-0.5">
                Majestic Battle Academy
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Menu principal">
            <NavLink to="/" end className={linkClass}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 21V9l8-6 8 6v12" />
                <path d="M9 21v-6h6v6" />
              </svg>
              Início
            </NavLink>

            <NavLink to="/academia" className={linkClass}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              Códice & Guias
            </NavLink>

            <NavLink to="/calendario" className={linkClass}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16v16H4z" />
                <path d="M4 8h16" />
                <path d="M8 2v4" />
                <path d="M16 2v4" />
              </svg>
              Calendário
            </NavLink>

            <NavLink to="/receitas" className={linkClass}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 12c0-4 2-8 6-8s6 4 6 8" />
                <ellipse cx="12" cy="12" rx="6" ry="2" />
                <path d="M6 12c0 3 2 6 6 6s6-3 6-6" />
              </svg>
              Receitas
            </NavLink>

            {admin && (
              <NavLink to="/admin" className={linkClass}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" />
                  <path d="M9 18v3h6v-3" />
                </svg>
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)] transition-all"
              title={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
              aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
            >
              <motion.div
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-[var(--color-amber)]" />}
              </motion.div>
            </button>

            {/* Login/Logout */}
            {admin ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--color-crimson)] hover:bg-[var(--color-crimson)]/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all border border-[var(--color-primary)]/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] transition-all"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[var(--color-outline)]/30 bg-[var(--color-surface)]"
          >
            <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1" aria-label="Menu mobile">
              <NavLink to="/" end className={linkClass} onClick={() => setMobileOpen(false)}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 21V9l8-6 8 6v12" />
                  <path d="M9 21v-6h6v6" />
                </svg>
                Início
              </NavLink>

              <NavLink to="/academia" className={linkClass} onClick={() => setMobileOpen(false)}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Códice & Guias
              </NavLink>

              <NavLink to="/calendario" className={linkClass} onClick={() => setMobileOpen(false)}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v16H4z" />
                  <path d="M4 8h16" />
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                </svg>
                Calendário
              </NavLink>

              <NavLink to="/receitas" className={linkClass} onClick={() => setMobileOpen(false)}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 12c0-4 2-8 6-8s6 4 6 8" />
                  <ellipse cx="12" cy="12" rx="6" ry="2" />
                  <path d="M6 12c0 3 2 6 6 6s6-3 6-6" />
                </svg>
                Receitas
              </NavLink>

              {admin && (
                <NavLink to="/admin" className={linkClass} onClick={() => setMobileOpen(false)}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" />
                    <path d="M9 18v3h6v-3" />
                  </svg>
                  Admin
                </NavLink>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

TopNavbar.displayName = 'TopNavbar';
