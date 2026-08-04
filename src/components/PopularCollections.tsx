import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Bookmark, ChevronRight } from 'lucide-react';

interface Collection {
  id: number;
  title: string;
  description: string;
  guideCount: number;
  icon: React.ReactNode;
  gradient: string;
}

const collections: Collection[] = [
  {
    id: 1,
    title: 'Guias para Iniciantes',
    description: 'Tudo que você precisa para começar sua jornada em Eorzea',
    guideCount: 15,
    icon: <BookOpen className="w-5 h-5" />,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    id: 2,
    title: 'Endgame & Raids',
    description: 'Estratégias e dicas para o conteúdo de fim de jogo',
    guideCount: 22,
    icon: <Bookmark className="w-5 h-5" />,
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 3,
    title: 'Crafting & Gathering',
    description: 'Domine as artes de criar e coletar recursos',
    guideCount: 18,
    icon: <BookOpen className="w-5 h-5" />,
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 4,
    title: 'PvP & Competitive',
    description: 'Torne-se um guerreiro temido nos campos de batalha',
    guideCount: 9,
    icon: <Bookmark className="w-5 h-5" />,
    gradient: 'from-red-500/20 to-rose-500/20',
  },
];

export const PopularCollections: React.FC = () => {
  return (
    <section className="py-12 bg-[var(--color-surface-alt)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="type-title text-[var(--color-on-surface)]">
              Coleções Populares
            </h2>
            <p className="type-caption text-[var(--color-on-surface-variant)] mt-1">
              Compilações dos melhores guias por tema
            </p>
          </div>
          <button className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors">
            Ver todas
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br border border-[var(--color-outline)]/30 hover:border-[var(--color-primary)]/50 transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/10 cursor-pointer"
              style={{
                background: `linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-alt) 100%)`,
              }}
            >
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-50 group-hover:opacity-70 transition-opacity`} />
              
              {/* Content */}
              <div className="relative p-5">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)]/80 flex items-center justify-center text-[var(--color-primary)] mb-3 group-hover:scale-110 transition-transform">
                  {collection.icon}
                </div>
                
                <h3 className="type-body font-semibold text-[var(--color-on-surface)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                  {collection.title}
                </h3>
                
                <p className="type-caption text-[var(--color-on-surface-variant)] text-sm line-clamp-2 mb-3">
                  {collection.description}
                </p>
                
                <div className="flex items-center gap-2 text-[var(--color-on-surface-variant)]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="type-caption font-medium">
                    {collection.guideCount} guias
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
