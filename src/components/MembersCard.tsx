import React, { memo, useState, useMemo } from 'react';
import { Users, Search, ExternalLink, ChevronDown, RefreshCw } from 'lucide-react';
import type { UseLodestoneFCReturn, LodestoneMember } from '../lib/useLodestoneFC';

interface MembersCardProps {
  lodestone: UseLodestoneFCReturn;
  maxVisible?: number;
}

function MemberRow({ member }: { member: LodestoneMember }) {
  return (
    <a
      href={`https://na.finalfantasyxiv.com/lodestone/character/${member.ID}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-[var(--color-surface-alt)]/60 transition-colors group"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--color-outline)]/40 shrink-0">
        {member.Avatar ? (
          <img
            src={member.Avatar}
            alt={member.Name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-surface-alt)] flex items-center justify-center">
            <Users className="w-3 h-3 text-[var(--color-on-surface-variant)]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] font-bold text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors block truncate leading-tight">
          {member.Name}
        </span>
        <span className="text-[10px] text-[var(--color-on-surface-variant)] block leading-none mt-0.5">
          {member.FCRank || member.Server?.World}
        </span>
      </div>
    </a>
  );
}

export const MembersCard: React.FC<MembersCardProps> = memo(({ lodestone, maxVisible = 6 }) => {
  const { members, loading, error, refetch, fc, loadMoreMembers, hasMoreMembers } = lodestone;
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      m => m.Name.toLowerCase().includes(q) || m.FCRank?.toLowerCase().includes(q)
    );
  }, [members, search]);

  const visibleMembers = showAll ? filtered : filtered.slice(0, maxVisible);
  const memberCount = fc?.FreeCompany?.ActiveMemberCount || members.length;
  const hasMore = filtered.length > maxVisible && !showAll;

  if (loading && members.length === 0) {
    return (
      <div className="glass rounded-2xl p-4 border border-[var(--color-outline)]/50 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider">Membros</span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full shimmer shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-20 rounded shimmer" />
                <div className="h-2 w-14 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && members.length === 0) {
    return (
      <div className="glass rounded-2xl p-4 border border-[var(--color-outline)]/50 text-center space-y-2">
        <p className="text-[11px] text-[var(--color-on-surface-variant)]">Erro ao carregar membros</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)] hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            Tentar novamente
          </button>
          <a
            href="https://na.finalfantasyxiv.com/lodestone/freecompany/9234349560946612399/member"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] inline-flex items-center gap-1"
          >
            Ver no Lodestone <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 border border-[var(--color-outline)]/50 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--color-primary)]" />
          <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider">
            Membros
          </span>
          <span className="text-[10px] text-[var(--color-on-surface-variant)] font-medium">
            {memberCount}
          </span>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="p-1 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors disabled:opacity-50"
          title="Atualizar"
          aria-label="Atualizar lista de membros"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--color-on-surface-variant)]" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar membro..."
          className="w-full pl-7 pr-2.5 py-1.5 text-[10px] bg-[var(--color-surface-alt)] border border-[var(--color-outline)]/40 rounded-lg text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/60 focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
        />
      </div>

      {/* Member list */}
      <div className="space-y-0.5">
        {visibleMembers.map(member => (
          <MemberRow key={member.ID} member={member} />
        ))}
      </div>

      {/* Show more / View all */}
      {hasMore && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors py-1.5"
        >
          Ver todos ({filtered.length})
          <ChevronDown className="w-3 h-3" />
        </button>
      )}

      {/* Lodestone link */}
      <a
        href="https://na.finalfantasyxiv.com/lodestone/freecompany/9234349560946612399/member"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors pt-1 border-t border-[var(--color-outline)]/30"
      >
        Ver no Lodestone <ExternalLink className="w-2.5 h-2.5" />
      </a>
    </div>
  );
});

MembersCard.displayName = 'MembersCard';
