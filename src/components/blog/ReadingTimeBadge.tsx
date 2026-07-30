import { useMemo } from 'react';
import { Clock } from 'lucide-react';

interface ReadingTimeBadgeProps {
  content: string;
}

function estimateReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const textOnly = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const wordCount = textOnly ? textOnly.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  return `${minutes} min de leitura`;
}

export function ReadingTimeBadge({ content }: ReadingTimeBadgeProps) {
  const text = useMemo(() => estimateReadingTime(content), [content]);

  return (
    <span className="inline-flex items-center gap-1.5 type-caption font-medium text-[var(--color-on-surface-variant)]">
      <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
      {text}
    </span>
  );
}
