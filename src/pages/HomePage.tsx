import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { BookOpen, ArrowRight, ExternalLink, MessageSquare, Calendar, MapPin } from 'lucide-react';
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
          {/* Gradient veil over the image for delicacy */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface)]/80 via-[var(--color-surface)]/50 to-[var(--color-surface)]/90" />
        </div>

        {/* Atmospheric depth layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-[var(--color-primary)]/[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-[-30%] right-[15%] w-[400px] h-[400px] bg-[var(--color-secondary)]/[0.05] rounded-full blur-[80px]" />
          <div className="absolute top-[20%] right-[30%] w-[200px] h-[200px] bg-[var(--color-tertiary)]/[0.03] rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16">
          <div className="flex flex-col items-center text-center space-y-8">

            {/* Ceremonial Mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--color-primary)]/[0.08] border border-[var(--color-primary)]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                  Behemoth — Majestic Battle Academy
                </span>
              </div>
            </motion.div>

            {/* Academy Name — Cinzel ceremonial */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-cinzel font-bold text-[var(--type-display-size)] leading-[var(--type-display-leading)] tracking-[var(--type-display-tracking)] text-[var(--color-on-surface)]">
                Hall of the Novice{' '}
                <span className="text-[var(--color-primary)]">EX</span>
              </h1>
              <p className="type-headline text-[var(--color-on-surface-variant)] max-w-xl mx-auto">
                Academia de Magia, Batalha e Artesanato
              </p>
            </motion.div>

            {/* Sharlayan Motto */}
            <motion.p
              className="type-body italic text-[var(--color-secondary)] max-w-md"
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
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-[var(--color-primary)]/30 hover:scale-[1.02]"
              >
                <BookOpen className="w-4 h-4" />
                Conheça a Academia
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="https://discord.gg/3XJgrsVUbP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface)] border border-[var(--color-outline)] text-[var(--color-on-surface)] font-bold text-sm transition-all hover:border-[var(--color-primary)]/30"
              >
                <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
                Entrar no Discord
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            </motion.div>

            {/* Campus Quick Card — glass anchor */}
            <motion.div
              className="glass rounded-2xl px-6 py-4 border border-[var(--color-outline)]/50 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[var(--color-secondary)]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[var(--color-on-surface)]">Campus Físico</p>
                  <p className="text-[10px] font-mono text-[var(--color-on-surface-variant)]">
                    Mist — Ward 19, Plot 35
                  </p>
                </div>
              </div>
              <span className="hidden sm:block w-px h-8 bg-[var(--color-outline)]/50" />
              <p className="text-[11px] text-[var(--color-on-surface-variant)] leading-relaxed max-w-xs">
                Visite nossa sede decorada em estilo Old Sharlayan, com Biblioteca, Salas Táticas e Cantina.
              </p>
            </motion.div>

          </div>
        </div>

        {/* Bottom edge: subtle gold line */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-secondary)]/20 to-transparent" />
      </section>

      {/* ═══════════════════ Content Area ═══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* ── Quick Actions Banner ── */}
        <motion.div
          className="glass rounded-2xl p-5 border border-[var(--color-outline)]/50 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="text-[11px] text-[var(--color-on-surface-variant)]">
              FC Final Fantasy XIV • <strong className="text-[var(--color-on-surface)]">Behemoth</strong> • Acesse eventos e guias
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/calendario')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface)] border border-[var(--color-outline)] text-[var(--color-on-surface)] font-bold text-xs transition-all"
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              Calendário
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
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <WeekCalendarPreview />
            </motion.div>

            {/* Quick Info Card */}
            <motion.div
              className="glass rounded-2xl p-5 border border-[var(--color-outline)]/50 space-y-4"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="font-display font-bold text-sm text-[var(--color-on-surface)]">
                Matrícula Digital
              </h3>
              <p className="text-[11px] text-[var(--color-on-surface-variant)] leading-relaxed">
                Junte-se a nós pelo Discord oficial para participar dos eventos, learning parties e matricular seu personagem.
              </p>
              <a
                href="https://discord.gg/3XJgrsVUbP"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white font-bold text-xs transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/20"
              >
                Quero Me Matricular
              </a>
            </motion.div>
          </div>
        </div>

      </div>
    </main>
  );
};
