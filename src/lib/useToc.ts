import { useState, useEffect, useCallback, useRef } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function useToc(contentHtml: string) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = document.querySelector('.prose');
    if (!container) return;

    const elements = container.querySelectorAll('h2, h3');
    const items: TocItem[] = [];

    elements.forEach((el) => {
      const id = el.id || el.textContent?.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '';
      if (!el.id) el.id = id;
      items.push({
        id,
        text: el.textContent?.trim() || '',
        level: el.tagName === 'H2' ? 2 : 3,
      });
    });

    setHeadings(items);

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    elements.forEach((el) => observer.observe(el));
    observerRef.current = observer;

    return () => {
      observer.disconnect();
    };
  }, [contentHtml]);

  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return { headings, activeId, scrollToHeading };
}
