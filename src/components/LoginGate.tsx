import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useEscapeKey } from '../lib/useEscapeKey';
import logoUrl from '@/assets/logo.png';

interface LoginGateProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onClose?: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onLogin(username.trim(), password);
      if (onClose) onClose();
    } catch (err: any) {
      setError(
        err?.status === 401
          ? 'Usuário ou senha incorretos. Tente novamente.'
          : err?.message || 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setBusy(false);
    }
  }

  useEscapeKey(() => onClose?.(), !!onClose);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-background)]/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Login do administrador"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        ref={modalRef}
        className="glass rounded-2xl w-full max-w-md border border-[var(--color-outline)]/50 shadow-2xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] w-full" />

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)]"
            aria-label="Fechar modal de login"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[var(--color-outline)]">
              <img src={logoUrl} alt="HoN EX" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-[var(--color-on-surface)]">
                Reitoria – HoN EX
              </h1>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[var(--color-primary)] font-bold">
                Painel do Administrador
              </p>
            </div>
          </div>

          <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
            Acesse com suas credenciais de administrador para gerenciar eventos e publicar conteúdo no site.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1 font-bold">
                Usuário
              </label>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: admin"
                className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-outline)]/50 rounded-xl px-4 py-2.5 text-xs text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-1 font-bold">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--color-surface-alt)] border border-[var(--color-outline)]/50 rounded-xl px-4 py-2.5 text-xs text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {error && (
              <div className="text-[10px] text-[var(--color-crimson)] bg-[var(--color-crimson)]/10 border border-[var(--color-crimson)]/20 rounded-lg px-3 py-2 font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md shadow-[var(--color-primary)]/20 flex items-center justify-center gap-2"
            >
              {busy ? 'Autenticando...' : 'Entrar no Painel'}
            </button>
          </form>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full text-[10px] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] flex items-center justify-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Voltar ao site público
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
