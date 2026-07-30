import React from 'react';
import { Check, Loader2, AlertCircle, Image, FileText, Link2 } from 'lucide-react';

export type LogEntry = {
  id: number;
  type: 'info' | 'success' | 'error' | 'loading';
  message: string;
  timestamp: string;
};

type WikiImportProgressProps = {
  progress: number;
  logs: LogEntry[];
  isImporting: boolean;
};

export const WikiImportProgress: React.FC<WikiImportProgressProps> = ({ progress, logs, isImporting }) => {
  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-3.5 h-3.5 text-[var(--color-sage)] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-3.5 h-3.5 text-[var(--color-crimson)] shrink-0" />;
      case 'loading':
        return <Loader2 className="w-3.5 h-3.5 text-[var(--color-primary)] animate-spin shrink-0" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-[var(--color-on-surface-variant)] shrink-0" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
            {isImporting ? 'Importando...' : progress >= 100 ? 'Concluído' : 'Progresso'}
          </span>
          <span className="font-mono text-[var(--color-primary)]">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2.5 bg-[var(--color-background)] rounded-full overflow-hidden border border-[var(--color-outline-variant)]">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: progress >= 100
                ? 'var(--color-sage)'
                : 'var(--color-primary)',
            }}
          />
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-xs font-mono">
              {getIcon(log.type)}
              <span className={
                log.type === 'error' ? 'text-[var(--color-crimson)]' :
                log.type === 'success' ? 'text-[var(--color-sage)]' :
                'text-[var(--color-on-surface-variant)]'
              }>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
