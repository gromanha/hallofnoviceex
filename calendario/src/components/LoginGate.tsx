import React, { useState } from 'react';
import { Sparkles, BookOpen, X } from 'lucide-react';

interface LoginGateProps {
  onLogin: (username: string, password: string) => Promise<void>;
}

export default function LoginGate({ onLogin }: LoginGateProps) {
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
    } catch (err: any) {
      setError(
        err?.status === 401
          ? 'Credenciais invalidas.'
          : err?.message || 'Falha ao autenticar.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#fcf9f0] flex items-center justify-center p-4">
      <div className="bg-[#fcf9f0] border-2 border-[#735c00] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-[#735c00] w-full" />

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#fed65b] flex items-center justify-center border border-[#735c00]">
              <BookOpen className="w-6 h-6 text-[#241a00]" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#002446]">Reitoria – HoN EX</h1>
              <p className="text-xs font-caps uppercase tracking-widest text-[#735c00]">
                Painel do Administrador
              </p>
            </div>
          </div>

          <p className="text-sm text-[#43474e]">
            Acesse com suas credenciais para gerenciar as atividades acadêmicas publicadas no calendário.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                Usuário
              </label>
              <input
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
              />
            </div>

            {error && (
              <div className="text-xs text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-[#002446] hover:brightness-110 disabled:opacity-50 text-white text-xs font-caps uppercase tracking-widest px-6 py-3 rounded-xl transition-all shadow border border-[#abc8f5]/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#fed65b]" />
              {busy ? 'Autenticando...' : 'Entrar no Painel'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => (window.location.hash = '#/')}
            className="w-full text-xs text-[#735c00] hover:underline flex items-center justify-center gap-1"
          >
            <X className="w-3 h-3" /> Voltar para o calendário público
          </button>
        </div>
      </div>
    </div>
  );
}
