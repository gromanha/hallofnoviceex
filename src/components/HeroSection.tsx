import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, BookOpen, Calendar, UtensilsCrossed, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  totalGuides?: number;
  totalEvents?: number;
  totalRecipes?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalGuides = 0,
  totalEvents = 0,
  totalRecipes = 0,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [heroImgLoaded, setHeroImgLoaded] = useState(false);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/academia?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  const stats = [
    { icon: BookOpen, label: 'Guias', value: totalGuides, color: 'var(--color-primary)' },
    { icon: Calendar, label: 'Eventos', value: totalEvents, color: 'var(--color-secondary)' },
    { icon: UtensilsCrossed, label: 'Receitas', value: totalRecipes, color: 'var(--color-lavender)' },
  ];

  return (
    <section className="hero-campus relative">
      {/* Background image with blur-up placeholder */}
      <div className="absolute inset-0 z-0 bg-[var(--color-surface)]">
        <img
          src="/images/hero-campus.png"
          alt=""
          className={`w-full h-full object-cover transition-all duration-700 ${heroImgLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}
          loading="eager"
          fetchPriority="high"
          aria-hidden="true"
          onLoad={() => setHeroImgLoaded(true)}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1]" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-background)]/40 to-[var(--color-background)]/95" />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden" aria-hidden="true">
        <motion.img
          src="/svg/floating-book.svg"
          alt=""
          className="absolute top-[15%] left-[8%] w-8 h-8 opacity-30"
          animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.img
          src="/svg/floating-book.svg"
          alt=""
          className="absolute top-[20%] right-[12%] w-6 h-6 opacity-20"
          animate={{ y: [0, -6, 0], rotate: [2, -2, 2] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute bottom-[30%] left-[15%] w-3 h-3 rounded-full bg-[var(--color-crystal)]/40"
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[25%] right-[18%] w-2 h-2 rounded-full bg-[var(--color-secondary)]/30"
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      {/* Content */}
      <div className="hero-campus-content relative z-[3] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-28 pb-16 sm:pb-20">
        <div className="flex flex-col items-center text-center space-y-8">

          {/* Academy Crest */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src="/svg/academy-crest.svg"
              alt="Brasão da Academia"
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto opacity-80 crystal-glow"
            />
          </motion.div>

          {/* Academy Name */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-cinzel font-bold text-[var(--type-display-size)] leading-[var(--type-display-leading)] tracking-[var(--type-display-tracking)] text-[var(--color-on-surface)]">
              Hall of the Novice{' '}
              <span className="text-[var(--color-primary)]">EX</span>
            </h1>
            <p className="type-headline font-cinzel text-[var(--color-on-surface-variant)] max-w-xl mx-auto">
              Majestic Battle Academy
            </p>
          </motion.div>

          {/* Sharlayan Motto */}
          <motion.p
            className="type-body italic font-cormorant text-[var(--color-lavender)] max-w-md text-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            "Onde o conhecimento se torna a sua maior magia."
          </motion.p>

          {/* Search Bar */}
          <motion.form
            onSubmit={handleSearch}
            className="w-full max-w-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="glass rounded-2xl border border-[var(--color-outline)]/50 p-1 transition-all focus-within:border-[var(--color-primary)]/50 focus-within:shadow-[0_0_0_3px_rgba(91,164,181,0.1)]">
              <div className="flex items-center gap-3 px-4 py-3">
                <Search className="w-5 h-5 text-[var(--color-on-surface-variant)] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar na academia..."
                  className="search-input flex-1 bg-transparent type-body text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/60 outline-none rounded-xl px-2 py-1"
                  aria-label="Pesquisar na academia"
                />
                <button
                  type="submit"
                  className="shrink-0 px-4 py-1.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white text-xs font-bold transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/30"
                >
                  Buscar
                </button>
              </div>
            </div>
          </motion.form>

          {/* Stats Badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="badge-appear flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-surface)]/80 border border-[var(--color-outline)]/40 backdrop-blur-sm"
                style={{ animationDelay: `${0.45 + index * 0.1}s` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="type-label uppercase text-[var(--color-on-surface-variant)]">
                  {stat.value} {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => navigate('/academia')}
              className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-deep)] text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-[var(--color-primary)]/30 hover:scale-[1.02] border border-transparent hover:border-[#C9A84C]/40"
            >
              <BookOpen className="w-4 h-4" />
              Conheça a Academia
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="https://discord.gg/3XJgrsVUbP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[var(--color-surface-alt)] hover:bg-[var(--color-surface)] border-2 border-[#C9A84C]/40 hover:border-[#C9A84C]/60 hover:bg-[#C9A84C]/5 text-[var(--color-on-surface)] font-bold text-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Entrar no Discord
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
