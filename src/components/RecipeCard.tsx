import React, { useState, memo } from 'react';
import { Clock, ChefHat, ArrowRight, ImageOff } from 'lucide-react';
import { Recipe } from '../types';
import { getRecipeCategoryColor } from '../lib/colors';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const DIFFICULTY_COLORS = {
  Easy: 'bg-[var(--color-sage)]/10 text-[var(--color-sage)] border-[var(--color-sage)]/20',
  Medium: 'bg-[var(--color-amber)]/10 text-[var(--color-amber)] border-[var(--color-amber)]/20',
  Hard: 'bg-[var(--color-crimson)]/10 text-[var(--color-crimson)] border-[var(--color-crimson)]/20',
};

export const RecipeCard: React.FC<RecipeCardProps> = memo(({ recipe, onClick }) => {
  const [imgError, setImgError] = useState(false);

  const totalTime = [recipe.prep_time, recipe.cook_time].filter(Boolean).join(' + ');

  return (
    <article
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      tabIndex={0}
      role="link"
      className="group relative glass rounded-2xl overflow-hidden border border-[var(--color-outline)]/50 transition-all duration-300 cursor-pointer flex flex-col h-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] card-glow card-shimmer-accent"
    >
      {recipe.cover_image && !imgError && (
        <div className="relative h-48 sm:h-52 overflow-hidden bg-[var(--color-surface-alt)]">
          <img
            src={recipe.cover_image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent" />

          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${DIFFICULTY_COLORS[recipe.difficulty] || DIFFICULTY_COLORS.Easy}`}>
              {recipe.difficulty}
            </span>
          </div>

          {recipe.category && (
            <div className={`absolute bottom-3 left-3 ${getRecipeCategoryColor(recipe.category).bg} ${getRecipeCategoryColor(recipe.category).text} text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg backdrop-blur-md border border-current/20`}>
              {recipe.category.replace('_', ' & ')}
            </div>
          )}
        </div>
      )}

      {recipe.cover_image && imgError && (
        <div className="relative h-28 bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-[var(--color-on-surface-variant)] opacity-30" />
          {recipe.category && (
            <div className={`absolute bottom-3 left-3 ${getRecipeCategoryColor(recipe.category).bg} ${getRecipeCategoryColor(recipe.category).text} text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg backdrop-blur-md border border-current/20`}>
              {recipe.category.replace('_', ' & ')}
            </div>
          )}
        </div>
      )}

      {!recipe.cover_image && (
        <div className="relative h-28 bg-gradient-to-r from-[var(--color-secondary)]/5 to-[var(--color-primary)]/5 flex items-center justify-center">
          <ChefHat className="w-10 h-10 text-[var(--color-on-surface-variant)] opacity-20" />
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-bold text-base text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors mb-2 line-clamp-2 break-words">
            {recipe.title}
          </h3>

          {recipe.regional_cuisine && (
            <p className="text-[10px] text-[var(--color-secondary)] font-bold uppercase tracking-widest mb-2">
              {recipe.regional_cuisine}
            </p>
          )}

          {recipe.description && (
            <p className="text-xs text-[var(--color-on-surface-variant)] mb-4 line-clamp-2 leading-relaxed break-words">
              {recipe.description}
            </p>
          )}
        </div>

        <div className="pt-3 border-t border-[var(--color-outline)]/30 mt-3">
          <div className="flex items-center justify-between text-[10px] text-[var(--color-on-surface-variant)]">
            <div className="flex items-center gap-3">
              {totalTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {totalTime}
                </span>
              )}
              {recipe.yield_text && (
                <span className="flex items-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  {recipe.yield_text}
                </span>
              )}
            </div>

            <span className="text-[var(--color-primary)] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ver <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});

RecipeCard.displayName = 'RecipeCard';
