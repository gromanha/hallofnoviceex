import React from 'react';
import { motion } from 'motion/react';
import { CalendarPlus, Sparkles, ShieldCheck, BookOpen } from 'lucide-react';

export default function EmptyCalendarState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-7 my-8 sm:my-12"
    >
      <div className="bg-[#FAF6ED] border-2 border-dashed border-[#1D6A6A]/20 rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto parchment-texture">
        <div className="w-16 h-16 bg-[#E8F4F4] rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarPlus className="w-8 h-8 text-[#1D6A6A]" />
        </div>

        <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#124949] mb-2">
          O Calendário Está Vazio
        </h3>
        <p className="text-sm text-[#6B7A8A] leading-relaxed mb-6 max-w-sm mx-auto">
          Nenhum evento foi publicado ainda. Os organizadores da guild podem criar atividades acadêmicas pelo painel administrativo.
        </p>

        <div className="space-y-3 text-left max-w-xs mx-auto">
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-[rgba(29,106,106,0.1)]">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#124949]">Criar o primeiro evento</p>
              <p className="text-[11px] text-[#6B7A8A]">Acesse o painel admin e publique uma atividade para o servidor.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-[rgba(29,106,106,0.1)]">
            <Sparkles className="w-5 h-5 text-[#9B8BB4] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#124949]">Personalize as disciplinas</p>
              <p className="text-[11px] text-[#6B7A8A]">Crie tipos de atividade (magia, tática, alquimia, ritual) para organizar seus eventos.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-xl border border-[rgba(29,106,106,0.1)]">
            <BookOpen className="w-5 h-5 text-[#1D6A6A] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-[#124949]">Divulgue na comunidade</p>
              <p className="text-[11px] text-[#6B7A8A]">Compartilhe o link do calendário no Discord para que todos vejam.</p>
            </div>
          </div>
        </div>

        <a
          href="#/admin"
          className="inline-flex items-center gap-2 mt-6 bg-[#1D6A6A] text-white text-xs font-caps tracking-widest uppercase px-5 py-2.5 rounded-xl hover:bg-[#124949] transition-colors no-underline"
        >
          <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
          Abrir Painel Admin
        </a>
      </div>
    </motion.div>
  );
}
