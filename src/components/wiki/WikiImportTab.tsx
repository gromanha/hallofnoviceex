import React, { useState, useCallback } from 'react';
import { Globe, Search, Download, Loader2, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { apiPost } from '../../lib/api';
import { WikiImportProgress, LogEntry } from './WikiImportProgress';
import { WikiImportPreview } from './WikiImportPreview';

type PreviewData = {
  title: string;
  subtitle: string;
  coverImage: string;
  imagesCount: number;
  tables: number;
  internalLinks: number;
  htmlSizeFormatted: string;
};

type ImportResult = {
  success: boolean;
  slug: string;
  url: string;
  imagesCount: number;
  title: string;
};

export const WikiImportTab: React.FC = () => {
  const [url, setUrl] = useState('');
  const [translate, setTranslate] = useState(false);
  const [multilinks, setMultilinks] = useState(true);
  const [category, setCategory] = useState('guias');
  const [importStatus, setImportStatus] = useState<'draft' | 'published'>('draft');

  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toISOString(),
    }]);
  }, []);

  const handlePreview = async () => {
    if (!url.trim()) return;

    setIsPreviewing(true);
    setPreviewData(null);
    setError(null);
    setLogs([]);

    try {
      addLog('loading', 'Buscando dados da wiki...');
      setProgress(10);

      const data = await apiPost<PreviewData>('/api/wiki-preview', { url, multilinks });
      setPreviewData(data);
      setProgress(100);
      addLog('success', `Preview carregado: ${data.title}`);
    } catch (err: any) {
      const msg = err?.message || err?.body?.message || 'Falha ao buscar preview';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!url.trim()) return;

    setIsImporting(true);
    setProgress(0);
    setLogs([]);
    setImportResult(null);
    setError(null);

    try {
      addLog('info', 'Iniciando importação...');
      setProgress(5);

      addLog('loading', 'Conectando à wiki...');
      setProgress(15);

      const result = await apiPost<ImportResult>('/api/wiki-import', {
        url,
        translate,
        multilinks,
        category,
        status: importStatus,
      });

      setProgress(100);

      if (translate) {
        addLog('loading', 'Traduzindo conteúdo...');
        setProgress(80);
      }

      addLog('loading', 'Baixando e hospedando imagens...');
      setProgress(60);

      addLog('success', `${result.imagesCount} imagens baixadas e hospedadas`);
      setProgress(85);

      addLog('success', `Post criado: ${result.title}`);
      setProgress(95);

      addLog('success', `Importação concluída! Slug: ${result.slug}`);
      setProgress(100);

      setImportResult(result);
    } catch (err: any) {
      const msg = err?.message || err?.body?.message || 'Falha na importação';
      setError(msg);
      addLog('error', msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setPreviewData(null);
    setImportResult(null);
    setError(null);
    setLogs([]);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl p-5 space-y-4">
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
            URL da Wiki
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" />
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://ffxiv.consolegameswiki.com/wiki/Phantom_Weapons"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] type-body text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                disabled={isImporting}
              />
            </div>
            <button
              onClick={() => void handlePreview()}
              disabled={!url.trim() || isPreviewing || isImporting}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-alt)] hover:bg-[var(--color-outline)] border border-[var(--color-outline-variant)] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isPreviewing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Visualizar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="flex items-center gap-2 text-xs cursor-pointer p-2 rounded-lg hover:bg-[var(--color-background)]">
            <input
              type="checkbox"
              checked={translate}
              onChange={e => setTranslate(e.target.checked)}
              className="accent-[var(--color-primary)] rounded"
              disabled={isImporting}
            />
            <span className="font-bold text-[var(--color-on-surface)]">Traduzir para PT-BR</span>
          </label>

          <label className="flex items-center gap-2 text-xs cursor-pointer p-2 rounded-lg hover:bg-[var(--color-background)]">
            <input
              type="checkbox"
              checked={multilinks}
              onChange={e => setMultilinks(e.target.checked)}
              className="accent-[var(--color-primary)] rounded"
              disabled={isImporting}
            />
            <span className="font-bold text-[var(--color-on-surface)]">Multi-links</span>
          </label>

          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Categoria
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              disabled={isImporting}
            >
              <option value="guias">Guias</option>
              <option value="noticias">Notícias</option>
              <option value="codice">Códice</option>
              <option value="anuncios">Anúncios</option>
              <option value="crafting">Crafting</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
              Status
            </label>
            <select
              value={importStatus}
              onChange={e => setImportStatus(e.target.value as 'draft' | 'published')}
              className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              disabled={isImporting}
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => void handleImport()}
            disabled={!url.trim() || isImporting}
            className="px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-[var(--color-on-primary)] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:shadow-md"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Importar
              </>
            )}
          </button>

          {(previewData || importResult || error) && (
            <button
              onClick={handleReset}
              disabled={isImporting}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-surface-alt)] hover:bg-[var(--color-outline)] border border-[var(--color-outline-variant)] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="type-body text-[var(--color-crimson)] bg-[var(--color-crimson)]/10 border border-[var(--color-crimson)]/30 rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {previewData && !importResult && (
        <div className="space-y-4">
          <h3 className="type-label text-[var(--color-on-surface-variant)] uppercase tracking-wider text-xs">
            Preview
          </h3>
          <WikiImportPreview data={previewData} />
        </div>
      )}

      {(isImporting || logs.length > 0) && (
        <div className="space-y-4">
          <h3 className="type-label text-[var(--color-on-surface-variant)] uppercase tracking-wider text-xs">
            Progresso
          </h3>
          <WikiImportProgress progress={progress} logs={logs} isImporting={isImporting} />
        </div>
      )}

      {importResult && (
        <div className="bg-[var(--color-sage)]/10 border border-[var(--color-sage)]/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-[var(--color-sage)]" />
            <h3 className="type-title text-[var(--color-sage)]">Importação Concluída!</h3>
          </div>
          <div className="space-y-1 text-xs text-[var(--color-on-surface)]">
            <p><strong>Título:</strong> {importResult.title}</p>
            <p><strong>Slug:</strong> {importResult.slug}</p>
            <p><strong>Imagens:</strong> {importResult.imagesCount} baixadas e hospedadas</p>
          </div>
          <a
            href={importResult.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-sage)] text-white text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Post
          </a>
        </div>
      )}
    </div>
  );
};
