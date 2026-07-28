import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookX, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass rounded-2xl max-w-md w-full p-8 text-center space-y-5 border border-[var(--color-outline)]/50">
        <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto">
          <BookX className="w-8 h-8 text-[var(--color-primary)]" />
        </div>
        <h1 className="type-headline text-[var(--color-on-surface)]">
          Página Não Encontrada
        </h1>
        <p className="type-body text-[var(--color-on-surface-variant)]">
          Os pergaminhos não contêm registro deste local. Talvez o encantamento tenha desviado seu caminho.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white type-label normal-case font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:shadow-md hover:shadow-[var(--color-primary)]/20 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </button>
      </div>
    </main>
  );
};

export default NotFoundPage;
