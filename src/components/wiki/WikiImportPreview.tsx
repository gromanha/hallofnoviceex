import React from 'react';
import { FileText, Image, Table2, Link2, HardDrive } from 'lucide-react';

type WikiPreviewData = {
  title: string;
  subtitle: string;
  coverImage: string;
  imagesCount: number;
  tables: number;
  internalLinks: number;
  htmlSizeFormatted: string;
};

type WikiImportPreviewProps = {
  data: WikiPreviewData;
};

export const WikiImportPreview: React.FC<WikiImportPreviewProps> = ({ data }) => {
  return (
    <div className="bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
          <FileText className="w-5 h-5 text-[var(--color-primary)]" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="type-title text-[var(--color-on-surface)] truncate">{data.title}</h4>
          {data.subtitle && (
            <p className="type-caption text-[var(--color-on-surface-variant)] line-clamp-2 mt-0.5">
              {data.subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-outline-variant)]">
          <Image className="w-4 h-4 text-[var(--color-secondary)]" />
          <div>
            <p className="text-xs font-bold text-[var(--color-on-surface)]">{data.imagesCount}</p>
            <p className="text-[9px] text-[var(--color-on-surface-variant)]">Imagens</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-outline-variant)]">
          <Table2 className="w-4 h-4 text-[var(--color-secondary)]" />
          <div>
            <p className="text-xs font-bold text-[var(--color-on-surface)]">{data.tables}</p>
            <p className="text-[9px] text-[var(--color-on-surface-variant)]">Tabelas</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-outline-variant)]">
          <Link2 className="w-4 h-4 text-[var(--color-secondary)]" />
          <div>
            <p className="text-xs font-bold text-[var(--color-on-surface)]">{data.internalLinks}</p>
            <p className="text-[9px] text-[var(--color-on-surface-variant)]">Links</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-outline-variant)]">
          <HardDrive className="w-4 h-4 text-[var(--color-secondary)]" />
          <div>
            <p className="text-xs font-bold text-[var(--color-on-surface)]">{data.htmlSizeFormatted}</p>
            <p className="text-[9px] text-[var(--color-on-surface-variant)]">Tamanho</p>
          </div>
        </div>
      </div>

      {data.coverImage && (
        <div className="rounded-lg overflow-hidden border border-[var(--color-outline-variant)] max-h-32">
          <img
            src={data.coverImage}
            alt={data.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  );
};
