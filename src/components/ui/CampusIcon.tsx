import React from 'react';

interface CampusIconProps {
  variant: 'academia' | 'calendario' | 'receitas' | 'game-data' | 'cristal' | 'livro' | 'lavanda';
  size?: number;
  className?: string;
}

const ICONS: Record<CampusIconProps['variant'], string> = {
  academia: '/svg/floating-book.svg',
  calendario: '/svg/scroll-icon.svg',
  receitas: '/svg/potion-bottle.svg',
  'game-data': '/svg/scroll-icon.svg',
  cristal: '/svg/crystal-formation.svg',
  livro: '/svg/floating-book.svg',
  lavanda: '/svg/lavender-sprig.svg',
};

const SVG_INLINE: Record<CampusIconProps['variant'], React.ReactNode> = {
  academia: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      <path d="M8 8h1" />
      <path d="M15 8h1" />
      <path d="M10 12h1" />
      <path d="M13 12h1" />
    </svg>
  ),
  calendario: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v16H4z" />
      <path d="M4 8h16" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  ),
  receitas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12c0-4 2-8 6-8s6 4 6 8" />
      <ellipse cx="12" cy="12" rx="6" ry="2" />
      <path d="M6 12c0 3 2 6 6 6s6-3 6-6" />
      <path d="M10 4v2" />
      <path d="M14 4v2" />
    </svg>
  ),
  'game-data': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </svg>
  ),
  cristal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l4 8-4 4-4-4z" fill="currentColor" opacity="0.2" />
      <path d="M12 2l4 8-4 4-4-4z" />
      <path d="M8 10l-4 4 4 4" />
      <path d="M16 10l4 4-4 4" />
      <path d="M8 18l4-4 4 4" />
    </svg>
  ),
  livro: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M12 6v6l3-2" />
    </svg>
  ),
  lavanda: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V8" />
      <path d="M8 6c0 0 0-4 4-4s4 4 4 4" />
      <path d="M8 10c0 0 0-4 4-4s4 4 4 4" />
      <path d="M8 14c0 0 0-4 4-4s4 4 4 4" />
      <path d="M10 18c0 0 0-3 2-3s2 3 2 3" />
    </svg>
  ),
};

export function CampusIcon({ variant, size = 24, className = '' }: CampusIconProps) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        {/* Use inline SVG based on variant */}
        {variant === 'academia' && (
          <>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </>
        )}
        {variant === 'calendario' && (
          <>
            <path d="M4 4h16v16H4z" />
            <path d="M4 8h16" />
            <path d="M8 2v4" />
            <path d="M16 2v4" />
          </>
        )}
        {variant === 'receitas' && (
          <>
            <path d="M6 12c0-4 2-8 6-8s6 4 6 8" />
            <ellipse cx="12" cy="12" rx="6" ry="2" />
            <path d="M6 12c0 3 2 6 6 6s6-3 6-6" />
          </>
        )}
        {variant === 'game-data' && (
          <>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </>
        )}
        {variant === 'cristal' && (
          <>
            <path d="M12 2l4 8-4 4-4-4z" fill="currentColor" opacity="0.2" />
            <path d="M12 2l4 8-4 4-4-4z" />
          </>
        )}
        {variant === 'livro' && (
          <>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </>
        )}
        {variant === 'lavanda' && (
          <>
            <path d="M12 22V8" />
            <path d="M8 6c0 0 0-4 4-4s4 4 4 4" />
            <path d="M8 10c0 0 0-4 4-4s4 4 4 4" />
            <path d="M8 14c0 0 0-4 4-4s4 4 4 4" />
          </>
        )}
      </svg>
    </div>
  );
}
