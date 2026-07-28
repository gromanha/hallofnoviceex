import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Calendar, UtensilsCrossed, Shield, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import logoUrl from '@/assets/logo.png';

interface SidebarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = memo(({ theme, onToggleTheme }) => {
  const { admin, onLogout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
      isActive
        ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border-l-2 border-[var(--color-primary)]'
        : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)]'
    }`;

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] bg-[var(--color-surface)] border-r border-[var(--color-outline)]/50 overflow-hidden">
      {/* Brand */}
      <div className="px-5 py-6 border-b border-[var(--color-outline)]/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[var(--color-outline)] shadow-md shrink-0">
            <img src={logoUrl} alt="HoN EX" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="font-display font-bold tracking-wider text-xs text-[var(--color-on-surface)] block leading-none truncate">
              HALL OF THE NOVICE <span className="text-[var(--color-primary)]">EX</span>
            </span>
            <span className="font-sans text-[10px] tracking-widest text-[var(--color-on-surface-variant)] uppercase block mt-1">
              Majestic Battle Academy
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll" aria-label="Menu lateral">
        <NavLink to="/" end className={linkClass}>
          <Home className="w-4 h-4 shrink-0" />
          Início
        </NavLink>

        <NavLink to="/academia" className={linkClass}>
          <BookOpen className="w-4 h-4 shrink-0" />
          Códice & Guias
        </NavLink>

        <NavLink to="/calendario" className={linkClass}>
          <Calendar className="w-4 h-4 shrink-0" />
          Calendário
        </NavLink>

        <NavLink to="/receitas" className={linkClass}>
          <UtensilsCrossed className="w-4 h-4 shrink-0" />
          Receitas
        </NavLink>

        {admin && (
          <NavLink to="/admin" className={linkClass}>
            <Shield className="w-4 h-4 shrink-0" />
            Painel Admin
          </NavLink>
        )}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 py-4 border-t border-[var(--color-outline)]/30 space-y-2">
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)] transition-all"
          title="Alternar Tema"
          aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 shrink-0" /> : <Sun className="w-4 h-4 shrink-0 text-[var(--color-amber)]" />}
          {theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
        </button>

        {admin && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--color-crimson)] hover:bg-[var(--color-crimson)]/10 transition-all"
            title="Sair"
            aria-label="Sair do painel administrativo"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sair
          </button>
        )}
      </div>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';
