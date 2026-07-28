import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ArrowRight, ExternalLink, MessageSquare, Calendar } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { PostCard } from '../components/PostCard';
import { WeekCalendarPreview } from '../components/WeekCalendarPreview';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
      try {
        const data = await apiGet<Post[]>('/api/posts');
        if (!cancelled) setPosts(data || []);
      } catch (err) {
        console.error('Erro ao carregar postagens:', err);
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* ── Quick Actions Banner ── */}
      <motion.div
        className="glass rounded-2xl p-6 border border-[var(--color-outline)]/50 flex flex-col sm:flex-row items-center justify-between gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-bold text-sm text-[var(--color-on-surface)]">
              Bem-vindo à Hall of the Novice EX
            </p>
            <p className="text-[11px] text-[var(--color-on-surface-variant)]">
              FC Final Fantasy XIV • Behemoth • Majestic Battle Academy
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://discord.gg/3XJgrsVUbP"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white font-bold text-xs transition-all shadow-md shadow-[var(--color-primary)]/20"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Discord
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <button
            onClick={() => navigate('/calendario')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface)] border border-[var(--color-outline)] text-[var(--color-on-surface)] font-bold text-xs transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            Calendario
          </button>
        </div>
      </motion.div>

      {/* ── Two Column Layout ── */}
      <div className="flex gap-6">
        {/* Left Column: Posts */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-[var(--color-on-surface)] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
                Últimas Postagens
              </h2>
              <p className="text-[11px] text-[var(--color-on-surface-variant)] mt-1">
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

        {/* Right Column: Calendar + Quick Info */}
        <div className="hidden xl:flex flex-col w-80 shrink-0 space-y-5">
          {/* Week Calendar Preview */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <WeekCalendarPreview />
          </motion.div>

          {/* Quick Info Card */}
          <motion.div
            className="glass rounded-2xl p-5 border border-[var(--color-outline)]/50 space-y-4"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <h3 className="font-display font-bold text-sm text-[var(--color-on-surface)]">
              Nosso Campus
            </h3>
            <p className="text-[11px] text-[var(--color-on-surface-variant)] leading-relaxed">
              Visite nossa sede decorada em estilo Old Sharlayan, com Biblioteca, Salas Táticas e Cantina.
            </p>
            <p className="text-[10px] font-mono bg-[var(--color-surface-alt)] px-3 py-1.5 rounded-lg border border-[var(--color-outline)] text-[var(--color-on-surface)] inline-block">
              Behemoth — Mist — Ward 19, Plot 35
            </p>
            <a
              href="https://discord.gg/3XJgrsVUbP"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white font-bold text-xs transition-all shadow-md shadow-[var(--color-primary)]/20"
            >
              Quero Me Matricular
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
