import React from 'react';
import { Sparkles } from 'lucide-react';

export const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-deep)] flex items-center justify-center animate-pulse">
      <Sparkles className="w-6 h-6 text-[var(--color-secondary)]" />
    </div>
    <p className="text-sm text-[var(--color-on-surface-variant)] font-medium tracking-wide">
      Carregando...
    </p>
  </div>
);

export default PageLoader;
