import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Download, Loader2, CheckCircle2, AlertCircle, ExternalLink,
  Circle, CircleCheck, CircleX, CircleMinus, ChevronDown, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEscapeKey } from '../lib/useEscapeKey';

type StepStatus = 'pending' | 'running' | 'success' | 'error' | 'skip';

interface LogStep {
  id: string;
  label: string;
  status: StepStatus;
  detail: string | null;
  ts: number;
}

interface ImportResult {
  post: { id: string; slug: string; title: string };
  meta: {
    wikiTitle: string;
    iconStats: { found: number; total: number };
    translated: boolean;
  };
  steps?: LogStep[];
}

interface ImportWikiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported: () => void;
}

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'running':
      return <Loader2 size={16} className="text-blue-400 animate-spin" />;
    case 'success':
      return <CircleCheck size={16} className="text-emerald-400" />;
    case 'error':
      return <CircleX size={16} className="text-red-400" />;
    case 'skip':
      return <CircleMinus size={16} className="text-gray-500" />;
    default:
      return <Circle size={16} className="text-gray-600" />;
  }
}

function formatMs(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export const ImportWikiModal: React.FC<ImportWikiModalProps> = ({ isOpen, onClose, onImported }) => {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [enrichIcons, setEnrichIcons] = useState(true);

  const [steps, setSteps] = useState<LogStep[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [logExpanded, setLogExpanded] = useState(true);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const urlInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      setCategory('');
      setTagsStr('');
      setStatus('published');
      setEnrichIcons(true);
      setSteps([]);
      setResult(null);
      setIsRunning(false);
      setIsDone(false);
      setLogExpanded(true);
      setStartTime(0);
      setElapsed(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => urlInputRef.current?.focus(), 100);
  }, [isOpen]);

  // Auto-scroll log
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [steps]);

  // Elapsed timer
  useEffect(() => {
    if (isRunning && startTime > 0) {
      timerRef.current = setInterval(() => setElapsed(Date.now() - startTime), 100);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, startTime]);

  useEscapeKey(onClose, isOpen && !isRunning);

  const updateStep = useCallback((id: string, label: string, stepStatus: StepStatus, detail: string | null) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const entry: LogStep = { id, label, status: stepStatus, detail, ts: Date.now() };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
  }, []);

  const initSteps = useCallback(() => {
    const ids = ['wiki_fetch', 'translate', 'enrich', 'metadata', 'slug', 'save'];
    const labels = ['Buscando página na Wiki', 'Traduzindo para PT-BR', 'Buscando ícones na XIVAPI', 'Extraindo metadados', 'Gerando slug', 'Salvando no Supabase'];
    setSteps(ids.map((id, i) => ({
      id, label: labels[i], status: 'pending' as StepStatus, detail: null, ts: Date.now(),
    })));
  }, []);

  /**
   * Handle Vercel response: single JSON with steps[] array.
   * Simulates step-by-step appearance with delays.
   */
  const handleVercelResponse = useCallback(async (data: ImportResult) => {
    const serverSteps = data.steps || [];
    for (let i = 0; i < serverSteps.length; i++) {
      const s = serverSteps[i];
      updateStep(s.id, s.label, s.status as StepStatus, s.detail);
      // Small delay between steps for visual effect
      if (i < serverSteps.length - 1) await new Promise((r) => setTimeout(r, 300));
    }
    setResult(data);
    setIsDone(true);
    setIsRunning(false);
    onImported();
  }, [updateStep, onImported]);

  /**
   * Handle SSE stream response (local Express server).
   */
  const handleSSEResponse = useCallback(async (res: Response) => {
    const reader = res.body?.getReader();
    if (!reader) throw new Error('Stream not supported');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let currentEvent = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (currentEvent === 'step') {
              updateStep(parsed.id, parsed.label, parsed.status, parsed.detail);
            } else if (currentEvent === 'result') {
              setResult(parsed);
            } else if (currentEvent === 'done') {
              setIsDone(true);
              setIsRunning(false);
              if (parsed.ok) onImported();
            }
          } catch { /* ignore */ }
        }
      }
    }
  }, [updateStep, onImported]);

  const runImport = useCallback(async (importStatus: 'published' | 'draft') => {
    if (!url.trim() || isRunning) return;

    setIsRunning(true);
    setIsDone(false);
    setSteps([]);
    setResult(null);
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);
    initSteps();

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/posts/import', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          category: category || undefined,
          tags: tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [],
          status: importStatus,
          enrichIcons,
        }),
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') || '';

      if (!res.ok) {
        // Try to parse error with steps
        const body = await res.json().catch(() => null);
        if (body?.steps) {
          for (const s of body.steps) updateStep(s.id, s.label, s.status, s.detail);
        }
        throw new Error(body?.message || body?.error || `HTTP ${res.status}`);
      }

      if (contentType.includes('text/event-stream')) {
        // Local Express — SSE stream
        await handleSSEResponse(res);
      } else {
        // Vercel serverless — single JSON with steps[]
        const data: ImportResult = await res.json();
        await handleVercelResponse(data);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        updateStep('error', 'Cancelado', 'error', 'Importação cancelada pelo usuário');
      } else {
        updateStep('error', 'Erro de conexão', 'error', err.message);
      }
      setIsDone(true);
      setIsRunning(false);
    } finally {
      abortRef.current = null;
    }
  }, [url, category, tagsStr, enrichIcons, isRunning, initSteps, updateStep, handleSSEResponse, handleVercelResponse, onImported]);

  const handleCancel = () => abortRef.current?.abort();

  const successCount = steps.filter((s) => s.status === 'success').length;
  const errorCount = steps.filter((s) => s.status === 'error').length;
  const allDone = isDone;
  const overallSuccess = allDone && errorCount === 0 && steps.length > 0;

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
          <div className="absolute inset-0 bg-black/50" onClick={isRunning ? undefined : onClose} />

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
                <Download size={20} className="text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Importar da Wiki FFXIV</h2>
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full">
                    <Loader2 size={12} className="animate-spin" />
                    {successCount}/{steps.length}
                  </span>
                )}
              </div>
              <button
                onClick={isRunning ? handleCancel : onClose}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">URL da Wiki</label>
                <input
                  ref={urlInputRef}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://ffxiv.consolegameswiki.com/wiki/..."
                  disabled={isRunning}
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
                    disabled={isRunning}
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
                    disabled={isRunning}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Status + Icons */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-gray-300">Status:</label>
                  <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                    <input type="radio" name="import-status" checked={status === 'published'} onChange={() => setStatus('published')} disabled={isRunning} className="accent-emerald-500" />
                    Publicado
                  </label>
                  <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                    <input type="radio" name="import-status" checked={status === 'draft'} onChange={() => setStatus('draft')} disabled={isRunning} className="accent-emerald-500" />
                    Rascunho
                  </label>
                </div>
                <label className="flex items-center gap-1.5 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={enrichIcons} onChange={(e) => setEnrichIcons(e.target.checked)} disabled={isRunning} className="accent-emerald-500" />
                  Buscar ícones automáticos
                </label>
              </div>

              {/* ── Log Panel ── */}
              {(isRunning || isDone) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="border border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setLogExpanded(!logExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-800/50 hover:bg-gray-800 transition-colors text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {logExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                      <span className="font-medium text-gray-300">Log de Progresso</span>
                      {allDone && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${overallSuccess ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                          {overallSuccess ? 'Concluído' : `${errorCount} erro(s)`}
                        </span>
                      )}
                    </div>
                    {startTime > 0 && (
                      <span className="text-xs text-gray-500 font-mono">
                        {isDone ? `Total: ${formatMs(elapsed)}` : `+${formatMs(elapsed)}`}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {logExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="p-2 space-y-0.5 max-h-64 overflow-y-auto bg-gray-900/50 font-mono text-xs">
                          {steps.map((step) => (
                            <motion.div
                              key={step.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`flex items-start gap-2 px-2 py-1.5 rounded ${
                                step.status === 'error' ? 'bg-red-900/20' :
                                step.status === 'running' ? 'bg-blue-900/20' :
                                step.status === 'success' ? '' : 'opacity-50'
                              }`}
                            >
                              <StepIcon status={step.status} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${
                                    step.status === 'error' ? 'text-red-300' :
                                    step.status === 'success' ? 'text-emerald-300' :
                                    step.status === 'running' ? 'text-blue-300' : 'text-gray-500'
                                  }`}>{step.label}</span>
                                  <span className="text-gray-600">
                                    {step.status === 'running' ? '...' : step.status === 'success' ? 'ok' : step.status === 'error' ? 'FAIL' : step.status === 'skip' ? 'skip' : '...'}
                                  </span>
                                  {step.ts && step.ts > 0 && (
                                    <span className="text-gray-600 ml-auto">{formatMs(step.ts)}</span>
                                  )}
                                </div>
                                {step.detail && (
                                  <div className={`mt-0.5 ${step.status === 'error' ? 'text-red-400/70' : 'text-gray-500'}`}>
                                    {step.detail}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                          <div ref={logEndRef} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Success */}
              {overallSuccess && result && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <span className="font-medium text-emerald-300">Post importado com sucesso!</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>{result.meta.wikiTitle}</strong>
                    {result.meta.iconStats.total > 0 && (
                      <span className="ml-2">| Ícones: {result.meta.iconStats.found}/{result.meta.iconStats.total}</span>
                    )}
                  </p>
                  <div className="flex gap-2">
                    <a href={`/post/${result.post.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300">
                      <ExternalLink size={14} /> Ver post
                    </a>
                    <button onClick={onClose} className="ml-auto px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                      Fechar
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {!allDone && steps.some((s) => s.id === 'error' && s.status === 'error') && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={18} className="text-red-400" />
                    <span className="font-medium text-red-300">Erro na importação</span>
                  </div>
                  <p className="text-sm text-gray-300">{steps.find((s) => s.id === 'error')?.detail || 'Erro desconhecido'}</p>
                  <button onClick={() => { setIsDone(false); setSteps([]); }} className="mt-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                    Tentar novamente
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700 shrink-0">
              {!isRunning && !overallSuccess && (
                <>
                  <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancelar</button>
                  <button onClick={() => runImport(status)} disabled={!url.trim()} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <Download size={18} /> Importar
                  </button>
                </>
              )}
              {isRunning && (
                <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white text-sm rounded-lg transition-colors">
                  <X size={16} /> Cancelar
                </button>
              )}
              {overallSuccess && (
                <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">Fechar</button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
