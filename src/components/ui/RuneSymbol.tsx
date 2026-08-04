import React from 'react';

interface RuneSymbolProps {
  symbol?: 'circle' | 'crystal' | 'lavender';
  size?: number;
  className?: string;
}

export function RuneSymbol({ symbol = 'circle', size = 24, className = '' }: RuneSymbolProps) {
  const src = symbol === 'crystal'
    ? '/svg/crystal-divider.svg'
    : symbol === 'lavender'
      ? '/svg/lavender-sprig.svg'
      : '/svg/rune-circle.svg';

  return (
    <img
      src={src}
      alt=""
      className={`sidebar-sigil ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}