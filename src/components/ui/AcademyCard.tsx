import React from 'react';

interface AcademyCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  goldTop?: boolean;
}

export function AcademyCard({ children, className = '', hover = true, goldTop = true }: AcademyCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        border border-[var(--color-outline)]/50
        bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-alt)]
        transition-all duration-300
        ${hover ? 'hover:border-[var(--color-primary)]/30 hover:shadow-[0_8px_24px_rgba(91,164,181,0.12)] hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {/* Top gold accent line */}
      {goldTop && (
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
