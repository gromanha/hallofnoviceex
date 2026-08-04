import React, { useState, memo } from 'react';
import { Calendar, User, Pin, ArrowRight, Tag, ImageOff } from 'lucide-react';
import { Post } from '../types';
import { getPostCategoryColor } from '../lib/colors';

interface PostCardProps {
  post: Post;
  onClick: () => void;
}

const THUMBNAILS = [
  '/images/thumb-01.png',
  '/images/thumb-02.png',
  '/images/thumb-03.png',
  '/images/thumb-04.png',
  '/images/thumb-05.png',
  '/images/thumb-06.png',
  '/images/thumb-07.png',
  '/images/thumb-08.png',
];

function getFallbackThumbnail(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return THUMBNAILS[Math.abs(hash) % THUMBNAILS.length];
}

export const PostCard: React.FC<PostCardProps> = memo(({ post, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const hasCoverImage = post.cover_image && !imgError;
  const displayImage = hasCoverImage ? post.cover_image : getFallbackThumbnail(post.slug);

  return (
    <a
      href={`/post/${post.slug}`}
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="group relative rounded-2xl overflow-hidden border border-[var(--color-outline)]/50 transition-all duration-300 cursor-pointer flex flex-col h-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] hover:border-[var(--color-primary)]/30 hover:shadow-[0_8px_24px_rgba(91,164,181,0.12)] hover:-translate-y-0.5 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-alt)]"
    >
      {/* Top gold accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

      {/* Cover Image */}
      <div className="relative h-48 sm:h-52 overflow-hidden bg-[var(--color-surface-alt)]">
        <img
          src={displayImage}
          alt={post.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${thumbLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          onLoad={() => setThumbLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-transparent to-transparent" />
        
        {post.is_pinned && (
          <div className="absolute top-3 right-3 bg-[var(--color-primary)] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
            <Pin className="w-3 h-3 fill-current" />
            Destaque
          </div>
        )}

        <div className={`absolute bottom-3 left-3 ${getPostCategoryColor(post.category).bg} ${getPostCategoryColor(post.category).text} text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg backdrop-blur-md border border-current/20`}>
          {post.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {!hasCoverImage && post.is_pinned && (
            <div className="inline-flex items-center gap-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold px-2 py-0.5 rounded-lg mb-3">
              <Pin className="w-3 h-3 fill-current" />
              Destaque
            </div>
          )}

          <h3 className="font-cinzel font-bold text-base text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors mb-2 line-clamp-2 break-words">
            {post.title}
          </h3>

          {post.subtitle && (
            <p className="type-body text-[var(--color-on-surface-variant)] mb-4 line-clamp-2 break-words">
              {post.subtitle}
            </p>
          )}
        </div>

        {/* Tags & Meta */}
        <div className="pt-3 border-t border-[var(--color-outline)]/30 mt-3">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="type-label normal-case px-2 py-0.5 rounded-lg bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)]"
                >
                  <Tag className="w-2.5 h-2.5 inline mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between type-caption text-[var(--color-on-surface-variant)]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {post.author_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
            </div>

            <span className="text-[var(--color-primary)] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Ler <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>
    </a>
  );
});

PostCard.displayName = 'PostCard';
