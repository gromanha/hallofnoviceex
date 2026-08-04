import React from 'react';

interface FloatingBookProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export function FloatingBook({ size = 48, className = '', animated = true }: FloatingBookProps) {
  return (
    <img
      src="/svg/floating-book.svg"
      alt=""
      className={`${animated ? 'wander-book' : ''} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}