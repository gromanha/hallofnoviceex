import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, BookOpen, Share2, Check } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { renderMarkdown } from '../lib/sanitize';

export const PostDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [shareError, setShareError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadPost() {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await apiGet<Post>(`/api/posts?slug=${encodeURIComponent(slug)}`);
        if (!cancelled) setPost(data);
      } catch (err) {
        console.error('Post não encontrado:', err);
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPost();
    return () => { cancelled = true; };
  }, [slug]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setShareError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError(true);
      setTimeout(() => setShareError(false), 3000);
    }
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl px-4 py-16 space-y-6">
        <div className="h-8 bg-[var(--color-surface)] rounded-xl w-3/4 shimmer" />
        <div className="h-64 bg-[var(--color-surface)] rounded-2xl shimmer" />
        <div className="space-y-3">
          <div className="h-4 bg-[var(--color-surface)] rounded w-full shimmer" />
          <div className="h-4 bg-[var(--color-surface)] rounded w-5/6 shimmer" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-xl text-center py-20 px-4 space-y-4">
        <BookOpen className="w-16 h-16 text-[var(--color-on-surface-variant)] mx-auto opacity-30" />
        <h2 className="type-headline text-[var(--color-on-surface)]">Postagem não encontrada</h2>
        <p className="type-body text-[var(--color-on-surface-variant)]">A publicação solicitada não existe ou foi removida pelo autor.</p>
        <button
          onClick={() => navigate('/academia')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white type-label normal-case font-bold hover:bg-[var(--color-primary-deep)] transition-all shadow-md shadow-[var(--color-primary)]/20"
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
    <article className="max-w-3xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/academia')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-[var(--color-outline)]/50 type-body font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Códice
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-[var(--color-outline)]/50 type-body font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-all"
          aria-label={copied ? 'Link copiado' : 'Compartilhar postagem'}
        >
          {copied ? <Check className="w-4 h-4 text-[var(--color-sage)]" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Link Copiado!' : shareError ? 'Copie manualmente o link' : 'Compartilhar'}
        </button>
      </div>

      <header className="space-y-4">
        <div className="type-label text-[var(--color-primary)] inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--color-primary)]/10">
          {post.category}
        </div>

        <h1 className="type-display text-[var(--color-on-surface)] break-words">
          {post.title}
        </h1>

        {post.subtitle && (
          <p className="type-body italic text-[var(--color-on-surface-variant)]">
            {post.subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 type-body text-[var(--color-on-surface-variant)] pt-3 border-t border-[var(--color-outline)]/30">
          <span className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-[var(--color-secondary)]" />
            {post.author_name}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            {formattedDate}
          </span>
        </div>
      </header>

      {post.cover_image && !imgError && (
        <div className="rounded-2xl overflow-hidden border border-[var(--color-outline)]/50 max-h-[400px]">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      )}

      <div className="glass p-6 sm:p-8 rounded-2xl border border-[var(--color-outline)]/50 type-body text-[var(--color-on-surface)]">
        <div
          className="prose max-w-none space-y-4"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-[var(--color-outline)]/30">
          <span className="type-label text-[var(--color-on-surface-variant)] flex items-center gap-1">
            <Tag className="w-3 h-3 text-[var(--color-secondary)]" /> Tags:
          </span>
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="type-caption font-semibold px-2 py-0.5 rounded-lg bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

    </article>
  );
};
