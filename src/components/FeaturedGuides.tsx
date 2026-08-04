import React from 'react';
import { motion } from 'motion/react';
import { Eye, Clock, Star } from 'lucide-react';

interface Guide {
  id: number;
  title: string;
  author: string;
  avatar: string;
  views: string;
  rating: number;
  isNew?: boolean;
}

const guides: Guide[] = [
  {
    id: 1,
    title: 'Guia Completo de Raids - Eden',
    author: 'Alphinaud',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alphinaud',
    views: '12.5K',
    rating: 4.9,
  },
  {
    id: 2,
    title: 'Crafting Level 1-80 Rápido',
    author: 'Tataru',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tataru',
    views: '8.2K',
    rating: 4.8,
    isNew: true,
  },
  {
    id: 3,
    title: 'DPS Rotation - Black Mage',
    author: 'Y\'shtola',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yshtola',
    views: '15.1K',
    rating: 4.7,
  },
  {
    id: 4,
    title: 'Farm de Gil Eficiente',
    author: 'Urianger',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Urianger',
    views: '6.8K',
    rating: 4.6,
  },
];

export const FeaturedGuides: React.FC = () => {
  return (
    <section className="py-12 bg-[var(--color-surface-alt)]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="type-title text-[var(--color-on-surface)]">
              Guias em Destaque
            </h2>
            <p className="type-caption text-[var(--color-on-surface-variant)] mt-1">
              Conteúdo mais viewed pela comunidade
            </p>
          </div>
          <button className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors">
            Ver todos
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guides.map((guide, index) => (
            <motion.div
              key={guide.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group relative p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline)]/30 hover:border-[var(--color-primary)]/50 transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/10 cursor-pointer"
            >
              {guide.isNew && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-white text-[10px] font-bold uppercase">
                  Novo
                </span>
              )}
              
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={guide.avatar}
                  alt={guide.author}
                  className="w-10 h-10 rounded-full border-2 border-[var(--color-outline)]/30"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="type-body font-semibold text-[var(--color-on-surface)] line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {guide.title}
                  </h3>
                  <p className="type-caption text-[var(--color-on-surface-variant)] mt-0.5">
                    por {guide.author}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[var(--color-on-surface-variant)]">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="type-caption">{guide.views}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[var(--color-amber)] fill-[var(--color-amber)]" />
                  <span className="type-caption font-medium">{guide.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
