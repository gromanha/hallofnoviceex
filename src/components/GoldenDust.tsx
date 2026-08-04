import React, { useMemo } from 'react';

interface GoldenDustProps {
  count?: number;
  className?: string;
}

export function GoldenDust({ count = 12, className = '' }: GoldenDustProps) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${4 + Math.random() * 6}s`,
      animationDelay: `${Math.random() * 5}s`,
      size: `${1 + Math.random() * 2}px`,
      opacity: 0.2 + Math.random() * 0.3,
    }));
  }, [count]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            bottom: '-4px',
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, #C9A84C 0%, rgba(201, 168, 76, 0) 70%)`,
            opacity: p.opacity,
            animation: `dustFloat ${p.animationDuration} ease-in-out ${p.animationDelay} infinite`,
          }}
        />
      ))}
    </div>
  );
}