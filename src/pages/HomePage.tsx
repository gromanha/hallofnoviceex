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

      {/* ── Section Divider ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-hidden="true">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-outline)]/30 to-transparent" />
      </div>

      {/* ═══════════════════ Content Area ═══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
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
                <div key={n} className="h-72 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline)]/20 relative overflow-hidden">
                  <div className="absolute inset-0 shimmer" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <img src="/svg/floating-book.svg" alt="" className="w-8 h-8 animate-pulse" />
                      <span className="type-caption text-[var(--color-on-surface-variant)]">Carregando...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div className="text-center py-16 glass rounded-2xl p-8 border border-[var(--color-crimson)]/30 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true">
                <img src="/svg/rune-circle.svg" alt="" className="w-full h-full object-contain" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-crimson)]/10 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-[var(--color-crimson)]" />
                </div>
                <p className="type-headline text-[var(--color-on-surface)] mb-2">
                  A conexão se interrompeu
                </p>
                <p className="type-body text-[var(--color-on-surface-variant)] max-w-sm mx-auto mb-4">
                  {loadError}
                </p>
                <button
                  onClick={() => {
                    setLoading(true);
                    setLoadError(null);
                    apiGet<Post[]>('/api/posts')
                      .then(data => setPosts(data || []))
                      .catch(err => {
                        console.error('Erro ao recarregar postagens:', err);
                        setLoadError('A conexão com a biblioteca permanece instável. Tente novamente em breve.');
                      })
                      .finally(() => setLoading(false));
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-bold hover:bg-[var(--color-primary-deep)] transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar novamente
                </button>
                <p className="type-caption text-[var(--color-lavender)] italic font-cormorant mt-4">
                  "Paciência é a virtude dos sábios"
                </p>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 glass rounded-2xl p-8 border border-[var(--color-outline)]/50 relative overflow-hidden">
              {/* Decorative rune circle */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" aria-hidden="true">
                <img src="/svg/rune-circle.svg" alt="" className="w-full h-full object-contain" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-secondary)]/10 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-[var(--color-secondary)]" />
                </div>
                <p className="type-headline text-[var(--color-on-surface)] mb-2">
                  Os pergaminhos aguardam
                </p>
                <p className="type-body text-[var(--color-on-surface-variant)] max-w-sm mx-auto mb-4">
                  A biblioteca da academia ainda não possui registros. Seja o primeiro a contribuir com um guia para a comunidade.
                </p>
                <p className="type-caption text-[var(--color-lavender)] italic font-cormorant">
                  "O conhecimento compartilhado se multiplica"
                </p>
              </div>
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

      {/* ── Section Divider ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-hidden="true">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-outline)]/30 to-transparent" />
      </div>

      {/* ═══════════════════ Featured Guides ═══════════════════ */}
      <FeaturedGuides />

      {/* ═══════════════════ Latest Reviews ═══════════════════ */}
      <LatestReviews />

      {/* ── Section Divider ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-hidden="true">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-outline)]/30 to-transparent" />
      </div>

      {/* ═══════════════════ Popular Collections ═══════════════════ */}
      <PopularCollections />
    </main>
  );
};
