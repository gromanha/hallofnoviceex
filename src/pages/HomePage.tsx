import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, Calendar, ShieldCheck, HeartHandshake, MapPin, ArrowRight, MessageSquare } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { PostCard } from '../components/PostCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await apiGet<Post[]>('/api/posts');
        setPosts(data || []);
      } catch (err) {
        console.error('Erro ao carregar postagens:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const pinnedPosts = posts.filter(p => p.is_pinned);
  const recentPosts = posts.filter(p => !p.is_pinned).slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1D6A6A] via-[#124949] to-[#121921] text-white pt-16 pb-24 border-b-4 border-[#D4AF37]">
        <div className="absolute inset-0 opacity-10 parchment-texture pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6B8] text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Free Company Final Fantasy XIV • Behemoth
          </div>

          <h1 className="font-serif font-black text-3xl sm:text-5xl lg:text-6xl text-[#F5E6B8] tracking-wider leading-tight max-w-4xl mx-auto">
            Onde o conhecimento se torna a sua maior magia
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/90 font-light max-w-2xl mx-auto leading-relaxed">
            Bem-vindo à <strong className="text-white font-semibold">Hall of the Novice EX [HoN]</strong>. Uma universidade temática de magia, combate didático sem toxicidade e suporte completo aos aventureiros de Eorzea.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href="https://discord.gg/3XJgrsVUbP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-slate-950 font-bold text-sm transition-all shadow-lg hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              Matricule-se no Discord
            </a>

            <button
              onClick={() => navigate('/calendario')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all backdrop-blur-md"
            >
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              Ver Calendário de Aulas
            </button>
          </div>
        </div>
      </section>

      {/* ── POSTAGENS EM DESTAQUE & NOTÍCIAS (DO SUPABASE) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--color-outline-variant)] pb-4">
          <div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--color-on-surface)] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#1D6A6A] dark:text-[#4ECDC4]" />
              Últimas Postagens & Códices
            </h2>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              Publicadas pelo Corpo Docente diretamente do Supabase
            </p>
          </div>

          <button
            onClick={() => navigate('/academia')}
            className="text-xs font-bold uppercase tracking-wider text-[#1D6A6A] dark:text-[#4ECDC4] hover:underline flex items-center gap-1"
          >
            Ver todos os guias <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">Nenhuma postagem encontrada.</p>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Use o Painel Admin para criar a primeira publicação.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pinnedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => navigate(`/post/${post.slug}`)}
              />
            ))}
            {recentPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onClick={() => navigate(`/post/${post.slug}`)}
              />
            ))}
          </div>
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Ensino Sem Toxicidade</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Learning Parties para Extreme, Savage e Ultimate com paciência total. O erro é visto apenas como a ementa da aula.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-outline-variant)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Imersão Temática</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Estrutura de reitoria, professores e alunos. RPG amigável integrado às atividades diárias de guilda.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-outline-variant)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Polo de Informação PT-BR</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Manuais didáticos traduzidos, instruções táticas de batalhas e suporte contínuo para a comunidade brasileira.
            </p>
          </div>

          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-outline-variant)] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
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
              <div className="w-16 h-16 rounded-full bg-[#1D6A6A] text-[#D4AF37] font-serif font-black text-2xl flex items-center justify-center mx-auto border-2 border-[#D4AF37]">
                AR
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Aquilles Romanha</h3>
              <p className="text-xs font-bold text-[#1D6A6A] dark:text-[#4ECDC4] uppercase">Reitor & Sábio (Sage)</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] italic">Estratégia de Combate e Planejamento Tático</p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#059669] text-[#F5E6B8] font-serif font-black text-2xl flex items-center justify-center mx-auto border-2 border-emerald-400">
                LO
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Leafa Oakfall</h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Conselheiro & Druida</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] italic">Cura Avançada e Alquimia de Campo</p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#7E22CE] text-[#F5E6B8] font-serif font-black text-2xl flex items-center justify-center mx-auto border-2 border-purple-400">
                NT
              </div>
              <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Nick Trentini</h3>
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase">Conselheiro & Artista</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] italic">Ritmo de Combate (Dancer/Pictomancer)</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CAMPUS HOUSE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#1D6A6A] to-[#124949] rounded-3xl p-8 sm:p-12 text-white border-2 border-[#D4AF37] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
              <MapPin className="w-4 h-4" /> Campus da Guia (FC House)
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-4xl text-[#F5E6B8]">
              Visite Nosso Campus Físico em Mist
            </h2>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              Nossa sede foi carinhosamente decorada para refletir o ambiente acadêmico de Old Sharlayan, contando com Grande Biblioteca, Salas Táticas, Cantina e Deck de Observação.
            </p>
            <p className="text-xs font-mono bg-slate-950/40 px-4 py-2 rounded-xl border border-white/10 inline-block">
              Behemoth — Mist — Ward 19, Plot 35
            </p>
          </div>

          <a
            href="https://discord.gg/3XJgrsVUbP"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 rounded-2xl bg-[#D4AF37] hover:bg-[#E5C158] text-slate-950 font-bold text-sm transition-all shadow-lg hover:scale-105 shrink-0"
          >
            Quero Me Matricular
          </a>
        </div>
      </section>

    </div>
  );
};
