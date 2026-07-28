import React, { useState, memo } from 'react';
import { Clock, ChefHat, ArrowRight, ImageOff } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
}

const DIFFICULTY_COLORS = {
  Easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Hard: 'bg-red-100 text-red-700 border-red-200',
};

export const RecipeCard: React.FC<RecipeCardProps> = memo(({ recipe, onClick }) => {
  const [imgError, setImgError] = useState(false);

  const totalTime = [recipe.prep_time, recipe.cook_time].filter(Boolean).join(' + ');

  return (
    <article
      onClick={onClick}
      className="group relative bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)] hover:border-[var(--color-secondary)]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col h-full"
    >
      {recipe.cover_image && !imgError && (
        <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-900">
          <img
            src={recipe.cover_image}
            alt={recipe.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${DIFFICULTY_COLORS[recipe.difficulty] || DIFFICULTY_COLORS.Easy}`}>
              {recipe.difficulty}
            </span>
          </div>

          {recipe.category && (
            <div className="absolute bottom-3 left-3 bg-[var(--color-primary)]/90 text-white text-xs font-semibold uppercase px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
              {recipe.category.replace('_', ' & ')}
            </div>
          )}
        </div>
      )}

      {recipe.cover_image && imgError && (
        <div className="relative h-32 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-slate-400" />
          {recipe.category && (
            <div className="absolute bottom-3 left-3 bg-[var(--color-primary)]/90 text-white text-xs font-semibold uppercase px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
              {recipe.category.replace('_', ' & ')}
            </div>
          )}
        </div>
      )}

      {!recipe.cover_image && (
        <div className="relative h-24 bg-gradient-to-r from-[var(--color-secondary)]/10 to-[var(--color-primary)]/10 flex items-center justify-center">
          <ChefHat className="w-10 h-10 text-[var(--color-secondary)]/40" />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-crystal)] transition-colors mb-2 line-clamp-2 break-words">
            {recipe.title}
          </h3>

          {recipe.regional_cuisine && (
            <p className="text-xs text-[var(--color-on-secondary-deep)] font-semibold uppercase tracking-wider mb-2">
              {recipe.regional_cuisine}
            </p>
          )}

          {recipe.description && (
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4 line-clamp-2 leading-relaxed break-words">
              {recipe.description}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-[var(--color-outline-variant)] mt-4">
          <div className="flex items-center justify-between text-xs text-[var(--color-on-surface-variant)]">
            <div className="flex items-center gap-3">
              {totalTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {totalTime}
                </span>
              )}
              {recipe.yield_text && (
                <span className="flex items-center gap-1">
                  <ChefHat className="w-3.5 h-3.5" />
                  {recipe.yield_text}
                </span>
              )}
            </div>

            <span className="text-[var(--color-primary)] dark:text-[var(--color-crystal)] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ver <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});

RecipeCard.displayName = 'RecipeCard';
