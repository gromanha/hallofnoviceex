import React, { memo, useState } from 'react';
import { Shield, Heart, Swords, Hammer, Pickaxe, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { UseLodestoneFCReturn } from '../lib/useLodestoneFC';

interface FCCardProps {
  lodestone: UseLodestoneFCReturn;
}

const ROLE_ICONS = [
  { label: 'Tank', icon: Shield, keyword: 'tank' },
  { label: 'Healer', icon: Heart, keyword: 'healer' },
  { label: 'DPS', icon: Swords, keyword: 'dps' },
  { label: 'Crafter', icon: Hammer, keyword: 'crafter' },
  { label: 'Gatherer', icon: Pickaxe, keyword: 'gatherer' },
] as const;

function SkeletonCard() {
  return (
    <div className="fccard p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded shimmer" />
          <div className="h-4 w-32 rounded shimmer" />
        </div>
      </div>
      <div className="h-px bg-[var(--color-outline)]/30" />
      <div className="flex gap-4">
        <div className="h-3 w-16 rounded shimmer" />
        <div className="h-3 w-12 rounded shimmer" />
        <div className="h-3 w-10 rounded shimmer" />
      </div>
    </div>
  );
}

export const FCCard: React.FC<FCCardProps> = memo(({ lodestone }) => {
  const { fc, loading, error } = lodestone;
  const [expanded, setExpanded] = useState(true);

  if (loading && !fc) return <SkeletonCard />;

  if (error && !fc) {
    return (
      <div className="fccard p-4 text-center">
        <p className="text-xs text-[var(--color-on-surface-variant)]">
          Dados da FC indisponíveis
        </p>
        <a
          href="https://na.finalfantasyxiv.com/lodestone/freecompany/9234349560946612399"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-primary)] hover:underline mt-1 inline-flex items-center gap-1"
        >
          Ver no Lodestone <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  if (!fc) return null;

  const { FreeCompany: fcData } = fc;
  const isRecruiting = fcData.Recruitment?.toLowerCase() === 'open';

  return (
    <div className="fccard mx-3 mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--color-surface-alt)]/50 rounded-xl transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Crest */}
          <div className="fccard-crest w-10 h-10 shrink-0">
            {fcData.CrestLayers.Background && (
              <img src={fcData.CrestLayers.Background} alt="" className="absolute inset-0 w-full h-full rounded-lg" />
            )}
            {fcData.CrestLayers.Bottom && (
              <img src={fcData.CrestLayers.Bottom} alt="" className="absolute inset-0 w-full h-full rounded-lg" />
            )}
            {fcData.CrestLayers.Middle && (
              <img src={fcData.CrestLayers.Middle} alt="" className="absolute inset-0 w-full h-full rounded-lg" />
            )}
            {fcData.CrestLayers.Top && (
              <img src={fcData.CrestLayers.Top} alt="" className="absolute inset-0 w-full h-full rounded-lg" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-medium text-[var(--color-secondary)] block leading-none">
              {fcData.Tag}
            </span>
            <span className="text-xs font-bold text-[var(--color-on-surface)] block leading-tight truncate">
              {fcData.Name}
            </span>
            <span className="text-[10px] text-[var(--color-on-surface-variant)] block leading-none">
              {fcData.Server.World} · {fcData.Server.DC}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)] shrink-0" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)] shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2.5">
          <div className="h-px bg-[var(--color-outline)]/30" />

          {/* GC + Stats row */}
          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-[var(--color-on-surface-variant)]">
              GC <span className="text-[var(--color-on-surface)] font-medium">{fcData.GrandCompany.Name}</span>
              {fcData.GrandCompany.Rank && (
                <span className="text-[var(--color-secondary)]"> ({fcData.GrandCompany.Rank})</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-[var(--color-on-surface-variant)]">
              Membros <span className="text-[var(--color-on-surface)] font-bold">{fcData.ActiveMemberCount}</span>
            </span>
            <span className="text-[var(--color-on-surface-variant)]">
              Rank <span className="text-[var(--color-on-surface)] font-bold">#{fcData.Rank}</span>
            </span>
          </div>

          {/* Recruitment status */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${isRecruiting ? 'bg-[var(--color-sage)]' : 'bg-[var(--color-on-surface-variant)]'}`} />
            <span className="text-[var(--color-on-surface-variant)]">
              Recrutando <span className="text-[var(--color-on-surface)]">{isRecruiting ? 'Aberto' : 'Fechado'}</span>
            </span>
          </div>

          {/* Roles focus */}
          {fcData.Estate?.Greeting && (
            <p className="text-[10px] text-[var(--color-on-surface-variant)] italic leading-snug line-clamp-2">
              {fcData.Estate.Greeting}
            </p>
          )}

          {/* Link */}
          <a
            href={`https://na.finalfantasyxiv.com/lodestone/freecompany/${fcData.ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[11px] text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors pt-1"
          >
            Ver no Lodestone <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
});

FCCard.displayName = 'FCCard';
