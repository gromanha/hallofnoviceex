import React from 'react';
import logoUrl from '@/assets/logo.png';

export const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
    {/* Rune Circle */}
    <div className="relative w-20 h-20">
      {/* Outer ring */}
      <svg
        className="absolute inset-0 w-full h-full rune-circle"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="40" cy="40" r="36" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.2" />
        <circle cx="40" cy="40" r="32" stroke="var(--color-secondary)" strokeWidth="0.3" opacity="0.15" strokeDasharray="4 6" />
        {/* Rune dots */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 40 + 34 * Math.cos(rad);
          const y = 40 + 34 * Math.sin(rad);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill="var(--color-primary)"
              className="rune-dot"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          );
        })}
      </svg>

      {/* Inner ring (counter-rotate) */}
      <svg
        className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rune-circle-reverse"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="28" stroke="var(--color-secondary)" strokeWidth="0.4" opacity="0.2" strokeDasharray="2 8" />
        {[0, 60, 120, 180, 240, 300].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 32 + 28 * Math.cos(rad);
          const y = 32 + 28 * Math.sin(rad);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1"
              fill="var(--color-secondary)"
              className="rune-dot"
              style={{ animationDelay: `${i * 0.4 + 0.1}s` }}
            />
          );
        })}
      </svg>

      {/* Center logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-xl overflow-hidden rune-glow logo-float">
          <img src={logoUrl} alt="" className="w-full h-full object-cover" aria-hidden="true" />
        </div>
      </div>
    </div>

    {/* Loading text */}
    <div className="text-center space-y-1.5">
      <p className="text-xs text-[var(--color-on-surface-variant)] font-medium tracking-[0.15em] uppercase">
        Carregando
      </p>
      <p className="text-[10px] text-[var(--color-secondary)] italic opacity-70">
        Preparando os pergaminhos...
      </p>
    </div>
  </div>
);

export default PageLoader;
