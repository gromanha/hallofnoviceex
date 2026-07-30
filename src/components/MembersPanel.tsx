import React, { memo, useState, useMemo } from 'react';
import { RefreshCw, Search, Users, ExternalLink } from 'lucide-react';
import type { UseLodestoneFCReturn, LodestoneMember } from '../lib/useLodestoneFC';

interface MembersPanelProps {
  lodestone: UseLodestoneFCReturn;
}

function MemberItem({ member }: { member: LodestoneMember }) {
  return (
    <div className="members-panel__item flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--color-surface-alt)]/50 rounded-xl transition-colors">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden border border-[var(--color-outline)]/50 shrink-0">
        {member.Avatar ? (
          <img
            src={member.Avatar}
            alt={member.Name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-surface-alt)] flex items-center justify-center">
            <Users className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <a
          href={`https://na.finalfantasyxiv.com/lodestone/character/${member.ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors block truncate leading-tight"
        >
          {member.Name}
        </a>
        <div className="flex items-center gap-1.5 mt-0.5">
          {member.FCRank && (
            <span className="text-[10px] text-[var(--color-secondary)] font-medium truncate">
              {member.FCRank}
            </span>
          )}
        </div>
        <span className="text-[10px] text-[var(--color-on-surface-variant)] block leading-none mt-0.5">
          {member.Server.World}
        </span>
      </div>

      {/* Level badge */}
      {member.Level > 0 && (
        <span className="text-[10px] font-mono text-[var(--color-on-surface-variant)] bg-[var(--color-surface-alt)] px-1.5 py-0.5 rounded shrink-0">
          {member.Level}
        </span>
      )}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-10 h-10 rounded-full shimmer shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-24 rounded shimmer" />
            <div className="h-2.5 w-16 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export const MembersPanel: React.FC<MembersPanelProps> = memo(({ lodestone }) => {
  const { members, loading, error, refetch, fc } = lodestone;
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      m => m.Name.toLowerCase().includes(q) || m.FCRank?.toLowerCase().includes(q)
    );
  }, [members, search]);

  const memberCount = fc?.FreeCompany?.ActiveMemberCount || members.length;

  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 h-screen bg-[var(--color-surface)] border-l border-[var(--color-outline)]/50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--color-outline)]/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider">
              Membros
            </span>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors disabled:opacity-50"
            title="Atualizar"
            aria-label="Atualizar lista de membros"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <span className="text-[10px] text-[var(--color-on-surface-variant)]">
          {memberCount} membros na FC
        </span>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-on-surface-variant)]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar membro..."
            className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-[var(--color-surface-alt)] border border-[var(--color-outline)]/50 rounded-lg text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/60 focus:outline-none focus:border-[var(--color-primary)]/50 transition-colors"
          />
        </div>
      </div>

      {/* Member list */}
      <div className="flex-1 overflow-y-auto members-scroll">
        {loading && members.length === 0 ? (
          <PanelSkeleton />
        ) : error && members.length === 0 ? (
          <div className="p-6 text-center space-y-2">
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              Erro ao carregar membros
            </p>
            <a
              href="https://na.finalfantasyxiv.com/lodestone/freecompany/9234349560946612399/member"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              Ver no Lodestone <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs text-[var(--color-on-surface-variant)]">
              {search ? 'Nenhum membro encontrado' : 'Nenhum membro carregado'}
            </p>
          </div>
        ) : (
          <div className="py-1">
            {filtered.map(member => (
              <MemberItem key={member.ID} member={member} />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
});

MembersPanel.displayName = 'MembersPanel';
