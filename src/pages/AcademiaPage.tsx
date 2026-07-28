import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, Search, Sparkles, Filter, X, UtensilsCrossed } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { PostCard } from '../components/PostCard';
import { useDebounce } from '../lib/useDebounce';

export const AcademiaPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

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

  const handleNavigatePost = useCallback((slug: string) => {
    navigate(`/post/${slug}`);
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    async function loadPosts() {
      setLoading(true);
      try {
        let url = '/api/posts';
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (debouncedSearchQuery.trim()) params.append('search', debouncedSearchQuery.trim());
        if (params.toString()) url += `?${params.toString()}`;

        const data = await apiGet<Post[]>(url);
        if (!cancelled) setPosts(data || []);
      } catch (err) {
        console.error('Erro ao carregar postagens na página de Academia:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPosts();
    return () => { cancelled = true; };
  }, [selectedCategory, debouncedSearchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Cabeçalho */}
      <div className="glass rounded-2xl p-8 sm:p-10 border border-[var(--color-outline)]/50 relative overflow-hidden text-center space-y-4">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-widest mb-4">
            <BookOpen className="w-3.5 h-3.5" />
            Códice & Biblioteca Sharlayan
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-4xl text-[var(--color-on-surface)] tracking-tight">
            Acervo Didático e Guias Acadêmicos
          </h1>

          <p className="text-xs sm:text-sm text-[var(--color-on-surface-variant)] max-w-2xl mx-auto leading-relaxed mt-2">
            Consulte aqui os manuais, tratados de relíquias, instruções de combate e normas da nossa instituição.
          </p>
        </div>
      </div>

      {/* Prólogo do Reitor */}
      <div className="glass rounded-2xl p-6 sm:p-8 border border-[var(--color-outline)]/50 space-y-3">
        <h2 className="font-display font-bold text-sm text-[var(--color-primary)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-secondary)]" />
          Carta da Reitoria aos Estudantes
        </h2>
        <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed italic">
          "Em nossa academia, nenhum erro é desperdiçado e nenhuma dúvida é pequena demais. O conhecimento em Eorzea pertence àqueles que dedicam tempo para compreender o ritmo do combate e a essência da cooperação."
        </p>
        <p className="text-[10px] font-display font-bold text-right text-[var(--color-on-surface)]">
          — Reitor Aquilles Romanha
        </p>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-[var(--color-outline)]/50">
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-[10px] font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[var(--color-secondary)]" />
            Filtrar:
          </span>

          {[
            { id: 'all', label: 'Todos' },
            { id: 'codice', label: 'Codice' },
            { id: 'guias', label: 'Combate EX/Savage' },
            { id: 'crafting', label: 'Crafting' },
            { id: 'noticias', label: 'Noticias' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                  : 'bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <span className="w-px h-5 bg-[var(--color-outline)]" />

          <a
            href="/receitas"
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 flex items-center gap-1.5"
          >
            <UtensilsCrossed className="w-3 h-3" />
            Receitas
          </a>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou tag..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-outline)]/50 text-xs text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
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

      {/* Lista de Postagens */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-80 bg-[var(--color-surface)] rounded-2xl shimmer" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl p-8 border border-[var(--color-outline)]/50">
          <BookOpen className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3 opacity-30" />
          <h3 className="font-display font-bold text-base text-[var(--color-on-surface)]">Nenhuma publicação encontrada</h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Tente ajustar o termo de busca ou o filtro de categoria.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {posts.map(post => (
            <motion.div key={post.id} variants={itemVariants}>
              <PostCard
                post={post}
                onClick={() => handleNavigatePost(post.slug)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

    </div>
  );
};
