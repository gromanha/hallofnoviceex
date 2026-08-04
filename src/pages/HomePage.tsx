import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { PostCard } from '../components/PostCard';
import { HeroSection } from '../components/HeroSection';
import { SidebarCards } from '../components/SidebarCards';
import { TrendingCategories } from '../components/TrendingCategories';
import { FeaturedGuides } from '../components/FeaturedGuides';
import { LatestReviews } from '../components/LatestReviews';
import { PopularCollections } from '../components/PopularCollections';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const handleNavigateAcademia = useCallback(() => {
    navigate('/academia');
  }, [navigate]);

  const handleNavigatePost = useCallback((slug: string) => {
    navigate(`/post/${slug}`);
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    async function loadPosts() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await apiGet<Post[]>('/api/posts');
        if (!cancelled) setPosts(data || []);
      } catch (err) {
        console.error('Erro ao carregar postagens:', err);
        if (!cancelled) setLoadError('Não foi possível carregar as postagens. Verifique sua conexão e tente novamente.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPosts();
    return () => { cancelled = true; };
  }, []);

  const pinnedPosts = posts.filter(p => p.is_pinned);
  const recentPosts = posts.filter(p => !p.is_pinned);

  return (
    <main className="pb-16">

      {/* ═══════════════════ HERO: The Sharlayan Threshold ═══════════════════ */}
      <HeroSection
        totalGuides={posts.length}
        totalEvents={0}
        totalRecipes={0}
      />

      {/* ═══════════════════ Trending Categories ═══════════════════ */}
      <TrendingCategories />

      {/* ═══════════════════ Content Area ═══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col xl:flex-row gap-8">

          {/* ── Main Content: Posts ── */}
          <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="type-title text-[var(--color-on-surface)] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                Últimas Postagens
              </h2>
              <p className="type-caption text-[var(--color-on-surface-variant)] mt-1">
                Guias, notícias e códices do Corpo Docente
              </p>
            </div>

            <button
              onClick={handleNavigateAcademia}
              className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-72 bg-[var(--color-surface)] rounded-2xl shimmer" />
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-12 glass rounded-2xl p-8 border border-[var(--color-crimson)]/30">
              <AlertTriangle className="w-10 h-10 text-[var(--color-crimson)] mx-auto mb-3 opacity-60" />
              <p className="text-sm font-semibold text-[var(--color-on-surface)] mb-1">{loadError}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setLoadError(null);
                  apiGet<Post[]>('/api/posts')
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
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 glass rounded-2xl p-8 border border-[var(--color-outline)]/50">
              <BookOpen className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">Nenhuma postagem encontrada.</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Use o Painel Admin para criar a primeira publicação.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {pinnedPosts.map(post => (
                <motion.div key={post.id} variants={itemVariants}>
                  <PostCard
                    post={post}
                    onClick={() => handleNavigatePost(post.slug)}
                  />
                </motion.div>
              ))}
              {recentPosts.map(post => (
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

        {/* ── Right Sidebar: FC Card + Calendar + Members ── */}
        <SidebarCards />

        </div>
      </div>

      {/* ═══════════════════ Featured Guides ═══════════════════ */}
      <FeaturedGuides />

      {/* ═══════════════════ Latest Reviews ═══════════════════ */}
      <LatestReviews />

      {/* ═══════════════════ Popular Collections ═══════════════════ */}
      <PopularCollections />
    </main>
  );
};
