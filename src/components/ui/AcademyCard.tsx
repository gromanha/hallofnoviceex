import React from 'react';

interface AcademyCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function AcademyCard({ children, className = '', hover = true }: AcademyCardProps) {
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        border border-[rgba(201,168,76,0.2)]
        bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-alt)]
        transition-all duration-300
        ${hover ? 'hover:border-[rgba(201,168,76,0.4)] hover:shadow-[0_8px_24px_rgba(201,168,76,0.15)] hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      {/* Top gold accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}