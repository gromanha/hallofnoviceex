import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Package,
  Scroll,
  Sword,
  Users,
  TrendingUp,
  ExternalLink,
  Loader2,
  AlertCircle,
  Globe,
} from 'lucide-react';
import {
  useSearchItems,
  useSearchRecipes,
  useSearchQuests,
  useSearchInstances,
  useSearchWiki,
} from '../lib/useFFXIV';
import { useDebounce } from '../lib/useDebounce';

// ── Types ──────────────────────────────────────────────────────
type TabType = 'items' | 'recipes' | 'quests' | 'instances' | 'wiki';

interface SearchResult {
  ID?: number;
  id?: number;
  Name?: string;
  name?: string;
  Name_en?: string;
  Icon?: string;
  LevelItem?: number;
  LevelRecipe?: number;
  LevelQuest?: number;
  ItemKind?: { Name?: string };
  ClassJob?: { Name?: string };
  title?: string;
  snippet?: string;
  pageid?: number;
}

// ── Tabs config ────────────────────────────────────────────────
const TABS: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: 'items', label: 'Itens', icon: <Package className="w-4 h-4" /> },
  { id: 'recipes', label: 'Receitas', icon: <Scroll className="w-4 h-4" /> },
  { id: 'quests', label: 'Quests', icon: <Sword className="w-4 h-4" /> },
  { id: 'instances', label: 'Dungeons/Trials', icon: <Users className="w-4 h-4" /> },
  { id: 'wiki', label: 'Wiki', icon: <Globe className="w-4 h-4" /> },
];

