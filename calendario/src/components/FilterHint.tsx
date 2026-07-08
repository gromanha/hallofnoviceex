import React from 'react';
import { motion } from 'motion/react';
import { X, Layers, Wand2, Swords, FlaskConical } from 'lucide-react';
import { dismissFilterHint } from '../lib/onboarding';

interface FilterHintProps {
  onDismiss: () => void;
}

export default function FilterHint({ onDismiss }: FilterHintProps) {
  const handleDismiss = () => {
    dismissFilterHint();
    onDismiss();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="mb-4 bg-[#E8F4F4] border border-[#1D6A6A]/20 rounded-xl p-4 relative parchment-texture"
      role="note"
      aria-label="Dica: Filtros de disciplina"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-[#6B7A8A] hover:text-[#3E4A56] p-1 rounded-lg hover:bg-white/50 transition-colors"
        aria-label="Fechar dica"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4 text-[#124949]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#124949] mb-1">
            Filtre por Disciplina
          </p>
          <p className="text-[11px] text-[#6B7A8A] leading-relaxed">
            Use os botões na barra lateral para mostrar apenas eventos de uma disciplina específica — <strong className="text-[#1D6A6A]">Magia</strong>, <strong className="text-[#1D6A6A]">Tática</strong>, <strong className="text-[#1D6A6A]">Alquimia</strong> ou <strong className="text-[#1D6A6A]">Ritual</strong>.
          </p>
          <div className="flex gap-1.5 mt-2">
            <span className="text-[9px] font-caps bg-[#1D6A6A]/10 text-[#1D6A6A] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Wand2 className="w-2.5 h-2.5" /> Magia
            </span>
            <span className="text-[9px] font-caps bg-[#D4AF37]/15 text-[#735C00] px-2 py-0.5 rounded-full flex items-center gap-1">
              <Swords className="w-2.5 h-2.5" /> Tática
            </span>
            <span className="text-[9px] font-caps bg-[#9B8BB4]/15 text-[#9B8BB4] px-2 py-0.5 rounded-full flex items-center gap-1">
              <FlaskConical className="w-2.5 h-2.5" /> Alquimia
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
