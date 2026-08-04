import React from 'react';

interface GoldenBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function GoldenBorder({ children, className = '' }: GoldenBorderProps) {
  return (
    <div
      className={`rounded-2xl golden-border-subtle ${className}`}
    >
      {children}
    </div>
  );
}