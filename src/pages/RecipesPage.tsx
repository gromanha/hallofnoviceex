import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChefHat, Search, Filter, X, UtensilsCrossed } from 'lucide-react';
import { Recipe, RecipeCategory } from '../types';
import { apiGet } from '../lib/api';
import { RecipeCard } from '../components/RecipeCard';
import { useDebounce } from '../lib/useDebounce';

const RECIPE_CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'breakfast', label: 'Cafe da Manha' },
  { id: 'appetizers', label: 'Aperitivos' },
  { id: 'breads', label: 'Paes' },
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const handleNavigateRecipe = useCallback((slug: string) => {
    navigate(`/receitas/${slug}`);
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    async function loadRecipes() {
      setLoading(true);
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
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRecipes();
    return () => { cancelled = true; };
  }, [selectedCategory, debouncedSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-secondary)] via-[var(--color-secondary-accent)] to-[var(--color-secondary)] rounded-3xl p-8 sm:p-12 text-[var(--color-on-secondary)] border-2 border-[var(--color-primary)] relative overflow-hidden shadow-xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/40 text-[var(--color-on-secondary)] text-xs font-bold uppercase tracking-widest">
          <UtensilsCrossed className="w-4 h-4" />
          Livro de Receitas de Eorzea
        </div>

        <h1 className="font-serif font-black text-3xl sm:text-5xl text-[var(--color-on-secondary)] tracking-wide">
          Livro de Receitas de Eorzea
        </h1>

        <p className="text-sm sm:text-base text-[var(--color-on-secondary)]/80 max-w-2xl mx-auto leading-relaxed">
          Receitas inspiradas no cookbook oficial de Final Fantasy XIV. Do Cafe da Manha de Limsa Lominsa as Sobremesas de Ishgard.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
            Filtrar:
          </span>
          {RECIPE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-background)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar receita..."
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-[var(--color-primary-light)] text-[var(--color-on-surface-variant)] transition-colors"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Recipe Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-80 bg-[var(--color-surface-alt)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
          <ChefHat className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Nenhuma receita encontrada</h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Tente ajustar o termo de busca ou o filtro de categoria.</p>
        </div>
      ) : (
        <motion.div
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

    </div>
  );
};
