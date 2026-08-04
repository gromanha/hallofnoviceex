import React from 'react';

interface MagicalBorderProps {
  children: React.ReactNode;
  variant?: 'simple' | 'ornate' | 'crystal';
  className?: string;
}

export function MagicalBorder({ children, variant = 'simple', className = '' }: MagicalBorderProps) {
  const borderStyles = {
    simple: `
      border border-[#C9A84C]/20
      hover:border-[#C9A84C]/40
    `,
    ornate: `
      border-2 border-[#C9A84C]/30
      hover:border-[#C9A84C]/50
      relative
    `,
    crystal: `
      border border-[var(--color-primary)]/20
      hover:border-[var(--color-primary)]/40
      shadow-[0_0_0_1px_rgba(91,164,181,0.1)]
      hover:shadow-[0_0_0_1px_rgba(91,164,181,0.2)]
    `,
  };

  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-alt)]
        transition-all duration-300
        ${borderStyles[variant]}
        ${className}
      `}
    >
      {/* Corner ivy ornaments for ornate variant */}
      {variant === 'ornate' && (
        <>
          <img
            src="/svg/ivy-corner.svg"
            alt=""
            className="absolute top-0 left-0 w-8 h-8 opacity-30 pointer-events-none"
            aria-hidden="true"
          />
          <img
            src="/svg/ivy-corner.svg"
            alt=""
            className="absolute top-0 right-0 w-8 h-8 opacity-30 pointer-events-none -scale-x-100"
            aria-hidden="true"
          />
          <img
            src="/svg/ivy-corner.svg"
            alt=""
            className="absolute bottom-0 left-0 w-8 h-8 opacity-30 pointer-events-none -scale-y-100"
            aria-hidden="true"
          />
          <img
            src="/svg/ivy-corner.svg"
            alt=""
            className="absolute bottom-0 right-0 w-8 h-8 opacity-30 pointer-events-none -scale-x-100 -scale-y-100"
            aria-hidden="true"
          />
        </>
      )}

      {/* Top gold accent for simple */}
      {variant === 'simple' && (
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
