import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Sparkles } from 'lucide-react';

export const WelcomeTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('hon_welcome_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setHasDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasDismissed(true);
    localStorage.setItem('hon_welcome_dismissed', 'true');
  };

  if (hasDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-50 max-w-sm"
        >
          <div className="relative bg-[var(--color-surface)] border border-[var(--color-outline)]/50 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none" aria-hidden="true">
              <img src="/svg/ivy-corner.svg" alt="" className="w-full h-full" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-secondary)]/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[var(--color-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-cinzel font-bold text-sm text-[var(--color-on-surface)]">
                    Bem-vindo à Academia!
                  </p>
                  <p className="type-body text-[var(--color-on-surface-variant)] text-sm mt-1">
                    Explore os guias, calendário de eventos e receitas. O conhecimento é a sua maior magia.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <a
                  href="/academia"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary-deep)] transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  Explorar
                </a>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] transition-all"
                >
                  Depois
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-lg text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)] transition-all"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
