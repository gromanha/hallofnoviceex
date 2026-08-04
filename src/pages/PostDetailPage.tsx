import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, User, Tag, BookOpen } from 'lucide-react';
import { Post } from '../types';
import { apiGet } from '../lib/api';
import { renderMarkdown } from '../lib/sanitize';
import { useCodeHighlight } from '../lib/useCodeHighlight';
import { ReadingProgressBar } from '../components/blog/ReadingProgressBar';
import { ReadingTimeBadge } from '../components/blog/ReadingTimeBadge';
import { ShareButtons } from '../components/blog/ShareButtons';
import { PostNavigation } from '../components/blog/PostNavigation';

export const PostDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [adjacentPosts, setAdjacentPosts] = useState<{
    prev: { slug: string; title: string } | null;
    next: { slug: string; title: string } | null;
  }>({ prev: null, next: null });

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

  useEffect(() => {
    if (!post) return;
    let cancelled = false;

    async function loadAdjacent() {
      try {
        const allPosts = await apiGet<Post[]>('/api/posts?status=published');
        if (cancelled || !allPosts) return;

        const currentIndex = allPosts.findIndex(p => p.id === post!.id);
        if (currentIndex === -1) return;

        const prev = currentIndex > 0
          ? { slug: allPosts[currentIndex - 1].slug, title: allPosts[currentIndex - 1].title }
          : null;
        const next = currentIndex < allPosts.length - 1
          ? { slug: allPosts[currentIndex + 1].slug, title: allPosts[currentIndex + 1].title }
          : null;

        setAdjacentPosts({ prev, next });
      } catch {
        // silent fail
      }
    }

    loadAdjacent();
    return () => { cancelled = true; };
  }, [post]);

  useCodeHighlight();

  const renderedContent = useMemo(
    () => (post ? renderMarkdown(post.content) : ''),
    [post]
  );

  const formattedDate = post?.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareDescription = post?.subtitle || post?.content?.slice(0, 160);

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

  return (
    <>
      <Helmet>
        <title>{`${post.title} | Hall of the Novice EX`}</title>
        <meta name="description" content={shareDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={shareDescription} />
        {post.cover_image && <meta property="og:image" content={post.cover_image} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={shareDescription} />
        {post.cover_image && <meta name="twitter:image" content={post.cover_image} />}
      </Helmet>

      <ReadingProgressBar />

      <article className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-8">
          {/* Main content */}
          <div className="w-full space-y-8">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <button
                onClick={() => navigate('/academia')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-[var(--color-outline)]/50 type-body font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar ao Códice
              </button>
            </motion.div>

            <motion.header
              className="space-y-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="type-label text-[var(--color-primary)] inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--color-primary)]/10">
                {post.category}
              </div>

              <h1 className="type-display font-cinzel text-[var(--color-on-surface)] break-words">
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
                <ReadingTimeBadge content={post.content} />
              </div>
            </motion.header>

            {post.cover_image && !imgError && (
              <motion.div
                className="rounded-2xl overflow-hidden border border-[var(--color-outline)]/50 max-h-[400px]"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              </motion.div>
            )}

            <motion.div
              className="glass p-6 sm:p-8 rounded-2xl border border-[var(--color-outline)]/50 type-body text-[var(--color-on-surface)]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </motion.div>

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

            <motion.div
              className="pt-6 border-t border-[var(--color-outline)]/30"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <h3 className="type-label text-[var(--color-on-surface-variant)] mb-3">Compartilhar</h3>
              <ShareButtons
                title={post.title}
                description={shareDescription}
                url={shareUrl}
              />
            </motion.div>

            <PostNavigation
              prevPost={adjacentPosts.prev}
              nextPost={adjacentPosts.next}
            />
          </div>
        </div>
      </article>
    </>
  );
};