// ── Component: Result Card ─────────────────────────────────────
function ResultCard({ result, type }: { result: SearchResult; type: TabType }) {
  const getId = () => result.ID || result.id || result.pageid;
  const getName = () => result.Name || result.name || result.title || 'Desconhecido';
  const getIcon = () => result.Icon;

  const getLevel = () => {
    switch (type) {
      case 'items':
        return result.LevelItem ? `iLvl ${result.LevelItem}` : null;
      case 'recipes':
        return result.LevelRecipe ? `Lvl ${result.LevelRecipe}` : null;
      case 'quests':
        return result.LevelQuest ? `Lvl ${result.LevelQuest}` : null;
      default:
        return null;
    }
  };

  const getCategory = () => {
    if (type === 'items' && result.ItemKind?.Name) return result.ItemKind.Name;
    if (type === 'recipes' && result.ClassJob?.Name) return result.ClassJob.Name;
    return null;
  };

  const getWikiUrl = () => {
    const name = getName().replace(/\s+/g, '_');
    return `https://ffxiv.consolegameswiki.com/wiki/${encodeURIComponent(name)}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="glass rounded-xl p-4 border border-[var(--color-outline)]/30 hover:border-[var(--color-secondary)]/50 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        {getIcon() && (
          <div className="w-12 h-12 rounded-lg bg-[var(--color-surface)] flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={getIcon()}
              alt=""
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="type-body-semibold text-[var(--color-on-surface)] truncate">
              {getName()}
            </h3>
            {getLevel() && (
              <span className="type-label-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                {getLevel()}
              </span>
            )}
            {getCategory() && (
              <span className="type-label-xs px-2 py-0.5 rounded-full bg-[var(--color-tertiary)]/10 text-[var(--color-tertiary)]">
                {getCategory()}
              </span>
            )}
          </div>

          {result.Name_en && result.Name_en !== result.Name && (
            <p className="type-caption text-[var(--color-on-surface-variant)] mt-1">
              {result.Name_en}
            </p>
          )}

          {result.snippet && (
            <p
              className="type-caption text-[var(--color-on-surface-variant)] mt-1 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: result.snippet }}
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={getWikiUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
            title="Ver na Wiki"
          >
            <ExternalLink className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Component: Loading State ───────────────────────────────────
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Loader2 className="w-8 h-8 text-[var(--color-secondary)] animate-spin" />
      <p className="type-body text-[var(--color-on-surface-variant)]">
        Buscando dados...
      </p>
    </div>
  );
}

// ── Component: Error State ─────────────────────────────────────
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <AlertCircle className="w-8 h-8 text-[var(--color-error)]" />
      <p className="type-body text-[var(--color-on-surface-variant)]">
        {message}
      </p>
    </div>
  );
}

// ── Component: Empty State ─────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Search className="w-8 h-8 text-[var(--color-on-surface-variant)] opacity-50" />
      <p className="type-body text-[var(--color-on-surface-variant)]">
        {query ? 'Nenhum resultado encontrado' : 'Digite pelo menos 2 caracteres para buscar'}
      </p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
export const GameDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 400);

  // Hooks para cada tipo de busca
  const itemsResult = useSearchItems(debouncedQuery, { enabled: activeTab === 'items' });
  const recipesResult = useSearchRecipes(debouncedQuery, { enabled: activeTab === 'recipes' });
  const questsResult = useSearchQuests(debouncedQuery, { enabled: activeTab === 'quests' });
  const instancesResult = useSearchInstances(debouncedQuery, 'dungeon', { enabled: activeTab === 'instances' });
  const wikiResult = useSearchWiki(debouncedQuery, { enabled: activeTab === 'wiki' });

  // Obter resultados da tab ativa
  const getCurrentResults = (): SearchResult[] => {
    switch (activeTab) {
      case 'items':
        return itemsResult.data?.Results || [];
      case 'recipes':
        return recipesResult.data?.Results || [];
      case 'quests':
        return questsResult.data?.Results || [];
      case 'instances':
        return instancesResult.data?.Results || [];
      case 'wiki':
        return wikiResult.data?.query?.search || [];
      default:
        return [];
    }
  };

  const isLoading = () => {
    switch (activeTab) {
      case 'items': return itemsResult.loading;
      case 'recipes': return recipesResult.loading;
      case 'quests': return questsResult.loading;
      case 'instances': return instancesResult.loading;
      case 'wiki': return wikiResult.loading;
      default: return false;
    }
  };

  const getError = (): string | null => {
    switch (activeTab) {
      case 'items': return itemsResult.error;
      case 'recipes': return recipesResult.error;
      case 'quests': return questsResult.error;
      case 'instances': return instancesResult.error;
      case 'wiki': return wikiResult.error;
      default: return null;
    }
  };

  const results = getCurrentResults();
  const loading = isLoading();
  const error = getError();

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    setSearchQuery('');
  }, []);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="glass rounded-2xl p-8 sm:p-10 border border-[var(--color-outline)]/50 relative overflow-hidden text-center space-y-4">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[var(--color-secondary)]/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="type-label text-[var(--color-secondary)] mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20">
            <Globe className="w-3.5 h-3.5" />
            Explorador de Dados
          </div>

          <h1 className="type-display text-[var(--color-on-surface)]">
            Explorador de Dados do Jogo
          </h1>

          <p className="type-body text-[var(--color-on-surface-variant)] max-w-2xl mx-auto mt-2">
            Busque itens, receitas, quests e mais dados de Final Fantasy XIV.
            Fontes: XIVAPI, Universalis e ConsoleGamesWiki.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl type-body transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-[var(--color-secondary)] text-[var(--color-on-secondary)] shadow-lg'
                : 'glass border border-[var(--color-outline)]/30 text-[var(--color-on-surface-variant)] hover:border-[var(--color-secondary)]/50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-on-surface-variant)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Buscar ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
            className="w-full pl-12 pr-4 py-3 rounded-xl glass border border-[var(--color-outline)]/30 text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] focus:outline-none focus:border-[var(--color-secondary)]/50 type-body"
          />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto">
        {loading && <LoadingState />}

        {error && <ErrorState message={error} />}

        {!loading && !error && results.length === 0 && (
          <EmptyState query={debouncedQuery} />
        )}

        {!loading && !error && results.length > 0 && (
          <motion.div
            layout
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {results.map((result) => (
                <ResultCard
                  key={result.ID || result.id || result.pageid}
                  result={result}
                  type={activeTab}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center type-caption text-[var(--color-on-surface-variant)]">
        <p>
          Dados fornecidos por{' '}
          <a
            href="https://xivapi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-secondary)] hover:underline"
          >
            XIVAPI
          </a>
          ,{' '}
          <a
            href="https://universalis.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-secondary)] hover:underline"
          >
            Universalis
          </a>
          {' '}e{' '}
          <a
            href="https://ffxiv.consolegameswiki.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-secondary)] hover:underline"
          >
            ConsoleGamesWiki
          </a>
        </p>
      </div>
    </main>
  );
};

export default GameDataPage;
