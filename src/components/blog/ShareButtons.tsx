import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon,
} from 'react-share';
import { Link2 } from 'lucide-react';
import { useState, useCallback } from 'react';

interface ShareButtonsProps {
  title: string;
  description?: string;
  url: string;
}

export function ShareButtons({ title, description, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  }, [url]);

  const iconSize = 32;
  const borderRadius = 8;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <FacebookShareButton url={url} title={title} hashtag="#hallofnovice">
        <FacebookIcon size={iconSize} borderRadius={borderRadius} />
      </FacebookShareButton>

      <TwitterShareButton url={url} title={title} hashtags={['hallofnovice', 'ffxiv']}>
        <TwitterIcon size={iconSize} borderRadius={borderRadius} />
      </TwitterShareButton>

      <WhatsappShareButton url={url} title={title}>
        <WhatsappIcon size={iconSize} borderRadius={borderRadius} />
      </WhatsappShareButton>

      <TelegramShareButton url={url} title={title}>
        <TelegramIcon size={iconSize} borderRadius={borderRadius} />
      </TelegramShareButton>

      <LinkedinShareButton url={url} title={title} summary={description}>
        <LinkedinIcon size={iconSize} borderRadius={borderRadius} />
      </LinkedinShareButton>

      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-[var(--color-outline)]/50 type-caption font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/50 transition-all"
        aria-label={copied ? 'Link copiado' : 'Copiar link'}
      >
        <Link2 className="w-4 h-4" />
        {copied ? 'Copiado!' : 'Copiar link'}
      </button>
    </div>
  );
}
