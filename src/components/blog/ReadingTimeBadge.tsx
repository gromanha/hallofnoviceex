import { useMemo } from 'react';
import readingTime from 'reading-time';
import { Clock } from 'lucide-react';

interface ReadingTimeBadgeProps {
  content: string;
}

export function ReadingTimeBadge({ content }: ReadingTimeBadgeProps) {
  const stats = useMemo(() => readingTime(content), [content]);

  return (
    <span className="inline-flex items-center gap-1.5 type-caption font-medium text-[var(--color-on-surface-variant)]">
      <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
      {stats.text}
    </span>
  );
}
