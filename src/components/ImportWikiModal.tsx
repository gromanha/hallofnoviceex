import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEscapeKey } from '../lib/useEscapeKey';
import { renderMarkdown } from '../lib/sanitize';
import { apiPost } from '../lib/api';

type ImportState = 'idle' | 'fetching' | 'translating' | 'enriching' | 'preview' | 'publishing' | 'success' | 'error';

interface ImportResult {
  post: { id: string; slug: string; title: string };
  meta: {
    wikiTitle: string;
    iconStats: { found: number; total: number };
    translated: boolean;
  };
}

interface ImportWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

export const ImportWikiModal: React.FC<ImportWikiModalProps> = ({ isOpen, onClose, onImported }) => {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [enrichIcons, setEnrichIcons] = useState(true);
  const [state, setState] = useState<ImportState>('idle');
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const urlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setCategory('');
      setTagsStr('');
      setStatus('published');
      setEnrichIcons(true);
      setState('idle');
      setProgressMsg('');
      setResult(null);
      setErrorMsg('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => urlInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEscapeKey(onClose, isOpen);

  const handleImport = async () => {
    if (!url.trim()) return;

    setState('fetching');
    setProgressMsg('Buscando conteúdo da wiki...');
    setErrorMsg('');

    try {
      // Simulate step messages
      const progressTimer = setTimeout(() => {
        setState('translating');
        setProgressMsg('Traduzindo para PT-BR...');
      }, 2000);

      const progressTimer2 = setTimeout(() => {
        setState('enriching');
        setProgressMsg('Buscando ícones na XIVAPI...');
      }, 5000);

      const data = await apiPost<{ post: ImportResult['post']; meta: ImportResult['meta'] }>(
        '/api/posts/import',
        {
          url: url.trim(),
          category: category || undefined,
          tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [],
          status,
          enrichIcons,
        }
      );

      clearTimeout(progressTimer);
      clearTimeout(progressTimer2);

      setResult(data as ImportResult);
      setState('success');
      onImported();
    } catch (err: any) {
      setState('error');
      setErrorMsg(err?.message || err?.body?.message || 'Erro ao importar da wiki');
    }
  };

  const handlePublishAsDraft = async () => {
    if (!url.trim()) return;

    setState('publishing');
    setProgressMsg('Salvando como rascunho...');
    setErrorMsg('');

    try {
      const data = await apiPost<{ post: ImportResult['post']; meta: ImportResult['meta'] }>(
        '/api/posts/import',
        {
          url: url.trim(),
          category: category || undefined,
          tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [],
          status: 'draft',
          enrichIcons,
        }
      );

      setResult(data as ImportResult);
      setState('success');
      onImported();
    } catch (err: any) {
      setState('error');
      setErrorMsg(err?.message || err?.body?.message || 'Erro ao importar da wiki');
    }
  };

  const isLoading = state === 'fetching' || state === 'translating' || state === 'enriching' || state === 'publishing';

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
          {/* Scrim */}
          <div className="absolute inset-0 bg-black/50" onClick={isLoading ? undefined : onClose} />

          {/* Modal */}
          <motion.div
            className="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Download size={20} className="text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Importar da Wiki FFXIV</h2>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">URL da Wiki</label>
                <input
                  ref={urlInputRef}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://ffxiv.consolegameswiki.com/wiki/..."
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  >
                    <option value="">Auto-detectar</option>
                    <option value="guias">Guias</option>
                    <option value="noticias">Notícias</option>
                    <option value="receitas">Receitas</option>
                    <option value="crafting">Crafting</option>
                    <option value="codice">Códice</option>
                    <option value="anuncios">Anúncios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                  <input
                    type="text"
                    value={tagsStr}
                    onChange={(e) => setTagsStr(e.target.value)}
                    placeholder="phantom, relic, dawntrail"
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Status + Icons toggle */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-300">Status:</label>
                  <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="import-status"
                      checked={status === 'published'}
                      onChange={() => setStatus('published')}
                      disabled={isLoading}
                      className="accent-emerald-500"
                    />
                    Publicado
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="import-status"
                      checked={status === 'draft'}
                      onChange={() => setStatus('draft')}
                      disabled={isLoading}
                      className="accent-emerald-500"
                    />
                    Rascunho
                  </label>
                </div>

                <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enrichIcons}
                    onChange={(e) => setEnrichIcons(e.target.checked)}
                    disabled={isLoading}
                    className="accent-emerald-500"
                  />
                  Buscar ícones automáticos
                </label>
              </div>

              {/* Action Buttons */}
              {!result && state !== 'success' && (
                <div className="flex gap-3">
                  <button
                    onClick={handleImport}
                    disabled={!url.trim() || isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Download size={18} />
                    )}
                    {isLoading ? progressMsg : 'Buscar, Traduzir e Enriquecer'}
                  </button>
                </div>
              )}

              {/* Success Result */}
              {state === 'success' && result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <span className="font-medium text-emerald-300">Post importado com sucesso!</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>{result.meta.wikiTitle}</strong>
                    {result.meta.iconStats.total > 0 && (
                      <span className="ml-2">
                        | Ícones: {result.meta.iconStats.found}/{result.meta.iconStats.total}
                      </span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={`/post/${result.post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300"
                    >
                      <ExternalLink size={14} />
                      Ver post
                    </a>
                    <button
                      onClick={onClose}
                      className="ml-auto px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {state === 'error' && errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-900/30 border border-red-700 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={18} className="text-red-400" />
                    <span className="font-medium text-red-300">Erro na importação</span>
                  </div>
                  <p className="text-sm text-gray-300">{errorMsg}</p>
                  <button
                    onClick={() => { setState('idle'); setErrorMsg(''); }}
                    className="mt-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                  >
                    Tentar novamente
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
