import React, { useState, useRef } from 'react';
import {
  X, Upload, FileJson, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEscapeKey } from '../lib/useEscapeKey';
import { apiPost } from '../lib/api';

interface LocalPostData {
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  category: string;
  cover_image?: string | null;
  tags?: string[];
  is_pinned?: boolean;
  status?: 'published' | 'draft';
  published_at?: string | null;
  source_url?: string;
}

interface ImportLocalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export const ImportLocalModal: React.FC<ImportLocalModalProps> = ({ isOpen, onClose, onImported }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<LocalPostData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ slug: string; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEscapeKey(onClose, isOpen && !saving);

  function reset() {
    setFile(null);
    setPreview(null);
    setParseError(null);
    setStatus('published');
    setSaving(false);
    setResult(null);
    setError(null);
  }

  function handleClose() {
    if (!saving) {
      reset();
      onClose();
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    reset();
    setFile(selected);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const data = JSON.parse(text) as LocalPostData;

        // Validate required fields
        if (!data.title || !data.content) {
          setParseError('JSON inválido: campos "title" e "content" são obrigatórios.');
          return;
        }

        setPreview(data);
      } catch {
        setParseError('Não foi possível ler o arquivo. Verifique se é um JSON válido.');
      }
    };
    reader.readAsText(selected);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/json') {
      // Trigger the same logic as file input
      const syntheticEvent = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(syntheticEvent);
    }
  }

  async function handleImport() {
    if (!preview) return;
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: preview.title,
        slug: preview.slug,
        subtitle: preview.subtitle || `Importado de ${preview.source_url || 'JSON local'}`,
        content: preview.content,
        category: preview.category || 'guias',
        cover_image: preview.cover_image || null,
        tags: preview.tags || [],
        is_pinned: preview.is_pinned || false,
        status,
        published_at: status === 'published' ? new Date().toISOString() : null,
        source_url: preview.source_url || null,
      };

      const res = await apiPost<{ id: string; slug: string }>('/api/posts', payload);
      setResult({ id: res.id, slug: res.slug });
      onImported();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar no Supabase.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

          <motion.div
            className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
              <div className="flex items-center gap-2">
                <FileJson size={20} className="text-amber-400" />
                <h2 className="text-lg font-semibold text-white">Importar JSON Local</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={saving}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Success */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <span className="font-medium text-emerald-300">Post importado com sucesso!</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/post/${result.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-400 hover:text-emerald-300"
                    >
                      Ver post
                    </a>
                    <button
                      onClick={handleClose}
                      className="ml-auto px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/30 border border-red-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={18} className="text-red-400" />
                    <span className="font-medium text-red-300">Erro na importação</span>
                  </div>
                  <p className="text-sm text-gray-300">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Tentar novamente
                  </button>
                </motion.div>
              )}

              {/* File Upload Zone */}
              {!preview && !result && (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload size={40} className="text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-300 font-medium mb-1">
                    Arraste um arquivo JSON aqui
                  </p>
                  <p className="text-gray-500 text-sm">
                    ou clique para selecionar
                  </p>
                  <p className="text-gray-600 text-xs mt-2">
                    Arquivo gerado pelo script <code className="text-amber-400">wiki-import.js --local-only</code>
                  </p>
                </div>
              )}

              {/* Parse Error */}
              {parseError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/30 border border-red-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={18} className="text-red-400" />
                    <span className="font-medium text-red-300">Erro ao ler arquivo</span>
                  </div>
                  <p className="text-sm text-gray-300">{parseError}</p>
                  <button
                    onClick={reset}
                    className="mt-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Selecionar outro arquivo
                  </button>
                </motion.div>
              )}

              {/* Preview */}
              {preview && !result && (
                <>
                  {/* File info */}
                  <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                    <FileJson size={20} className="text-amber-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{file?.name}</p>
                      <p className="text-xs text-gray-400">
                        {((file?.size || 0) / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={reset}
                      disabled={saving}
                      className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      Trocar arquivo
                    </button>
                  </div>

                  {/* Preview Content */}
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Título</label>
                      <p className="text-white font-medium">{preview.title}</p>
                    </div>

                    {preview.subtitle && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Subtítulo</label>
                        <p className="text-gray-300 text-sm">{preview.subtitle}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Categoria</label>
                        <span className="inline-block px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300">
                          {preview.category || 'guias'}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Tags</label>
                        <p className="text-gray-300 text-xs">
                          {preview.tags?.length ? preview.tags.join(', ') : 'Nenhuma'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Conteúdo ({preview.content.length} caracteres)
                      </label>
                      <div className="max-h-40 overflow-y-auto bg-gray-900 rounded-lg p-3 text-xs text-gray-400 font-mono whitespace-pre-wrap">
                        {preview.content.substring(0, 1000)}
                        {preview.content.length > 1000 && '...'}
                      </div>
                    </div>

                    {preview.source_url && (
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Fonte</label>
                        <a
                          href={preview.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 break-all"
                        >
                          {preview.source_url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-300">Status:</label>
                    <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="local-import-status"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                        disabled={saving}
                        className="accent-emerald-500"
                      />
                      Publicado
                    </label>
                    <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="local-import-status"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                        disabled={saving}
                        className="accent-emerald-500"
                      />
                      Rascunho
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700 shrink-0">
              {!result && (
                <>
                  <button
                    onClick={handleClose}
                    disabled={saving}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!preview || saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Importar
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
