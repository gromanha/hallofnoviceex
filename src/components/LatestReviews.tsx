import React from 'react';
import { motion } from 'motion/react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';

interface Review {
  id: number;
  title: string;
  content: string;
  author: string;
  avatar: string;
  rating: number;
  likes: number;
  comments: number;
  jobIcon: string;
}

const reviews: Review[] = [
  {
    id: 1,
    title: 'Excelente guia para iniciantes',
    content: 'Esse guia me ajudou muito a entender os fundamentos do jogo. Recomendo para todos os novatos!',
    author: 'Warrior_of_Light',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Warrior',
    rating: 5,
    likes: 42,
    comments: 8,
    jobIcon: '⚔️',
  },
  {
    id: 2,
    title: 'Dicas de crafting muito úteis',
    content: 'Consegui subir minha craftagem muito mais rápido seguindo essas dicas. Obrigado!',
    author: 'Master_Crafter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Crafter',
    rating: 4,
    likes: 28,
    comments: 5,
    jobIcon: '🔨',
  },
  {
    id: 3,
    title: 'Guia de raids bem detalhado',
    content: 'As estratégias explicadas aqui são muito claras. Finalmente consegui clear no Eden!',
    author: 'Raider_Pro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raider',
    rating: 5,
    likes: 56,
    comments: 12,
    jobIcon: '🛡️',
  },
];

export const LatestReviews: React.FC = () => {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="type-title text-[var(--color-on-surface)]">
              Últimas Avaliações
            </h2>
            <p className="type-caption text-[var(--color-on-surface-variant)] mt-1">
              Feedback da comunidade sobre nossos guias
            </p>
          </div>
          <button className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center gap-1 transition-colors">
            Ver todas
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-outline)]/30 hover:border-[var(--color-primary)]/50 transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/10"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'text-[var(--color-amber)] fill-[var(--color-amber)]'
                        : 'text-[var(--color-outline)]'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <h3 className="type-body font-semibold text-[var(--color-on-surface)] mb-2">
                {review.title}
              </h3>
              <p className="type-body text-[var(--color-on-surface-variant)] text-sm line-clamp-3 mb-4">
                {review.content}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-[var(--color-outline)]/30">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="w-8 h-8 rounded-full border border-[var(--color-outline)]/30"
                />
                <div className="flex-1 min-w-0">
                  <span className="type-label text-[var(--color-on-surface)] block truncate">
                    {review.author}
                  </span>
                </div>
                <span className="text-lg">{review.jobIcon}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-[var(--color-on-surface-variant)]">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="type-caption">{review.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="type-caption">{review.comments}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
