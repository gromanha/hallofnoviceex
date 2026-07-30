import { useState, useCallback, useRef } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { apiPost } from './api';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseImageUploadOptions {
  maxFileSize?: number;
  bucket?: string;
}

interface UseImageUploadReturn {
  getRootProps: ReturnType<typeof useDropzone>['getRootProps'];
  getInputProps: ReturnType<typeof useDropzone>['getInputProps'];
  isDragActive: boolean;
  file: File | null;
  preview: string;
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  setCrop: (c: { x: number; y: number }) => void;
  setZoom: (z: number) => void;
  setRotation: (r: number) => void;
  uploading: boolean;
  uploadError: string | null;
  uploadedUrl: string | null;
  upload: (cropArea?: CropArea | null) => Promise<string | null>;
  reset: () => void;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getCroppedImg(
  imageSrc: string,
  cropArea: CropArea
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = cropArea.width * scaleX;
      canvas.height = cropArea.height * scaleY;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(
        image,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      resolve(canvas.toDataURL('image/jpeg', 0.9).split(',')[1]);
    };
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageSrc;
  });
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const { maxFileSize = 10 * 1024 * 1024 } = options;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const cropAreaRef = useRef<CropArea | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejections: FileRejection[]) => {
    if (rejections.length > 0) {
      const err = rejections[0].errors[0];
      setUploadError(err.code === 'file-too-large' ? 'Arquivo muito grande (máx. 10MB)' : err.message);
      return;
    }

    const selected = acceptedFiles[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setUploadError(null);
    setUploadedUrl(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif', '.avif'] },
    maxSize: maxFileSize,
    multiple: false,
  });

  const upload = useCallback(async (cropArea?: CropArea | null): Promise<string | null> => {
    if (!file) {
      setUploadError('Nenhum arquivo selecionado');
      return null;
    }

    setUploading(true);
    setUploadError(null);

    try {
      let base64: string;

      if (cropArea && cropArea.width > 0 && cropArea.height > 0) {
        base64 = await getCroppedImg(preview, cropArea);
      } else {
        base64 = await readFileAsBase64(file);
      }

      const result = await apiPost<{ url: string; path: string }>('/api/upload', {
        file: base64,
        filename: file.name,
        contentType: file.type,
      });

      setUploadedUrl(result.url);
      return result.url;
    } catch (err: any) {
      const msg = err?.message || 'Falha ao enviar imagem';
      setUploadError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  }, [file, preview]);

  const reset = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setUploading(false);
    setUploadError(null);
    setUploadedUrl(null);
    cropAreaRef.current = null;
  }, [preview]);

  return {
    getRootProps,
    getInputProps,
    isDragActive,
    file,
    preview,
    crop,
    zoom,
    rotation,
    setCrop,
    setZoom,
    setRotation,
    uploading,
    uploadError,
    uploadedUrl,
    upload,
    reset,
  };
}
