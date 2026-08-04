import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Compass } from 'lucide-react';
import { motion } from 'motion/react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        className="rounded-2xl max-w-md w-full p-8 text-center space-y-5 border border-[var(--color-outline)]/50 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-alt)]"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top gold accent */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

        {/* Floating Book with compass */}
        <div className="relative w-24 h-24 mx-auto">
          <motion.div
            className="w-20 h-20 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mx-auto border border-[var(--color-primary)]/20"
            animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <BookOpen className="w-10 h-10 text-[var(--color-primary)]" />
          </motion.div>
          {/* Lost compass */}
          <div className="absolute -bottom-1 -right-2 w-8 h-8 bg-[var(--color-secondary)]/10 rounded-full flex items-center justify-center border border-[var(--color-secondary)]/20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Compass className="w-4 h-4 text-[var(--color-secondary)]" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="font-cinzel font-bold text-xl text-[var(--color-on-surface)]">
            Perdido no Campus
          </h1>
          <p className="type-body text-[var(--color-on-surface-variant)]">
            Os pergaminhos não contêm registro deste local. Talvez o encantamento tenha desviado seu caminho.
          </p>
        </div>

        {/* Sharlayan proverb */}
        <div className="px-4 py-2.5 rounded-xl bg-[var(--color-secondary)]/5 border border-[var(--color-secondary)]/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" aria-hidden="true">
            <img src="/svg/rune-circle.svg" alt="" className="w-full h-full object-contain" />
          </div>
          <p className="text-[11px] text-[var(--color-secondary)] italic relative z-10">
            "Fortuna favet Prudentibus"
          </p>
          <p className="text-[9px] text-[var(--color-on-surface-variant)] mt-0.5 opacity-60 relative z-10">
            — A sorte favorece os preparados
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white type-label normal-case font-bold px-5 py-2.5 rounded-xl cursor-pointer hover:shadow-md hover:shadow-[var(--color-primary)]/20 transition-all active:scale-[0.97]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Início
        </button>
      </motion.div>
    </main>
  );
};

export default NotFoundPage;
