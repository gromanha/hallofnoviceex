import { useState } from 'react';
import { ChevronDown, List } from 'lucide-react';
import { useToc } from '../../lib/useToc';
import { motion, AnimatePresence } from 'motion/react';

interface TableOfContentsProps {
  contentHtml: string;
}

export function TableOfContents({ contentHtml }: TableOfContentsProps) {
  const { headings, activeId, scrollToHeading } = useToc(contentHtml);
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length === 0) return null;

  const tocContent = (
    <nav aria-label="Sumário" className="space-y-1">
      {headings.map((heading) => (
        <button
          key={heading.id}
          onClick={() => {
            scrollToHeading(heading.id);
            setIsOpen(false);
          }}
          className={`
            block w-full text-left type-caption transition-all duration-200
            ${heading.level === 3 ? 'pl-4' : 'pl-0'}
            ${
              activeId === heading.id
                ? 'text-[var(--color-primary)] font-semibold'
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
            }
          `}
        >
          {heading.text}
        </button>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop: sidebar */}
      <aside className="hidden xl:block sticky top-24 self-start w-56 shrink-0">
        <div className="glass rounded-xl border border-[var(--color-outline)]/30 p-4">
          <h2 className="type-label text-[var(--color-on-surface-variant)] mb-3 flex items-center gap-2">
            <List className="w-4 h-4" />
            Sumário
          </h2>
          {tocContent}
        </div>
      </aside>

      {/* Mobile: collapsible */}
      <div className="xl:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 glass rounded-xl border border-[var(--color-outline)]/30 type-label text-[var(--color-on-surface-variant)]"
          aria-expanded={isOpen}
          aria-controls="toc-mobile"
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Sumário
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="toc-mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="glass rounded-xl border border-[var(--color-outline)]/30 p-4 mt-2">
                {tocContent}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
