import React from 'react';
import { MessageSquare, BookOpen, MapPin, ChevronUp, ExternalLink } from 'lucide-react';
import logoUrl from '@/assets/logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[var(--color-background)] text-[var(--color-on-surface-variant)] border-t-4 border-[var(--color-secondary)] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Coluna 1: Sobre */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[var(--color-secondary)]">
                <img src={logoUrl} alt="HoN EX" className="w-full h-full object-cover" />
              </div>
              <span className="font-serif font-bold text-lg text-[var(--color-on-surface)] tracking-wider">
                HALL OF THE NOVICE <span className="text-[var(--color-secondary)]">EX</span>
              </span>
            </div>
            <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed mb-4">
              Comunidade brasileira de Final Fantasy XIV focada em ensino sem toxicidade, imersão temática acadêmica em Sharlayan e produção de guias de alta didática.
            </p>
            <p className="text-xs text-[var(--color-secondary)] font-serif italic">
              "Onde o conhecimento se torna a sua maior magia."
            </p>
          </div>

          {/* Coluna 2: Sede do Campus */}
          <div>
            <h3 className="font-serif text-[var(--color-on-surface)] font-bold text-base mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--color-secondary)]" />
              Campus Físico (FC House)
            </h3>
            <ul className="text-sm text-[var(--color-on-surface-variant)] space-y-2">
              <li><strong className="text-[var(--color-on-surface)]">Mundo:</strong> Behemoth (Primal)</li>
              <li><strong className="text-[var(--color-on-surface)]">Local:</strong> Mist — Ward 19, Plot 35</li>
              <li className="break-words"><strong className="text-[var(--color-on-surface)]">Instalações:</strong> Grande Biblioteca, Salas Táticas, Refeitório & Observatório</li>
            </ul>
          </div>

          {/* Coluna 3: Links e Discord */}
          <div>
            <h3 className="font-serif text-[var(--color-on-surface)] font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--color-secondary)]" />
              Matrícula Digital
            </h3>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">
              Junte-se a nós pelo Discord oficial para participar dos eventos, learning parties e matricular seu personagem.
            </p>
            <a
              href="https://discord.gg/3XJgrsVUbP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-medium text-sm transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              Entrar no Discord Oficial
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>

        </div>

        <div className="border-t border-[var(--color-outline-variant)] pt-6 text-center text-xs text-[var(--color-on-surface-variant)]">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-wider hover:bg-[var(--color-primary)] hover:text-white transition-all"
            aria-label="Voltar ao topo"
          >
            <ChevronUp className="w-3 h-3" />
            Voltar ao Topo
          </button>
          <p>© 2026 Hall of the Novice EX. Desenvolvido para a comunidade de Final Fantasy XIV.</p>
          <p className="mt-1">Todos os direitos de imagem e marca pertencem à Square Enix Co., Ltd.</p>
        </div>
      </div>
    </footer>
  );
};
