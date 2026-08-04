import React from 'react';

interface ParchmentBackgroundProps {
  variant?: 'light' | 'dark';
  children: React.ReactNode;
  className?: string;
}

export function ParchmentBackground({ variant = 'light', children, className = '' }: ParchmentBackgroundProps) {
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        ${variant === 'light'
          ? 'bg-gradient-to-br from-[#F5F0E8] to-[#EDE7DB]'
          : 'bg-gradient-to-br from-[#232A3B] to-[#1A1F2E]'
        }
        border border-[rgba(201,168,76,0.2)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}