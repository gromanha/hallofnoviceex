import React, { useState, memo } from 'react';
import { Calendar, User, Pin, ArrowRight, Tag, ImageOff } from 'lucide-react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

export const PostCard: React.FC<PostCardProps> = memo(({ post, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <article
      onClick={onClick}
      className="group relative bg-[var(--color-surface)] rounded-2xl overflow-hidden border border-[var(--color-outline-variant)] hover:border-[var(--color-secondary)]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col h-full"
    >
      {/* Cover Image */}
      {post.cover_image && !imgError && (
        <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-900">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          {post.is_pinned && (
            <div className="absolute top-3 right-3 bg-[var(--color-secondary)] text-slate-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Pin className="w-3.5 h-3.5 fill-current" />
              Destaque
            </div>
          )}

          <div className="absolute bottom-3 left-3 bg-[var(--color-primary)]/90 text-white text-xs font-semibold uppercase px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
            {post.category}
          </div>
        </div>
      )}

      {/* Fallback when image fails */}
      {post.cover_image && imgError && (
        <div className="relative h-32 bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 flex items-center justify-center">
          <ImageOff className="w-8 h-8 text-slate-400" />
          <div className="absolute bottom-3 left-3 bg-[var(--color-primary)]/90 text-white text-xs font-semibold uppercase px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
            {post.category}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {!post.cover_image && post.is_pinned && (
            <div className="inline-flex items-center gap-1 bg-[var(--color-secondary)] text-slate-950 text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">
              <Pin className="w-3 h-3 fill-current" />
              Destaque
            </div>
          )}

          <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] dark:group-hover:text-[var(--color-crystal)] transition-colors mb-2 line-clamp-2 break-words">
            {post.title}
          </h3>

          {post.subtitle && (
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4 line-clamp-2 leading-relaxed break-words">
              {post.subtitle}
            </p>
          )}
        </div>

        {/* Tags & Meta */}
        <div className="pt-4 border-t border-[var(--color-outline-variant)] mt-4">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-[var(--color-on-surface-variant)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {post.author_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>

            <span className="text-[var(--color-primary)] dark:text-[var(--color-crystal)] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ler <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

      </div>
    </article>
  );
});

PostCard.displayName = 'PostCard';
