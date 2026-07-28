import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CalendarPlus, Sparkles, ShieldCheck } from 'lucide-react';

const SPARKLE_PARTICLES = [
  { x: -30, y: -20, delay: 0, duration: 3.2 },
  { x: 25, y: -35, delay: 0.8, duration: 2.8 },
  { x: -15, y: -40, delay: 1.5, duration: 3.5 },
  { x: 35, y: -15, delay: 2.1, duration: 3.0 },
  { x: -25, y: -30, delay: 0.4, duration: 2.6 },
];

export const EmptyCalendarState: React.FC = () => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-7 my-8 sm:my-12"
    >
      <div className="glass border border-dashed border-[var(--color-primary)]/20 rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto relative overflow-hidden">
        {/* Floating Sparkles */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {SPARKLE_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="sparkle-particle absolute left-1/2 top-1/2"
              style={{
                '--drift-x': `${p.x}px`,
                '--drift-y': `${p.y}px`,
                '--sparkle-delay': `${p.delay}s`,
                '--sparkle-duration': `${p.duration}s`,
              } as React.CSSProperties}
            >
              <Sparkles className="w-3 h-3 text-[var(--color-secondary)] opacity-40" />
            </div>
          ))}
        </div>

        <div className="relative z-10">
          <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarPlus className="w-8 h-8 text-[var(--color-primary)]" />
          </div>

          <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--color-on-surface)] mb-2">
            O Calendário Está Vazio
          </h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed mb-6 max-w-sm mx-auto">
            Nenhum evento foi publicado ainda para este mês. Administradores podem cadastrar atividades pelo painel de controle.
          </p>

          <div className="space-y-3 text-left max-w-xs mx-auto mb-6">
            <div className="flex items-start gap-3 p-3 bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-outline)]/30">
              <ShieldCheck className="w-4 h-4 text-[var(--color-secondary)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[var(--color-on-surface)]">Criar o primeiro evento</p>
                <p className="text-[10px] text-[var(--color-on-surface-variant)]">Acesse o painel admin e publique uma atividade acadêmica.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-[var(--color-surface-alt)] rounded-xl border border-[var(--color-outline)]/30">
              <Sparkles className="w-4 h-4 text-[var(--color-tertiary)] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[var(--color-on-surface)]">Disciplinas Mágicas</p>
                <p className="text-[10px] text-[var(--color-on-surface-variant)]">Organize os eventos por magias, táticas, alquimia e rituais.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-[var(--color-primary-deep)] transition-all shadow-md shadow-[var(--color-primary)]/20 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Abrir Painel Admin
          </button>
        </div>
      </div>
    </motion.div>
  );
};
