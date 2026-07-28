import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, ChefHat, Share2, Check, UtensilsCrossed, MessageCircle } from 'lucide-react';
import { Recipe } from '../types';
import { apiGet } from '../lib/api';

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: 'bg-[var(--color-sage-light)] text-[var(--color-sage)] border-[var(--color-sage)]/30',
  Medium: 'bg-[var(--color-amber-light)] text-[var(--color-amber)] border-[var(--color-amber)]/30',
  Hard: 'bg-[var(--color-crimson-light)] text-[var(--color-crimson)] border-[var(--color-crimson)]/30',
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
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-[var(--color-surface-alt)] rounded-xl w-3/4 animate-pulse" />
        <div className="h-64 bg-[var(--color-surface-alt)] rounded-2xl animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 bg-[var(--color-surface-alt)] rounded w-full animate-pulse" />
          <div className="h-4 bg-[var(--color-surface-alt)] rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !recipe) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4 space-y-4">
        <ChefHat className="w-16 h-16 text-[var(--color-on-surface-variant)] mx-auto" />
        <h2 className="font-serif font-bold text-2xl text-[var(--color-on-surface)]">Receita nao encontrada</h2>
        <p className="text-sm text-[var(--color-on-surface-variant)]">A receita solicitada nao existe ou foi removida.</p>
        <button
          onClick={() => navigate('/receitas')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs uppercase tracking-wider hover:bg-[var(--color-primary-hover)] transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Livro de Receitas
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Back & Share */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/receitas')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-xs font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Livro
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-xs font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-[var(--color-sage)]" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Link Copiado!' : 'Compartilhar'}
        </button>
      </div>

      {/* Parchment Card */}
      <div className="parchment-recipe p-6 sm:p-10 space-y-8">

        {/* Header */}
        <header className="space-y-4 text-center">
          {recipe.regional_cuisine && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-on-secondary-deep)]">
              Regional Cuisine: {recipe.regional_cuisine}
            </p>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider">
            <UtensilsCrossed className="w-4 h-4" />
            {recipe.category?.replace('_', ' & ') || 'Receita'}
          </div>

          <h1 className="font-cinzel font-black text-3xl sm:text-4xl lg:text-5xl text-[var(--color-on-surface)] leading-tight break-words">
            {recipe.title}
          </h1>

          {recipe.description && (
            <p className="text-base text-[var(--color-on-surface-variant)] leading-relaxed italic max-w-2xl mx-auto">
              {recipe.description}
            </p>
          )}

          {/* Lore Quotes */}
          {recipe.lore_quotes && recipe.lore_quotes.length > 0 && (
            <div className="space-y-3 mt-6">
              {recipe.lore_quotes.map((quote, i) => (
                <div key={i} className="flex items-start gap-3 bg-[var(--color-primary)]/5 rounded-xl px-4 py-3 border border-[var(--color-primary)]/10">
                  {quote.icon && (
                    <span className="text-lg mt-0.5">{quote.icon}</span>
                  )}
                  <div className="text-left">
                    <p className="text-sm text-[var(--color-on-surface)] italic leading-relaxed">"{quote.text}"</p>
                    {quote.speaker && (
                      <p className="text-xs font-serif font-bold text-[var(--color-on-secondary-deep)] mt-1">
                        — {quote.speaker}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-4 border-y border-[var(--color-secondary)]/20 text-xs font-semibold text-[var(--color-on-surface)]">
          {recipe.difficulty && (
            <span className={`px-2.5 py-1 rounded-full border ${DIFFICULTY_BADGE[recipe.difficulty] || DIFFICULTY_BADGE.Easy}`}>
              {recipe.difficulty}
            </span>
          )}
          {recipe.prep_time && (
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Prep: {recipe.prep_time}</span>
          )}
          {recipe.cook_time && (
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Cook: {recipe.cook_time}</span>
          )}
          {recipe.yield_text && (
            <span className="flex items-center gap-1"><ChefHat className="w-3.5 h-3.5" /> {recipe.yield_text}</span>
          )}
          {recipe.dietary_notes && (
            <span className="px-2.5 py-1 rounded-full bg-[var(--color-sage)]/10 text-[var(--color-sage)] border border-[var(--color-sage)]/20">
              {recipe.dietary_notes}
            </span>
          )}
        </div>

        {/* Cover Image */}
        {recipe.cover_image && (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-[var(--color-secondary)]/20 max-h-[450px]">
            <img
              src={recipe.cover_image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Equipment + Ingredients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Equipment */}
          {recipe.equipment && (
            <div className="bg-[var(--color-primary)]/5 rounded-xl p-5 border border-[var(--color-primary)]/10">
              <h3 className="font-cinzel font-bold text-sm uppercase tracking-wider text-[var(--color-primary)] mb-3 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" /> Equipment
              </h3>
              <p className="text-sm text-[var(--color-on-surface)] leading-relaxed whitespace-pre-line">{recipe.equipment}</p>
            </div>
          )}

          {/* Ingredients */}
          {recipe.ingredient_sections && recipe.ingredient_sections.length > 0 && (
            <div className="bg-[var(--color-secondary)]/5 rounded-xl p-5 border border-[var(--color-secondary)]/10">
              <h3 className="font-cinzel font-bold text-sm uppercase tracking-wider text-[var(--color-on-secondary-deep)] mb-3 flex items-center gap-2">
                <ChefHat className="w-4 h-4" /> Ingredients
              </h3>
              <div className="space-y-4">
                {recipe.ingredient_sections.map((section, si) => (
                  <div key={si}>
                    {section.section_name && (
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-on-secondary-deep)] mb-2">
                        {section.section_name}
                      </h4>
                    )}
                    <ul className="space-y-1">
                      {section.items.map((item, ii) => (
                        <li key={ii} className="text-sm text-[var(--color-on-surface)] flex items-baseline gap-2">
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

        {/* Instructions */}
        {recipe.instruction_sections && recipe.instruction_sections.length > 0 && (
          <div className="space-y-6">
            <h3 className="font-cinzel font-bold text-lg text-[var(--color-on-surface)] border-b border-[var(--color-secondary)]/20 pb-2">
              Instructions
            </h3>
            {recipe.instruction_sections.map((section, si) => (
              <div key={si} className="space-y-3">
                {section.section_name && (
                  <h4 className="font-cinzel font-bold text-sm uppercase tracking-wider text-[var(--color-primary)]">
                    {section.section_name}
                  </h4>
                )}
                <ol className="space-y-3">
                  {section.steps.map((step, sti) => (
                    <li key={sti} className="flex items-start gap-3 text-sm text-[var(--color-on-surface)] leading-relaxed">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center mt-0.5">
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

      </div>
    </article>
  );
};
