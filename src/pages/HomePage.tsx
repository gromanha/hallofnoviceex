import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ArrowRight, ExternalLink, RefreshCw, AlertTriangle } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { PostCard } from '../components/PostCard';

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
      <section className="relative overflow-hidden">
        {/* Background image — soft & ethereal */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/id.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25 blur-[1px] mix-blend-soft-light"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface)]/80 via-[var(--color-surface)]/50 to-[var(--color-surface)]/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16">
          <div className="flex flex-col items-center text-center space-y-8">

            {/* Academy Name — Cinzel ceremonial */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-cinzel font-bold text-[var(--type-display-size)] leading-[var(--type-display-leading)] tracking-[var(--type-display-tracking)] text-[var(--color-on-surface)]" style={{ textShadow: '0 2px 4px rgba(201, 168, 76, 0.2)' }}>
                Hall of the Novice{' '}
                <span className="text-[var(--color-primary)]">EX</span>
              </h1>
              <p className="type-headline font-cinzel text-[var(--color-on-surface-variant)] max-w-xl mx-auto">
                Academia de Magia, Batalha e Artesanato
              </p>
            </motion.div>

            {/* Sharlayan Motto */}
            <motion.p
              className="type-body italic font-cormorant text-[var(--color-lavender)] max-w-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              "Onde o conhecimento se torna a sua maior magia."
            </motion.p>

            {/* Primary CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={handleNavigateAcademia}
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-[var(--color-primary)]/30 hover:scale-[1.02] border border-transparent hover:border-[#C9A84C]/40"
              >
                <BookOpen className="w-4 h-4" />
                Conheça a Academia
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="https://discord.gg/3XJgrsVUbP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface)] border-2 border-[#C9A84C]/40 hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/5 text-[var(--color-on-surface)] font-bold text-sm transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="20" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><ellipse cx="16" cy="4" rx="10" ry="2" fill="none" stroke="currentColor" strokeWidth="1"/><ellipse cx="16" cy="28" rx="10" ry="2" fill="none" stroke="currentColor" strokeWidth="1"/></svg>
                Entrar no Discord
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ Content Area ═══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Posts Section ── */}
        <div>
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

      </div>
    </main>
  );
};
