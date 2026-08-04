import React from 'react';

interface AcademyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function AcademyButton({ variant = 'primary', icon, children, className = '', ...props }: AcademyButtonProps) {
  const base = 'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.97]';

  const variants = {
    primary: `
      bg-[var(--color-primary)] text-white
      hover:bg-[var(--color-primary-deep)] hover:shadow-lg hover:shadow-[var(--color-primary)]/20
      border border-transparent hover:border-[#C9A84C]/30
    `,
    secondary: `
      bg-transparent text-[var(--color-on-surface)]
      border-2 border-[#C9A84C]/40
      hover:bg-[#C9A84C]/10 hover:border-[#C9A84C]/60 hover:shadow-lg hover:shadow-[#C9A84C]/10
    `,
    ghost: `
      bg-transparent text-[var(--color-on-surface-variant)]
      hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-on-surface)]
    `,
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
