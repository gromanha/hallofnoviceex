import React from 'react';
import { MessageSquare, Sparkles, BookOpen, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121921] text-slate-300 border-t-4 border-[#D4AF37] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Coluna 1: Sobre */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#1D6A6A] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-lg text-white tracking-wider">
                HALL OF THE NOVICE <span className="text-[#D4AF37]">EX</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Comunidade brasileira de Final Fantasy XIV focada em ensino sem toxicidade, imersão temática acadêmica em Sharlayan e produção de guias de alta didática.
            </p>
            <p className="text-xs text-[#D4AF37] font-serif italic">
              "Onde o conhecimento se torna a sua maior magia."
            </p>
          </div>

          {/* Coluna 2: Sede do Campus */}
          <div>
            <h3 className="font-serif text-white font-bold text-base mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              Campus Físico (FC House)
            </h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li><strong className="text-slate-200">Mundo:</strong> Behemoth (Primal)</li>
              <li><strong className="text-slate-200">Local:</strong> Mist — Ward 19, Plot 35</li>
              <li><strong className="text-slate-200">Instalações:</strong> Grande Biblioteca, Salas Táticas, Refeitório & Observatório</li>
            </ul>
          </div>

          {/* Coluna 3: Links e Discord */}
          <div>
            <h3 className="font-serif text-white font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#D4AF37]" />
              Matrícula Digital
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Junte-se a nós pelo Discord oficial para participar dos eventos, learning parties e matricular seu personagem.
            </p>
            <a
              href="https://discord.gg/3XJgrsVUbP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D6A6A] hover:bg-[#2A8A8A] text-white font-medium text-sm transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              Entrar no Discord Oficial
            </a>
          </div>

        </div>

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          <p>© 2026 Hall of the Novice EX. Desenvolvido para a comunidade de Final Fantasy XIV.</p>
          <p className="mt-1">Todos os direitos de imagem e marca pertencem à Square Enix Co., Ltd.</p>
        </div>
      </div>
    </footer>
  );
};
