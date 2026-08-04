import React from 'react';
import { BookOpen, MapPin, ChevronUp, ExternalLink } from 'lucide-react';
import logoUrl from '@/assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="relative text-[var(--color-on-surface-variant)] pt-10 pb-8 bg-gradient-to-b from-[var(--color-surface-alt)] via-[var(--color-background)] to-[var(--color-background)]">
      {/* Golden divider line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      {/* Lavender sprig decoration */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none" aria-hidden="true">
        <img src="/svg/lavender-sprig.svg" alt="" className="w-8 h-16" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Coluna 1: Sobre */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#C9A84C]/30">
                <img src={logoUrl} alt="HoN EX" className="w-full h-full object-cover" />
              </div>
              <span className="font-cinzel font-bold tracking-wider text-sm text-[var(--color-on-surface)]">
                HALL OF THE NOVICE <span className="text-[var(--color-primary)]">EX</span>
              </span>
            </div>
            {/* Motto plaque */}
            <div className="p-4 rounded-xl border border-[#C9A84C]/30 bg-[var(--color-surface)]/50 mb-4">
              <p className="font-cormorant italic text-[var(--color-lavender)] text-center">
                "Onde o conhecimento se torna a sua maior magia."
              </p>
            </div>
            <p className="type-body text-[var(--color-on-surface-variant)]">
              Comunidade brasileira de Final Fantasy XIV focada em ensino sem toxicidade, imersão temática acadêmica em Sharlayan e produção de guias de alta didática.
            </p>
          </div>

          {/* Coluna 2: Sede do Campus */}
          <div>
            <h3 className="font-cinzel font-bold text-sm text-[var(--color-on-surface)] mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--color-crystal)]/10 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-crystal)]" />
              </div>
              Campus Físico (FC House)
            </h3>
            <ul className="type-body text-[var(--color-on-surface-variant)] space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-crystal)] mt-1.5 shrink-0" />
                <span><strong className="text-[var(--color-on-surface)]">Mundo:</strong> Behemoth (Primal)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-crystal)] mt-1.5 shrink-0" />
                <span><strong className="text-[var(--color-on-surface)]">Local:</strong> Mist — Ward 19, Plot 35</span>
              </li>
              <li className="flex items-start gap-2 break-words">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-crystal)] mt-1.5 shrink-0" />
                <span><strong className="text-[var(--color-on-surface)]">Instalações:</strong> Grande Biblioteca, Salas Táticas, Refeitório & Observatório</span>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Links e Discord */}
          <div>
            <h3 className="font-cinzel font-bold text-sm text-[var(--color-on-surface)] mb-4 flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--color-primary)]/10 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              </div>
              Matrícula Digital
            </h3>
            <p className="type-body text-[var(--color-on-surface-variant)] mb-4">
              Junte-se a nós pelo Discord oficial para participar dos eventos, learning parties e matricular seu personagem.
            </p>
            <a
              href="https://discord.gg/3XJgrsVUbP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A84C] to-[var(--color-primary)] hover:from-[#d4b85c] hover:to-[var(--color-primary-deep)] text-white type-body font-medium transition-all hover:shadow-lg hover:shadow-[#C9A84C]/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
              Entrar no Discord
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

        </div>

        {/* Copyright — stone inscription */}
        <div className="border-t border-[#C9A84C]/20 pt-6 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 mb-4 px-4 py-2 rounded-xl bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] font-cinzel text-[10px] uppercase tracking-widest hover:bg-[var(--color-primary)] hover:text-white transition-all border border-[#C9A84C]/30 hover:border-[var(--color-primary)]"
            aria-label="Voltar ao topo"
          >
            <ChevronUp className="w-3 h-3" />
            Voltar ao Topo
          </button>
          <p className="font-cinzel text-[10px] tracking-wider text-[var(--color-on-surface-variant)]" style={{ opacity: 0.7 }}>
            © 2026 Hall of the Novice EX — Desenvolvido para a comunidade de Final Fantasy XIV
          </p>
          <p className="mt-1 font-cinzel text-[9px] tracking-wider text-[var(--color-on-surface-variant)]" style={{ opacity: 0.5 }}>
            Todos os direitos de imagem e marca pertencem à Square Enix Co., Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
};