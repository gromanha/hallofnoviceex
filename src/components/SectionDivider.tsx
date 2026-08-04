import React from 'react';

interface SectionDividerProps {
  variant?: 'gothic' | 'crystal' | 'simple';
  className?: string;
  icon?: React.ReactNode;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  variant = 'gothic',
  className = '',
  icon,
}) => {
  if (variant === 'simple') {
    return (
      <div className={`section-divider ${className}`} aria-hidden="true">
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
    );
  }

  if (variant === 'crystal') {
    return (
      <div className={`flex justify-center py-4 ${className}`} aria-hidden="true">
        <img src="/svg/crystal-divider.svg" alt="" className="w-32 h-8 opacity-40" />
      </div>
    );
  }

  // gothic (default)
  return (
    <div className={`flex justify-center py-6 ${className}`} aria-hidden="true">
      <img src="/svg/gothic-arch-divider.svg" alt="" className="w-48 h-10 opacity-30" />
    </div>
  );
};
