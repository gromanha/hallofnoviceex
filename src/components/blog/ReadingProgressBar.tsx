import { ScrollProgress } from '@usefy/scroll-progress';

export function ReadingProgressBar() {
  return (
    <ScrollProgress
      color="var(--color-primary)"
      height={3}
      zIndex={9999}
      aria-label="Progresso de leitura"
    />
  );
}
