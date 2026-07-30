import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PostNavigationProps {
  prevPost: { slug: string; title: string } | null;
  nextPost: { slug: string; title: string } | null;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  const navigate = useNavigate();

  if (!prevPost && !nextPost) return null;

  return (
    <motion.nav
      className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-[var(--color-outline)]/30"
      aria-label="Navegação entre posts"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      {prevPost ? (
        <button
          onClick={() => navigate(`/post/${prevPost.slug}`)}
          className="flex-1 flex items-center gap-3 p-4 glass rounded-xl border border-[var(--color-outline)]/30 hover:border-[var(--color-primary)]/50 transition-all text-left group"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
          <div className="min-w-0">
            <span className="type-caption text-[var(--color-on-surface-variant)] block">Post Anterior</span>
            <span className="type-body font-medium text-[var(--color-on-surface)] truncate block">
              {prevPost.title}
            </span>
          </div>
        </button>
      ) : (
        <div className="flex-1" />
      )}

      {nextPost ? (
        <button
          onClick={() => navigate(`/post/${nextPost.slug}`)}
          className="flex-1 flex items-center gap-3 p-4 glass rounded-xl border border-[var(--color-outline)]/30 hover:border-[var(--color-primary)]/50 transition-all text-right group"
        >
          <div className="min-w-0 flex-1">
            <span className="type-caption text-[var(--color-on-surface-variant)] block">Próximo Post</span>
            <span className="type-body font-medium text-[var(--color-on-surface)] truncate block">
              {nextPost.title}
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)] transition-colors shrink-0" />
        </button>
      ) : (
        <div className="flex-1" />
      )}
    </motion.nav>
  );
}
