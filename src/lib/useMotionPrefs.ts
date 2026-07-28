import { useReducedMotion } from 'motion/react';

export function useMotionPrefs() {
  const shouldReduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: shouldReduce ? 0 : 16 },
    show: { opacity: 1, y: 0 },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: shouldReduce ? 1 : 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  const slideFromRight = {
    hidden: { opacity: 0, x: shouldReduce ? 0 : 16 },
    show: { opacity: 1, x: 0 },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: shouldReduce ? 0 : 0.08 },
    },
  };

  return { shouldReduce, fadeUp, fadeIn, scaleIn, slideFromRight, staggerContainer };
}
