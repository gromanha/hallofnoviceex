import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CalendarPlus, Sparkles, ShieldCheck, BookOpen } from 'lucide-react';

export const EmptyCalendarState: React.FC = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-7 my-8 sm:my-12"
    >
      <div className="bg-[var(--color-surface)] border-2 border-dashed border-[#1D6A6A]/20 rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto parchment-texture">
        <div className="w-16 h-16 bg-[#E8F4F4] dark:bg-teal-950/40 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarPlus className="w-8 h-8 text-[#1D6A6A] dark:text-[#4ECDC4]" />
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--color-on-surface)] mb-2">
          O Calendário Está Vazio
        </h3>
        <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-6 max-w-sm mx-auto">
          Nenhum evento foi publicado ainda para este mês. Administradores podem cadastrar atividades pelo painel de controle.
        </p>

        <div className="space-y-3 text-left max-w-xs mx-auto mb-6">
          <div className="flex items-start gap-3 p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-outline-variant)]">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[var(--color-on-surface)]">Criar o primeiro evento</p>
              <p className="text-[11px] text-[var(--color-on-surface-variant)]">Acesse o painel admin e publique uma atividade acadêmica.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-[var(--color-background)] rounded-xl border border-[var(--color-outline-variant)]">
            <Sparkles className="w-5 h-5 text-[#9B8BB4] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[var(--color-on-surface)]">Disciplinas Mágicas</p>
              <p className="text-[11px] text-[var(--color-on-surface-variant)]">Organize os eventos por magias, táticas, alquimia e rituais.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 bg-[#1D6A6A] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-[#2A8A8A] transition-colors shadow-md cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          Abrir Painel Admin
        </button>
      </div>
    </motion.div>
  );
};
