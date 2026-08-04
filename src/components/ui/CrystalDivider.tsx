import React from 'react';

interface CrystalDividerProps {
  className?: string;
}

export function CrystalDivider({ className = '' }: CrystalDividerProps) {
  return (
    <div className={`flex items-center justify-center py-4 ${className}`} aria-hidden="true">
      <img
        src="/svg/crystal-divider.svg"
        alt=""
        className="w-48 h-6 crystal-glow"
      />
    </div>
  );
}