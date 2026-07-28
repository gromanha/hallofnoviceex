import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, Calendar, ShieldCheck, HeartHandshake, MapPin, ArrowRight, MessageSquare } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { PostCard } from '../components/PostCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const handleNavigateCalendar = useCallback(() => {
    navigate('/calendario');
  }, [navigate]);

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
  const recentPosts = posts.filter(p => !p.is_pinned).slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-deep)] to-[var(--color-primary-deep)] text-[var(--color-on-primary)] pt-16 pb-24 border-b-4 border-[var(--color-secondary)]">
        <div className="absolute inset-0 opacity-10 parchment-texture pointer-events-none" />
        
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-secondary)]/20 border border-[var(--color-secondary)]/40 text-[var(--color-secondary)] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
            Free Company Final Fantasy XIV • Behemoth
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[var(--color-secondary)] tracking-wider leading-tight max-w-4xl mx-auto">
            Onde o conhecimento se torna a sua maior magia
          </h1>

          <p className="text-base sm:text-xl text-[var(--color-on-primary)]/80 font-light max-w-2xl mx-auto leading-relaxed">
            Bem-vindo à <strong className="text-[var(--color-on-primary)] font-semibold">Hall of the Novice EX [HoN]</strong>. Uma universidade temática de magia, combate didático sem toxicidade e suporte completo aos aventureiros de Eorzea.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href="https://discord.gg/3XJgrsVUbP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-accent)] text-[var(--color-on-secondary)] font-bold text-sm transition-all shadow-lg hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              Matricule-se no Discord
            </a>

            <button
              onClick={handleNavigateCalendar}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[var(--color-on-primary)]/10 hover:bg-[var(--color-on-primary)]/20 border border-[var(--color-on-primary)]/20 text-[var(--color-on-primary)] font-bold text-sm transition-all backdrop-blur-md"
            >
              <Calendar className="w-4 h-4 text-[var(--color-secondary)]" />
              Ver Calendário de Aulas
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── POSTAGENS EM DESTAQUE & NOTÍCIAS (DO SUPABASE) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--color-outline-variant)] pb-4">
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--color-on-surface)] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[var(--color-primary)] dark:text-[var(--color-crystal)]" />
              Últimas Postagens & Códices
            </h2>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Publicadas pelo Corpo Docente diretamente do Supabase
            </p>
          </div>

          <button
            onClick={handleNavigateAcademia}
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] dark:text-[var(--color-crystal)] hover:underline flex items-center gap-1"
          >
            Ver todos os guias <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-80 bg-[var(--color-surface-alt)] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">Nenhuma postagem encontrada.</p>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Use o Painel Admin para criar a primeira publicação.</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
      </section>

      {/* ── PILARES DA ACADEMIA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--color-on-surface)]">
            Nossos Quatro Pilares Acadêmicos
          </h2>
          <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">
            Base ideológica que estrutura nossa universidade em Sharlayan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-outline-variant)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-sage)]/10 text-[var(--color-sage)] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Ensino Sem Toxicidade</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Learning Parties para Extreme, Savage e Ultimate com paciência total. O erro é visto apenas como a ementa da aula.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-outline-variant)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-indigo)]/10 text-[var(--color-indigo)] flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Imersão Temática</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Estrutura de reitoria, professores e alunos. RPG amigável integrado às atividades diárias de guilda.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-outline-variant)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Polo de Informação PT-BR</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Manuais didáticos traduzidos, instruções táticas de batalhas e suporte contínuo para a comunidade brasileira.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-outline-variant)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-amber)]/10 text-[var(--color-amber)] flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Vivência Acadêmica</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Excursões de mapas, gincanas, ensaios fotográficos de formatura e confraternizações no campus litorâneo.
            </p>
          </div>
        </div>
      </section>

      {/* ── CORPO DOCENTE ── */}
      <section className="bg-[var(--color-surface)] py-12 border-y border-[var(--color-outline-variant)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--color-on-surface)]">
              Corpo Docente & Alto Conselho
            </h2>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Mentores responsáveis pelas disciplinas e orientação didática
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] text-[var(--color-secondary)] font-serif font-black text-2xl flex items-center justify-center mx-auto border-2 border-[var(--color-secondary)]">
                AR
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Aquilles Romanha</h3>
              <p className="text-xs font-bold text-[var(--color-primary)] dark:text-[var(--color-crystal)] uppercase">Reitor & Sábio (Sage)</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] italic">Estratégia de Combate e Planejamento Tático</p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[var(--color-sage)] text-[var(--color-secondary-light)] font-serif font-black text-2xl flex items-center justify-center mx-auto border-2 border-[var(--color-sage)]">
                LO
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Leafa Oakfall</h3>
              <p className="text-xs font-bold text-[var(--color-sage)] uppercase">Conselheiro & Druida</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] italic">Cura Avançada e Alquimia de Campo</p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[var(--color-indigo)] text-[var(--color-secondary-light)] font-serif font-black text-2xl flex items-center justify-center mx-auto border-2 border-[var(--color-indigo)]">
                NT
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Nick Trentini</h3>
              <p className="text-xs font-bold text-[var(--color-indigo)] uppercase">Conselheiro & Artista</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] italic">Ritmo de Combate (Dancer/Pictomancer)</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAMPUS HOUSE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-deep)] rounded-3xl p-8 sm:p-12 text-[var(--color-on-primary)] border-2 border-[var(--color-secondary)] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-secondary)] flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Campus da Guia (FC House)
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[var(--color-secondary)]">
              Visite Nosso Campus Físico em Mist
            </h2>
            <p className="text-sm text-[var(--color-on-primary)]/80 leading-relaxed">
              Nossa sede foi carinhosamente decorada para refletir o ambiente acadêmico de Old Sharlayan, contando com Grande Biblioteca, Salas Táticas, Cantina e Deck de Observação.
            </p>
            <p className="text-xs font-mono bg-[var(--color-on-primary)]/10 px-4 py-2 rounded-xl border border-[var(--color-on-primary)]/10 inline-block">
              Behemoth — Mist — Ward 19, Plot 35
            </p>
          </div>

          <a
            href="https://discord.gg/3XJgrsVUbP"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-2xl bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-accent)] text-[var(--color-on-secondary)] font-bold text-sm transition-all shadow-lg hover:scale-105 shrink-0"
          >
            Quero Me Matricular
          </a>
        </div>
      </section>

    </div>
  );
};
