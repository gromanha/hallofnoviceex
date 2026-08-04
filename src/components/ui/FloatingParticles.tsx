import React from 'react';
import { motion } from 'motion/react';

interface FloatingParticlesProps {
  variant?: 'crystal' | 'golden' | 'book';
  count?: number;
  className?: string;
}

const PARTICLE_CONFIGS = {
  crystal: {
    color: 'var(--color-crystal)',
    size: 'w-2 h-2',
    shadow: 'shadow-[0_0_8px_rgba(91,164,181,0.4)]',
  },
  golden: {
    color: 'var(--color-secondary)',
    size: 'w-1.5 h-1.5',
    shadow: 'shadow-[0_0_6px_rgba(201,168,76,0.3)]',
  },
  book: {
    color: 'var(--color-on-surface-variant)',
    size: 'w-3 h-3',
    shadow: '',
  },
};

export function FloatingParticles({ variant = 'crystal', count = 5, className = '' }: FloatingParticlesProps) {
  const config = PARTICLE_CONFIGS[variant];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${config.size} ${config.shadow}`}
          style={{
            backgroundColor: config.color,
            left: `${15 + (i * 18) % 70}%`,
            top: `${20 + (i * 13) % 60}%`,
          }}
          animate={{
            y: [0, -15 - (i * 3), 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 3 + (i * 0.5),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}
