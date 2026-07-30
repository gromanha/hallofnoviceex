import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, Link as LinkIcon, X, ZoomIn, ZoomOut, RotateCw, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useImageUpload } from '../../lib/useImageUpload';
import { useEscapeKey } from '../../lib/useEscapeKey';

interface ImagePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
}

type Tab = 'upload' | 'url';

export function ImagePickerDialog({ open, onClose, onInsert }: ImagePickerDialogProps) {
  const [tab, setTab] = useState<Tab>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlPreview, setUrlPreview] = useState('');
  const [cropArea, setCropArea] = useState<any>(null);

  const upload = useImageUpload();
  const cropRef = useRef<any>(null);

  useEscapeKey(onClose, open);

  const handleUploadConfirm = useCallback(async () => {
    const url = await upload.upload(cropArea);
    if (url) {
      onInsert(url);
      handleClose();
    }
  }, [upload, cropArea, onInsert]);

  const handleUrlConfirm = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    onInsert(trimmed);
    handleClose();
  }, [urlInput, onInsert]);

  const handleClose = useCallback(() => {
    upload.reset();
    setUrlInput('');
    setUrlPreview('');
    setTab('upload');
    setCropArea(null);
    onClose();
  }, [upload, onClose]);

  const handleCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCropArea(croppedAreaPixels);
  }, []);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="image-picker-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[var(--color-background)]/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            key="image-picker-dialog"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[var(--color-surface)] border border-[var(--color-secondary)]/50 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-outline-variant)]">
              <h3 className="font-display font-bold text-sm text-[var(--color-on-surface)]">Inserir Imagem</h3>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--color-outline-variant)]">
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  tab === 'upload'
                    ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setTab('url')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                  tab === 'url'
                    ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-alt)]'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                URL
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {tab === 'upload' ? (
                <UploadTab
                  upload={upload}
                  onCropComplete={handleCropComplete}
                  onConfirm={handleUploadConfirm}
                />
              ) : (
                <UrlTab
                  urlInput={urlInput}
                  setUrlInput={setUrlInput}
                  urlPreview={urlPreview}
                  setUrlPreview={setUrlPreview}
                  onConfirm={handleUrlConfirm}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Upload Tab ─── */

function UploadTab({
  upload,
  onCropComplete,
  onConfirm,
}: {
  upload: ReturnType<typeof useImageUpload>;
  onCropComplete: (area: any, pixels: any) => void;
  onConfirm: () => void;
}) {
  const { getRootProps, getInputProps, isDragActive, file, preview, crop, zoom, setCrop, setZoom, uploading, uploadError } = upload;

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
            isDragActive
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
              : 'border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-alt)]/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className={`w-8 h-8 ${isDragActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`} />
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--color-on-surface)]">
              {isDragActive ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
            </p>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
              JPEG, PNG, WebP, GIF, AVIF (máx. 10MB)
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Crop area */}
          <div className="relative w-full h-64 rounded-xl overflow-hidden bg-[var(--color-background)]">
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              rotation={0}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              cropShape="rect"
              showGrid
            />
          </div>

          {/* Zoom control */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[var(--color-outline-variant)] rounded-full appearance-none cursor-pointer accent-[var(--color-primary)]"
            />
            <ZoomIn className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
          </div>
        </>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-crimson)]/10 border border-[var(--color-crimson)]/30 text-[var(--color-crimson)] text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {uploadError}
        </div>
      )}

      {/* Actions */}
      {file && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => upload.reset()}
            className="px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-xs font-bold hover:bg-[var(--color-surface-alt)] transition-all"
          >
            Trocar imagem
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Inserir
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── URL Tab ─── */

function UrlTab({
  urlInput,
  setUrlInput,
  urlPreview,
  setUrlPreview,
  onConfirm,
}: {
  urlInput: string;
  setUrlInput: (v: string) => void;
  urlPreview: string;
  setUrlPreview: (v: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">
          URL da Imagem
        </label>
        <input
          type="url"
          value={urlInput}
          onChange={e => {
            setUrlInput(e.target.value);
            setUrlPreview('');
          }}
          onBlur={() => {
            if (urlInput.trim()) setUrlPreview(urlInput.trim());
          }}
          placeholder="https://exemplo.com/imagen.jpg"
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none text-sm"
          autoFocus
        />
      </div>

      {urlPreview && (
        <div className="relative rounded-xl overflow-hidden bg-[var(--color-background)] border border-[var(--color-outline-variant)]">
          <img
            src={urlPreview}
            alt="Preview"
            className="w-full max-h-48 object-contain"
            onError={() => setUrlPreview('')}
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={!urlInput.trim()}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          Inserir
        </button>
      </div>
    </div>
  );
}
