import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, Calendar, ShieldCheck, HeartHandshake, MapPin, ArrowRight, MessageSquare, ExternalLink, Swords, FlaskConical } from 'lucide-react';
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
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
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
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-background)] via-[var(--color-surface)] to-[var(--color-background)] text-[var(--color-on-background)] pt-20 pb-24 border-b border-[var(--color-outline)]">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--color-secondary)]/8 rounded-full blur-3xl" />
        </div>
        
        <motion.div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            Free Company Final Fantasy XIV • Behemoth
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-[var(--color-on-surface)] tracking-tight leading-tight max-w-4xl mx-auto">
            Onde o conhecimento se torna a sua{' '}
            <span className="text-accent-orange font-bold">maior magia</span>
          </h1>

          <p className="text-sm sm:text-lg text-[var(--color-on-surface-variant)] font-light max-w-2xl mx-auto leading-relaxed">
            Bem-vindo à <strong className="text-[var(--color-on-surface)] font-semibold">Hall of the Novice EX [HoN]</strong>. Uma universidade temática de magia, combate didático sem toxicidade e suporte completo aos aventureiros de Eorzea.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href="https://discord.gg/3XJgrsVUbP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white font-bold text-sm transition-all shadow-lg shadow-[var(--color-primary)]/25 hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4" />
              Matricule-se no Discord
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <button
              onClick={handleNavigateCalendar}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] border border-[var(--color-outline)] text-[var(--color-on-surface)] font-bold text-sm transition-all"
            >
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              Ver Calendário de Aulas
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── POSTAGENS EM DESTAQUE & NOTÍCIAS (DO SUPABASE) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--color-outline)]/50">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-on-surface)] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
              Últimas Postagens & Códices
            </h2>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Publicadas pelo Corpo Docente diretamente do Supabase
            </p>
          </div>

          <button
            onClick={handleNavigateAcademia}
            className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-80 bg-[var(--color-surface)] rounded-2xl shimmer" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl p-8">
            <BookOpen className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3 opacity-40" />
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
          <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-on-surface)]">
            Nossos Quatro Pilares Acadêmicos
          </h2>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-2">
            Base ideológica que estrutura nossa universidade em Sharlayan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass rounded-2xl p-6 space-y-3 card-glow">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-sage)]/10 text-[var(--color-sage)] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-[var(--color-on-surface)]">Ensino Sem Toxicidade</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Learning Parties para Extreme, Savage e Ultimate com paciência total. O erro é visto apenas como a ementa da aula.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-3 card-glow">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-indigo)]/10 text-[var(--color-indigo)] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-[var(--color-on-surface)]">Imersão Temática</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Estrutura de reitoria, professores e alunos. RPG amigável integrado às atividades diárias de guilda.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-3 card-glow">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-[var(--color-on-surface)]">Polo de Informação PT-BR</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Manuais didáticos traduzidos, instruções táticas de batalhas e suporte contínuo para a comunidade brasileira.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 space-y-3 card-glow">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-amber)]/10 text-[var(--color-amber)] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-sm text-[var(--color-on-surface)]">Vivência Acadêmica</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Excursões de mapas, gincanas, ensaios fotográficos de formatura e confraternizações no campus litorâneo.
            </p>
          </div>
        </div>
      </section>

      {/* ── CORPO DOCENTE ── */}
      <section className="py-12 border-y border-[var(--color-outline)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--color-on-surface)]">
              Corpo Docente & Alto Conselho
            </h2>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Mentores responsáveis pelas disciplinas e orientação didática
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6 text-center space-y-3 card-glow">
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] font-display font-bold text-xl flex items-center justify-center mx-auto border-2 border-[var(--color-primary)]/30">
                AR
              </div>
              <h3 className="font-display font-bold text-base text-[var(--color-on-surface)]">Aquilles Romanha</h3>
              <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest">Reitor & Sábio (Sage)</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] italic">Estratégia de Combate e Planejamento Tático</p>
            </div>

            <div className="glass rounded-2xl p-6 text-center space-y-3 card-glow">
              <div className="w-16 h-16 rounded-full bg-[var(--color-sage)]/20 text-[var(--color-sage)] font-display font-bold text-xl flex items-center justify-center mx-auto border-2 border-[var(--color-sage)]/30">
                LO
              </div>
              <h3 className="font-display font-bold text-base text-[var(--color-on-surface)]">Leafa Oakfall</h3>
              <p className="text-[10px] font-bold text-[var(--color-sage)] uppercase tracking-widest">Conselheiro & Druida</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] italic">Cura Avançada e Alquimia de Campo</p>
            </div>

            <div className="glass rounded-2xl p-6 text-center space-y-3 card-glow">
              <div className="w-16 h-16 rounded-full bg-[var(--color-indigo)]/20 text-[var(--color-indigo)] font-display font-bold text-xl flex items-center justify-center mx-auto border-2 border-[var(--color-indigo)]/30">
                NT
              </div>
              <h3 className="font-display font-bold text-base text-[var(--color-on-surface)]">Nick Trentini</h3>
              <p className="text-[10px] font-bold text-[var(--color-indigo)] uppercase tracking-widest">Conselheiro & Artista</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] italic">Ritmo de Combate (Dancer/Pictomancer)</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAMPUS HOUSE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-[var(--color-outline)]/50">
          <div className="space-y-4 max-w-xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Campus da Guia (FC House)
            </span>
            <h2 className="font-display font-bold text-xl sm:text-3xl text-[var(--color-on-surface)]">
              Visite Nosso Campus Físico em Mist
            </h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
              Nossa sede foi carinhosamente decorada para refletir o ambiente acadêmico de Old Sharlayan, contando com Grande Biblioteca, Salas Táticas, Cantina e Deck de Observação.
            </p>
            <p className="text-xs font-mono bg-[var(--color-surface-alt)] px-4 py-2 rounded-xl border border-[var(--color-outline)] inline-block text-[var(--color-on-surface)]">
              Behemoth — Mist — Ward 19, Plot 35
            </p>
          </div>

          <a
            href="https://discord.gg/3XJgrsVUbP"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white font-bold text-sm transition-all shadow-lg shadow-[var(--color-primary)]/25 hover:scale-[1.02] shrink-0 flex items-center gap-2"
          >
            Quero Me Matricular
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </section>

    </div>
  );
};
