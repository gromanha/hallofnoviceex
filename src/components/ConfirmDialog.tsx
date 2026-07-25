import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useEscapeKey } from '../lib/useEscapeKey';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  useEscapeKey(onCancel, open);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onClick={onCancel}
    >
      <div
        className="bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">{title}</h3>
        </div>

        <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-xs font-bold text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
