import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, ChefHat, Share2, Check, UtensilsCrossed } from 'lucide-react';
import { Recipe } from '../types';
import { apiGet } from '../lib/api';

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: 'bg-[var(--color-sage)]/10 text-[var(--color-sage)] border-[var(--color-sage)]/20',
  Medium: 'bg-[var(--color-amber)]/10 text-[var(--color-amber)] border-[var(--color-amber)]/20',
  Hard: 'bg-[var(--color-crimson)]/10 text-[var(--color-crimson)] border-[var(--color-crimson)]/20',
};

export const RecipeDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadRecipe() {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await apiGet<Recipe>(`/api/recipes?slug=${encodeURIComponent(slug)}`);
        if (!cancelled) setRecipe(data);
      } catch (err) {
        console.error('Receita nao encontrada:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRecipe();
    return () => { cancelled = true; };
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-4xl px-4 py-16 space-y-6">
        <div className="h-8 bg-[var(--color-surface)] rounded-xl w-3/4 shimmer" />
        <div className="h-64 bg-[var(--color-surface)] rounded-2xl shimmer" />
        <div className="space-y-3">
          <div className="h-4 bg-[var(--color-surface)] rounded w-full shimmer" />
          <div className="h-4 bg-[var(--color-surface)] rounded w-5/6 shimmer" />
        </div>
      </div>
    );
  }

  if (notFound || !recipe) {
    return (
      <div className="max-w-xl text-center py-20 px-4 space-y-4">
        <ChefHat className="w-16 h-16 text-[var(--color-on-surface-variant)] mx-auto opacity-30" />
        <h2 className="type-headline text-[var(--color-on-surface)]">Receita nao encontrada</h2>
        <p className="type-body text-[var(--color-on-surface-variant)]">A receita solicitada nao existe ou foi removida.</p>
        <button
          onClick={() => navigate('/receitas')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white type-label normal-case font-bold hover:bg-[var(--color-primary-deep)] transition-all shadow-md shadow-[var(--color-primary)]/20"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Livro de Receitas
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <button
          onClick={() => navigate('/receitas')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-[var(--color-outline)]/50 type-body font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Livro
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-[var(--color-outline)]/50 type-body font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-[var(--color-sage)]" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Link Copiado!' : 'Compartilhar'}
        </button>
      </motion.div>

      <motion.div
        className="glass p-6 sm:p-8 rounded-2xl border border-[var(--color-outline)]/50 space-y-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >

        <header className="space-y-4 text-center">
          {recipe.regional_cuisine && (
            <p className="type-label text-[var(--color-secondary)]">
              Regional Cuisine: {recipe.regional_cuisine}
            </p>
          )}

          <div className="type-label text-[var(--color-primary)] inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--color-primary)]/10">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            {recipe.category?.replace('_', ' & ') || 'Receita'}
          </div>

          <h1 className="type-display text-[var(--color-on-surface)] break-words">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="type-body italic text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
              {recipe.description}
            </p>
          )}

          {recipe.lore_quotes && recipe.lore_quotes.length > 0 && (
            <div className="space-y-3 mt-6">
              {recipe.lore_quotes.map((quote, i) => (
                <div key={i} className="flex items-start gap-3 bg-[var(--color-primary)]/5 rounded-xl px-4 py-3 border border-[var(--color-primary)]/10">
                  {quote.icon && (
                    <span className="text-lg mt-0.5">{quote.icon}</span>
                  )}
                  <div className="text-left">
                    <p className="type-body italic text-[var(--color-on-surface)]">"{quote.text}"</p>
                    {quote.speaker && (
                      <p className="type-caption font-display font-bold text-[var(--color-secondary)] mt-1">
                        — {quote.speaker}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </header>

        <div className="flex flex-wrap items-center justify-center gap-4 py-4 border-y border-[var(--color-outline)]/30 type-caption font-semibold text-[var(--color-on-surface)]">
          {recipe.difficulty && (
            <span className={`px-2.5 py-1 rounded-lg border ${DIFFICULTY_BADGE[recipe.difficulty] || DIFFICULTY_BADGE.Easy}`}>
              {recipe.difficulty}
            </span>
          )}
          {recipe.prep_time && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Prep: {recipe.prep_time}</span>
          )}
          {recipe.cook_time && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Cook: {recipe.cook_time}</span>
          )}
          {recipe.yield_text && (
            <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> {recipe.yield_text}</span>
          )}
          {recipe.dietary_notes && (
            <span className="px-2.5 py-1 rounded-lg bg-[var(--color-sage)]/10 text-[var(--color-sage)] border border-[var(--color-sage)]/20">
              {recipe.dietary_notes}
            </span>
          )}
        </div>

        {recipe.cover_image && (
          <div className="rounded-2xl overflow-hidden border border-[var(--color-outline)]/50 max-h-[400px]">
            <img
              src={recipe.cover_image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipe.equipment && (
            <div className="bg-[var(--color-primary)]/5 rounded-xl p-5 border border-[var(--color-primary)]/10">
              <h3 className="type-label text-[var(--color-primary)] mb-3 flex items-center gap-2">
                <UtensilsCrossed className="w-3.5 h-3.5" /> Equipment
              </h3>
              <p className="type-body text-[var(--color-on-surface)] whitespace-pre-line">{recipe.equipment}</p>
            </div>
          )}

          {recipe.ingredient_sections && recipe.ingredient_sections.length > 0 && (
            <div className="bg-[var(--color-secondary)]/5 rounded-xl p-5 border border-[var(--color-secondary)]/10">
              <h3 className="type-label text-[var(--color-secondary)] mb-3 flex items-center gap-2">
                <ChefHat className="w-3.5 h-3.5" /> Ingredients
              </h3>
              <div className="space-y-4">
                {recipe.ingredient_sections.map((section, si) => (
                  <div key={si}>
                    {section.section_name && (
                      <h4 className="type-caption font-bold text-[var(--color-secondary)] mb-2">
                        {section.section_name}
                      </h4>
                    )}
                    <ul className="space-y-1">
                      {section.items.map((item, ii) => (
                        <li key={ii} className="type-body text-[var(--color-on-surface)] flex items-baseline gap-2">
                          <span className="font-semibold text-[var(--color-primary)] whitespace-nowrap">
                            {[item.quantity, item.unit].filter(Boolean).join(' ')}
                          </span>
                          <span>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {recipe.instruction_sections && recipe.instruction_sections.length > 0 && (
          <div className="space-y-6">
            <h3 className="type-title text-[var(--color-on-surface)] border-b border-[var(--color-outline)]/30 pb-2">
              Instructions
            </h3>
            {recipe.instruction_sections.map((section, si) => (
              <div key={si} className="space-y-3">
                {section.section_name && (
                  <h4 className="type-label text-[var(--color-primary)]">
                    {section.section_name}
                  </h4>
                )}
                <ol className="space-y-3">
                  {section.steps.map((step, sti) => (
                    <li key={sti} className="flex items-start gap-3 type-body text-[var(--color-on-surface)]">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary)] text-white type-caption font-bold flex items-center justify-center mt-0.5">
                        {sti + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}

      </motion.div>
    </article>
  );
};
