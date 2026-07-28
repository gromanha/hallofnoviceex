import React from 'react';
import logoUrl from '@/assets/logo.png';

export const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 rounded-xl overflow-hidden animate-pulse opacity-60">
      <img src={logoUrl} alt="HoN EX" className="w-full h-full object-cover" />
    </div>
    <p className="text-xs text-[var(--color-on-surface-variant)] font-medium tracking-wider uppercase">
      Carregando...
    </p>
  </div>
);

export default PageLoader;
