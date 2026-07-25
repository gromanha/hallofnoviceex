import React, { useState } from 'react';
import { Sparkles, BookOpen, X, Shield } from 'lucide-react';
import { useEscapeKey } from '../lib/useEscapeKey';

interface LoginGateProps {
  onLogin: (username: string, password: string) => Promise<void>;
  onClose?: () => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Login do administrador" onClick={onClose}>
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
        <div className="h-1.5 bg-[var(--color-secondary)] w-full" />

        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
            aria-label="Fechar modal de login"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center border border-[var(--color-secondary)] text-[var(--color-secondary)]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-[var(--color-on-surface)]">
                Reitoria – HoN EX
              </h1>
              <p className="text-xs font-sans uppercase tracking-widest text-[var(--color-secondary)] font-bold">
                Painel do Administrador
              </p>
            </div>
          </div>

          <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            Acesse com suas credenciais de administrador para gerenciar eventos e publicar conteúdo no site.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--color-on-surface)] mb-1 font-bold">
                Usuário
              </label>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: admin"
                className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--color-on-surface)] mb-1 font-bold">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {error && (
              <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2 font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-secondary)]" />
              {busy ? 'Autenticando...' : 'Entrar no Painel'}
            </button>
          </form>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full text-xs text-slate-500 hover:underline flex items-center justify-center gap-1"
            >
              <X className="w-3 h-3" /> Voltar ao site público
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
