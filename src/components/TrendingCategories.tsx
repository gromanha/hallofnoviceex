import React from 'react';
import { motion } from 'motion/react';
import { Shield, Heart, Sword, Wrench, Pickaxe, Sparkles, Users, Target } from 'lucide-react';

interface Category {
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const categories: Category[] = [
  { name: 'Tank', icon: <Shield className="w-5 h-5" />, count: 24, color: 'var(--color-primary)' },
  { name: 'Healer', icon: <Heart className="w-5 h-5" />, count: 18, color: '#4ade80' },
  { name: 'DPS', icon: <Sword className="w-5 h-5" />, count: 42, color: '#f87171' },
  { name: 'Crafter', icon: <Wrench className="w-5 h-5" />, count: 31, color: '#fbbf24' },
  { name: 'Gatherer', icon: <Pickaxe className="w-5 h-5" />, count: 15, color: '#a78bfa' },
  { name: 'Raids', icon: <Sparkles className="w-5 h-5" />, count: 28, color: '#f472b6' },
  { name: 'Free Company', icon: <Users className="w-5 h-5" />, count: 12, color: 'var(--color-secondary)' },
  { name: 'PvP', icon: <Target className="w-5 h-5" />, count: 9, color: '#fb923c' },
];

export const TrendingCategories: React.FC = () => {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="type-title text-[var(--color-on-surface)]">
              Categorias Populares
            </h2>
            <p className="type-caption text-[var(--color-on-surface-variant)] mt-1">
              Explore guias por classe e atividade
            </p>
          </div>
          <button className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors">
            Ver todas
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline)]/30 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/10"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ backgroundColor: `${category.color}15`, color: category.color }}
              >
                {category.icon}
              </div>
              <div className="text-center">
                <span className="type-label text-[var(--color-on-surface)] block">
                  {category.name}
                </span>
                <span className="type-caption text-[var(--color-on-surface-variant)]">
                  {category.count} guias
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
