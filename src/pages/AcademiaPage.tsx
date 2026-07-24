import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Sparkles, Filter, ShieldCheck, Tag } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { PostCard } from '../components/PostCard';

interface AcademiaPageProps {
  onNavigate: (path: string) => void;
}

export const AcademiaPage: React.FC<AcademiaPageProps> = ({ onNavigate }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        let url = '/api/posts';
        const params = new URLSearchParams();
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (params.toString()) url += `?${params.toString()}`;

        const data = await apiGet<Post[]>(url);
        setPosts(data || []);
      } catch (err) {
        console.error('Erro ao carregar postagens na página de Academia:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Cabeçalho Majestoso */}
      <div className="bg-gradient-to-r from-[#1D6A6A] via-[#124949] to-[#121921] rounded-3xl p-8 sm:p-12 text-white border-2 border-[#D4AF37] relative overflow-hidden shadow-xl text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6B8] text-xs font-bold uppercase tracking-widest">
          <BookOpen className="w-4 h-4 text-[#D4AF37]" />
          Códice & Biblioteca Sharlayan
        </div>

        <h1 className="font-serif font-black text-3xl sm:text-5xl text-[#F5E6B8] tracking-wide">
          Acervo Didático e Guias Acadêmicos
        </h1>

        <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
          Consulte aqui os manuais, tratados de relíquias, instruções de combate e normas da nossa instituição.
        </p>
      </div>

      {/* Prólogo do Reitor */}
      <div className="bg-[var(--color-surface)] border-l-4 border-[#D4AF37] rounded-2xl p-6 sm:p-8 shadow-sm space-y-3">
        <h2 className="font-serif font-bold text-xl text-[#1D6A6A] dark:text-[#4ECDC4] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          Carta da Reitoria aos Estudantes
        </h2>
        <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed italic">
          "Em nossa academia, nenhum erro é desperdiçado e nenhuma dúvida é pequena demais. O conhecimento em Eorzea pertence àqueles que dedicam tempo para compreender o ritmo do combate e a essência da cooperação."
        </p>
        <p className="text-xs font-serif font-bold text-right text-[var(--color-on-surface)]">
          — Reitor Aquilles Romanha
        </p>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">
        
        {/* Categorias */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#D4AF37]" />
            Filtrar:
          </span>

          {[
            { id: 'all', label: 'Todos os Guias' },
            { id: 'codice', label: 'Códice' },
            { id: 'guias', label: 'Combate EX/Savage' },
            { id: 'crafting', label: 'Crafting & Gathering' },
            { id: 'noticias', label: 'Notícias' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#1D6A6A] text-white shadow-xs'
                  : 'bg-[var(--color-background)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Input de Busca */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:ring-2 focus:ring-[#1D6A6A] focus:outline-none"
          />
        </div>

      </div>

      {/* Lista de Postagens */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Nenhuma publicação encontrada</h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Tente ajustar o termo de busca ou o filtro de categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onClick={() => onNavigate(`/post/${post.slug}`)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
