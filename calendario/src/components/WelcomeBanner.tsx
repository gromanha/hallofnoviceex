import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, X, Sparkles, Calendar, ShieldCheck } from 'lucide-react';
import { dismissWelcome } from '../lib/onboarding';

interface WelcomeBannerProps {
  onDismiss: () => void;
}

export default function WelcomeBanner({ onDismiss }: WelcomeBannerProps) {
  const handleDismiss = () => {
    dismissWelcome();
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 bg-gradient-to-br from-[#124949] to-[#1D6A6A] rounded-2xl p-5 sm:p-6 border border-[#D4AF37]/30 shadow-lg relative overflow-hidden"
      role="region"
      aria-label="Boas-vindas ao Calendário"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#9B8BB4] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-[#E8F4F4]/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors z-10"
        aria-label="Fechar boas-vindas"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-[#124949]" />
          </div>
          <div>
            <h2 className="font-cinzel text-lg sm:text-xl font-bold text-white leading-tight">
              Bem-vindo ao Calendário HoN
            </h2>
            <p className="text-[10px] font-caps text-[#D4AF37] uppercase tracking-widest">
              Hall of the Novice EX
            </p>
          </div>
        </div>

        <p className="text-sm text-[#E8F4F4] leading-relaxed mb-4 max-w-lg">
          Aqui você encontra todas as atividades acadêmicas da guild — aulas de magia, sessões de tática, alquimia e rituais. Selecione um dia para ver os eventos ou use os filtros por disciplina.
        </p>

        <div className="flex flex-wrap gap-2 text-[10px] font-caps text-[#E8F4F4]/80">
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
            <Calendar className="w-3 h-3 text-[#D4AF37]" />
            Navegue pelo mês
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            Filtre por disciplina
          </span>
          <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
            Crie eventos no admin
          </span>
        </div>
      </div>
    </motion.div>
  );
}
