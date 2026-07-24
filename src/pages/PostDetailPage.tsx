import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, User, Tag, BookOpen, Share2, Check } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';

interface PostDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({ slug, onNavigate }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await apiGet<Post>(`/api/posts?slug=${encodeURIComponent(slug)}`);
        setPost(data);
      } catch (err) {
        console.error('Post não encontrado:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4" />
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4 space-y-4">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto" />
        <h2 className="font-serif font-bold text-2xl text-[var(--color-on-surface)]">Postagem não encontrada</h2>
        <p className="text-sm text-[var(--color-on-surface-variant)]">A publicação solicitada não existe ou foi removida pelo autor.</p>
        <button
          onClick={() => onNavigate('/academia')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D6A6A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#2A8A8A] transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Códice
        </button>
      </div>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Botão de Voltar & Compartilhar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/academia')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-xs font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)] hover:text-[#1D6A6A] transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Códice
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-xs font-bold text-[var(--color-on-surface-variant)] hover:text-[#1D6A6A] transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Link Copiado!' : 'Compartilhar'}
        </button>
      </div>

      {/* Header do Post */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#1D6A6A] text-white text-xs font-bold uppercase tracking-wider">
          {post.category}
        </div>

        <h1 className="font-serif font-black text-2xl sm:text-4xl lg:text-5xl text-[var(--color-on-surface)] leading-tight">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="text-base sm:text-lg text-[var(--color-on-surface-variant)] leading-relaxed italic">
            {post.subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-on-surface-variant)] pt-2 border-t border-[var(--color-outline-variant)]">
          <span className="flex items-center gap-1.5 font-medium">
            <User className="w-4 h-4 text-[#D4AF37]" />
            {post.author_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#1D6A6A] dark:text-[#4ECDC4]" />
            {formattedDate}
          </span>
        </div>
      </header>

      {/* Cover Image */}
      {post.cover_image && (
        <div className="rounded-2xl overflow-hidden shadow-lg border border-[var(--color-outline-variant)] max-h-[450px]">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="bg-[var(--color-surface)] p-6 sm:p-10 rounded-2xl border border-[var(--color-outline-variant)] shadow-sm leading-relaxed text-sm sm:text-base text-[var(--color-on-surface)] space-y-4">
        <div
          className="prose dark:prose-invert max-w-none space-y-4"
          dangerouslySetInnerHTML={{
            __html: post.content
              .replace(/\n\n/g, '</p><p>')
              .replace(/\n/g, '<br/>')
              .replace(/## (.*)/g, '<h2 className="font-serif text-xl font-bold text-[#1D6A6A] dark:text-[#4ECDC4] mt-6 mb-2">$1</h2>')
              .replace(/### (.*)/g, '<h3 className="font-serif text-lg font-bold text-[var(--color-on-surface)] mt-4 mb-2">$1</h3>')
          }}
        />
      </div>

      {/* Tags no Rodapé */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[var(--color-outline-variant)]">
          <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#D4AF37]" /> Tags:
          </span>
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-semibold"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

    </article>
  );
};
