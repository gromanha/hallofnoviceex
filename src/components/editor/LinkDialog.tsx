import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link as LinkIcon, X } from 'lucide-react'
import { useEscapeKey } from '../../lib/useEscapeKey'

interface LinkDialogProps {
  open: boolean
  onClose: () => void
  onInsert: (url: string, text?: string) => void
  initialUrl?: string
  initialText?: string
}

export function LinkDialog({
  open,
  onClose,
  onInsert,
  initialUrl = '',
  initialText = '',
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl)
  const [text, setText] = useState(initialText)
  const [error, setError] = useState('')

  useEscapeKey(onClose, open)

  useEffect(() => {
    if (open) {
      setUrl(initialUrl)
      setText(initialText)
      setError('')
    }
  }, [open, initialUrl, initialText])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      setError('URL é obrigatória')
      return
    }
    try {
      new URL(url)
      onInsert(url, text || undefined)
      onClose()
    } catch {
      setError('URL inválida')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[var(--color-background)]/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Inserir link"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="glass rounded-2xl max-w-md w-full p-6 border border-[var(--color-outline)]/50 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-display font-bold text-sm text-[var(--color-on-surface)]">
                  Inserir Link
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">
                  URL do Link *
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={e => {
                    setUrl(e.target.value)
                    setError('')
                  }}
                  placeholder="https://exemplo.com"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                  autoFocus
                />
                {error && (
                  <p className="text-[10px] text-[var(--color-crimson)] mt-1">{error}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">
                  Texto do Link (opcional)
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Texto exibido"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[var(--color-surface-alt)] border border-[var(--color-outline)]/50 text-[10px] font-bold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-[10px] font-bold transition-all shadow-md"
                >
                  Inserir
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
