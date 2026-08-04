import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Search, Sparkles, Filter, X, UtensilsCrossed, RefreshCw, AlertTriangle } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { PostCard } from '../components/PostCard';
import { useDebounce } from '../lib/useDebounce';
import { POST_CATEGORY_COLORS } from '../lib/colors';

export const AcademiaPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
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
      setLoadError(null);
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
        if (!cancelled) setLoadError('Não foi possível carregar as publicações. Verifique sua conexão e tente novamente.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPosts();
    return () => { cancelled = true; };
  }, [selectedCategory, debouncedSearchQuery]);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Cabeçalho — Sala de Aula */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--color-outline)]/50 border-t-2 border-t-[#C9A84C]/30 border-b border-b-[#C9A84C]/20 text-center space-y-4">
        {/* AI Background */}
        <div className="absolute inset-0">
          <img
            src="/images/classroom.png"
            alt=""
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-background)]/70 via-[var(--color-background)]/85 to-[var(--color-background)]/95" />
        </div>

        <div className="relative z-10 p-8 sm:p-10">
          <div className="type-label text-[var(--color-primary)] mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 backdrop-blur-sm">
            <BookOpen className="w-3.5 h-3.5" />
            Sala de Aula — Códice & Biblioteca
          </div>

          <h1 className="type-display font-cinzel text-[var(--color-on-surface)]">
            Acervo Didático e Guias Acadêmicos
          </h1>

          <p className="type-body text-[var(--color-on-surface-variant)] max-w-2xl mx-auto mt-2">
            Consulte aqui os manuais, tratados de relíquias, instruções de combate e normas da nossa instituição.
          </p>
        </div>
      </div>

      {/* Prólogo do Reitor */}
      <div className="glass rounded-2xl p-6 sm:p-8 border border-[var(--color-outline)]/50 space-y-3">
        <h2 className="type-title text-[var(--color-primary)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-secondary)]" />
          Carta da Reitoria aos Estudantes
        </h2>
        <p className="type-body italic text-[var(--color-on-surface-variant)]">
          "Em nossa academia, nenhum erro é desperdiçado e nenhuma dúvida é pequena demais. O conhecimento em Eorzea pertence àqueles que dedicam tempo para compreender o ritmo do combate e a essência da cooperação."
        </p>
        <p className="type-caption font-display font-bold text-right text-[var(--color-on-surface)]">
          — Reitor Aquilles Romanha
        </p>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass p-4 rounded-2xl border border-[var(--color-outline)]/50">
        
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="type-label text-[var(--color-on-surface-variant)] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[var(--color-secondary)]" />
            Filtrar:
          </span>

          {[
            { id: 'all', label: 'Todos' },
            { id: 'codice', label: 'Codice' },
            { id: 'guias', label: 'Combate EX/Savage' },
            { id: 'crafting', label: 'Crafting' },
            { id: 'noticias', label: 'Noticias' },
          ].map(cat => {
            const catColor = cat.id !== 'all' ? POST_CATEGORY_COLORS[cat.id] : null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`px-3 py-1.5 rounded-full type-label normal-case transition-all ${
                  selectedCategory === cat.id
                    ? catColor
                      ? `${catColor.bg} ${catColor.text} shadow-md shadow-[#C9A84C]/30 border border-current/20`
                      : 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                    : 'bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] border border-[#C9A84C]/20'
                }`}
              >
                {catColor && <span className="w-1.5 h-1.5 rounded-full inline-block mr-1" style={{ backgroundColor: catColor.dot }} />}
                {cat.label}
              </button>
            );
          })}

          <span className="w-px h-5 bg-[var(--color-outline)]" />

          <a
            href="/receitas"
            className="px-3 py-1.5 rounded-full text-[10px] font-bold transition-all bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/20 flex items-center gap-1.5 border border-[#C9A84C]/20"
          >
            <UtensilsCrossed className="w-3 h-3" />
            Receitas
          </a>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou tag..."
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

      {/* Lista de Postagens */}
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
                let url = '/api/posts';
                const params = new URLSearchParams();
                if (selectedCategory !== 'all') params.append('category', selectedCategory);
                if (debouncedSearchQuery.trim()) params.append('search', debouncedSearchQuery.trim());
                if (params.toString()) url += `?${params.toString()}`;
                apiGet<Post[]>(url)
                  .then(data => setPosts(data || []))
                  .catch(err => {
                    console.error('Erro ao recarregar postagens:', err);
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
        ) : posts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center py-16 glass rounded-2xl p-8 border border-[var(--color-outline)]/50"
          >
            <BookOpen className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3 opacity-30" />
            <h3 className="type-title text-[var(--color-on-surface)]">Nenhuma publicação encontrada</h3>
            <p className="type-body text-[var(--color-on-surface-variant)] mt-1">Tente ajustar o termo de busca ou o filtro de categoria.</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${selectedCategory}-${debouncedSearchQuery}`}
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
      </AnimatePresence>

    </main>
  );
};
