import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookX, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] border-2 border-[var(--color-secondary)]/30 rounded-2xl max-w-md w-full p-8 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto">
          <BookX className="w-8 h-8 text-[var(--color-primary)]" />
        </div>
        <h1 className="text-3xl font-serif font-black text-[var(--color-on-surface)]">
          Página Não Encontrada
        </h1>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Os pergaminhos não contêm registro deste local. Talvez o encantamento tenha desviado seu caminho.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
