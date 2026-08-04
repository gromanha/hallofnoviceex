import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChefHat, Search, Filter, X, UtensilsCrossed, Globe, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { Recipe, RecipeCategory } from '../types';
import { apiGet } from '../lib/api';
import { RecipeCard } from '../components/RecipeCard';
import { useDebounce } from '../lib/useDebounce';
import { RECIPE_CATEGORY_COLORS } from '../lib/colors';

const RECIPE_CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'breakfast', label: 'Café da Manhã' },
  { id: 'appetizers', label: 'Aperitivos' },
  { id: 'breads', label: 'Pães' },
  { id: 'soups_stews', label: 'Sopas e Ensopados' },
  { id: 'main_dishes', label: 'Pratos Principais' },
  { id: 'sides', label: 'Acompanhamentos' },
  { id: 'desserts', label: 'Sobremesas' },
  { id: 'drinks', label: 'Bebidas' },
];

export const RecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const handleNavigateRecipe = useCallback((slug: string) => {
    navigate(`/receitas/${slug}`);
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    async function loadRecipes() {
      setLoading(true);
      setLoadError(null);
      try {
        let url = '/api/recipes';
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
        if (params.toString()) url += `?${params.toString()}`;

        const data = await apiGet<Recipe[]>(url);
        if (!cancelled) setRecipes(data || []);
      } catch (err) {
        console.error('Erro ao carregar receitas:', err);
        if (!cancelled) setLoadError('Não foi possível carregar as receitas. Verifique sua conexão e tente novamente.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRecipes();
    return () => { cancelled = true; };
  }, [selectedCategory, debouncedSearch]);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header — Cozinha Mágica */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--color-outline)]/50 border-t-2 border-t-[#C9A84C]/30 text-center space-y-4">
        {/* AI Background */}
        <div className="absolute inset-0">
          <img
            src="/images/kitchen.png"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/70 via-[var(--color-background)]/85 to-[var(--color-background)]/95" />
        </div>

        <div className="relative z-10 p-8 sm:p-10">
          <div className="type-label text-[var(--color-secondary)] mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20 backdrop-blur-sm">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            Cozinha Mágica — Livro de Receitas
          </div>

          <h1 className="type-display font-cinzel text-[var(--color-on-surface)]">
            Livro de Receitas de Eorzea
          </h1>

          <p className="type-body text-[var(--color-on-surface-variant)] max-w-2xl mx-auto mt-2">
            Receitas inspiradas no cookbook oficial de Final Fantasy XIV. Do Café da Manhã de Limsa Lominsa às Sobremesas de Ishgard.
          </p>

          <div className="mt-4">
            <a
              href="/game-data"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-outline)]/30 text-[var(--color-secondary)] hover:border-[var(--color-secondary)]/50 transition-all type-body"
            >
              <Globe className="w-4 h-4" />
              Explorar dados do jogo
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-[var(--color-outline)]/50">

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="type-label text-[var(--color-on-surface-variant)] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[var(--color-secondary)]" />
            Filtrar:
          </span>
          {RECIPE_CATEGORIES.map(cat => {
            const catColor = cat.id !== 'all' ? RECIPE_CATEGORY_COLORS[cat.id] : null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`px-3 py-1.5 rounded-full type-label normal-case transition-all ${
                  selectedCategory === cat.id
                    ? catColor
                      ? `${catColor.bg} ${catColor.text} shadow-md border border-current/20`
                      : 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                    : 'bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
                }`}
              >
                {catColor && <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ backgroundColor: catColor.dot }} />}
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar receita..."
            className="search-input w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-outline)]/50 type-body text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Recipe Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-80 bg-[var(--color-surface)] rounded-2xl shimmer" />
            ))}
          </motion.div>
        ) : loadError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center py-16 glass rounded-2xl p-8 border border-[var(--color-crimson)]/30"
          >
            <AlertTriangle className="w-10 h-10 text-[var(--color-crimson)] mx-auto mb-3 opacity-60" />
            <h3 className="type-title text-[var(--color-on-surface)] mb-1">{loadError}</h3>
            <button
              onClick={() => {
                setLoading(true);
                setLoadError(null);
                let url = '/api/recipes';
                const params = new URLSearchParams();
                if (selectedCategory !== 'all') params.append('category', selectedCategory);
                if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
                if (params.toString()) url += `?${params.toString()}`;
                apiGet<Recipe[]>(url)
                  .then(data => setRecipes(data || []))
                  .catch(err => {
                    console.error('Erro ao recarregar receitas:', err);
                    setLoadError('Falha ao recarregar. Tente novamente.');
                  })
                  .finally(() => setLoading(false));
              }}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-deep)] transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          </motion.div>
        ) : recipes.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center py-16 glass rounded-2xl p-8 border border-[var(--color-outline)]/50"
          >
            <ChefHat className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3 opacity-30" />
            <h3 className="type-title text-[var(--color-on-surface)]">Nenhuma receita encontrada</h3>
            <p className="type-body text-[var(--color-on-surface-variant)] mt-1">Tente ajustar o termo de busca ou o filtro de categoria.</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${debouncedSearch}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {recipes.map(recipe => (
              <motion.div key={recipe.id} variants={itemVariants}>
                <RecipeCard
                  recipe={recipe}
                  onClick={() => handleNavigateRecipe(recipe.slug)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
};
