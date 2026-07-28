import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar, BookOpen, Plus, Edit3, Trash2, Pin, Search, ShieldCheck, LogOut, Check, Eye,
  PlusCircle, X, Clock, Tag, RefreshCw, UtensilsCrossed,
} from 'lucide-react';
import { Post, MagicalEvent, EventTypeItem, Recipe } from '../types';
import { apiGet, apiPost, apiPatch, apiDel } from '../lib/api';
import { PostModal } from '../components/PostModal';
import { RecipeModal } from '../components/RecipeModal';
import { useAuth } from '../lib/AuthContext';
import { useDebounce } from '../lib/useDebounce';
import { useEscapeKey } from '../lib/useEscapeKey';
import { useFocusTrap } from '../lib/useFocusTrap';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getRecipeCategoryColor, getPostCategoryColor } from '../lib/colors';

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const ICON_OPTIONS = [
  'Wand2','Swords','FlaskConical','BookOpen','Sparkles',
  'Shield','Flame','Eye','Moon','Star','Layers',
];

type EventFormState = {
  month: string;
  day: number;
  time: string;
  title: string;
  description: string;
  instructor: string;
  type: string;
  image: string;
  crystal: boolean;
  stars: boolean;
};

const EMPTY_EVENT_FORM: EventFormState = {
  month: MONTHS[new Date().getMonth()],
  day: 1,
  time: '09:00 — 11:30',
  title: '',
  description: '',
  instructor: '',
  type: '',
  image: '',
  crystal: false,
  stars: false,
};

type TypeFormState = {
  key: string;
  label: string;
  color: string;
  icon: string;
  sort_order: number;
};

const EMPTY_TYPE_FORM: TypeFormState = {
  key: '',
  label: '',
  color: '#5dade2',
  icon: 'Wand2',
  sort_order: 0,
};

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { admin, onLogout } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'types' | 'recipes'>('posts');

  const handleNavigatePost = useCallback((slug: string) => {
    navigate(`/post/${slug}`);
  }, [navigate]);

  // ── States for Posts Manager ──
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsSearch, setPostsSearch] = useState('');
  const debouncedPostsSearch = useDebounce(postsSearch, 300);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedPost, setSelectedPost] = useState<Partial<Post> | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // ── States for Calendar Events Manager ──
  const [events, setEvents] = useState<MagicalEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  // ── Event Form ──
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>({ ...EMPTY_EVENT_FORM });
  const [savingEvent, setSavingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // ── Type Form ──
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typeForm, setTypeForm] = useState<TypeFormState>({ ...EMPTY_TYPE_FORM });
  const [savingType, setSavingType] = useState(false);
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null);

  // ── States for Recipes Manager ──
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [recipesSearch, setRecipesSearch] = useState('');
  const debouncedRecipesSearch = useDebounce(recipesSearch, 300);
  const [recipeStatusFilter, setRecipeStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Partial<Recipe> | null>(null);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // ── Confirm Dialog ──
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  // ── Load Posts ──
  const loadPosts = async (signal?: AbortSignal) => {
    setLoadingPosts(true);
    try {
      let url = '/api/posts?status=all';
      if (debouncedPostsSearch) url += `&search=${encodeURIComponent(debouncedPostsSearch)}`;
      const data = await apiGet<Post[]>(url);
      if (!signal?.aborted) setPosts(data || []);
    } catch (err) {
      console.error('Erro ao carregar postagens no admin:', err);
    } finally {
      if (!signal?.aborted) setLoadingPosts(false);
    }
  };

  // ── Load Events & Types ──
  const loadEvents = async (signal?: AbortSignal) => {
    setLoadingEvents(true);
    setEventError(null);
    try {
      const [evs, types] = await Promise.all([
        apiGet<MagicalEvent[]>('/api/events'),
        apiGet<EventTypeItem[]>('/api/event-types'),
      ]);
      if (!signal?.aborted) {
        setEvents(evs || []);
        setEventTypes(types || []);
      }
    } catch (err: any) {
      console.error('Erro ao carregar eventos no admin:', err);
      if (!signal?.aborted) setEventError(err?.detail || err?.message || 'Não foi possível carregar os eventos. Tente recarregar a página.');
    } finally {
      if (!signal?.aborted) setLoadingEvents(false);
    }
  };

  // ── Load Recipes ──
  const loadRecipes = async (signal?: AbortSignal) => {
    setLoadingRecipes(true);
    try {
      let url = '/api/recipes?status=all';
      if (debouncedRecipesSearch) url += `&search=${encodeURIComponent(debouncedRecipesSearch)}`;
      const data = await apiGet<Recipe[]>(url);
      if (!signal?.aborted) setRecipes(data || []);
    } catch (err) {
      console.error('Erro ao carregar receitas no admin:', err);
    } finally {
      if (!signal?.aborted) setLoadingRecipes(false);
    }
  };

  // ── Recipe Actions ──
  const handleSaveRecipe = async (recipeData: Partial<Recipe>) => {
    if (recipeData.id) {
      await apiPatch('/api/recipes', recipeData);
    } else {
      await apiPost('/api/recipes', recipeData);
    }
    await loadRecipes();
  };

  const handleDeleteRecipe = async (id: string) => {
    const recipe = recipes.find(r => r.id === id);
    setConfirmState({
      open: true,
      title: 'Excluir receita',
      message: `Excluir a receita "${recipe?.title || ''}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, open: false }));
        try {
          await apiDel('/api/recipes', { id });
          await loadRecipes();
        } catch (err) {
          console.error('Erro ao excluir receita:', err);
        }
      },
    });
  };

  const handleToggleRecipeStatus = async (recipe: Recipe) => {
    try {
      const nextStatus = recipe.status === 'published' ? 'draft' : 'published';
      await apiPatch('/api/recipes', { id: recipe.id, status: nextStatus });
      await loadRecipes();
    } catch (err) {
      console.error('Erro ao alternar status da receita:', err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    if (activeTab === 'posts') {
      loadPosts(controller.signal);
    } else if (activeTab === 'recipes') {
      loadRecipes(controller.signal);
    } else {
      loadEvents(controller.signal);
    }
    return () => controller.abort();
  }, [activeTab, debouncedPostsSearch, debouncedRecipesSearch]);

  // ── Post Actions ──
  const handleSavePost = async (postData: Partial<Post>) => {
    if (postData.id) {
      await apiPatch('/api/posts', postData);
    } else {
      await apiPost('/api/posts', postData);
    }
    await loadPosts();
  };

  const handleDeletePost = async (id: string) => {
    const post = posts.find(p => p.id === id);
    setConfirmState({
      open: true,
      title: 'Excluir postagem',
      message: `Excluir a postagem "${post?.title || ''}"? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, open: false }));
        try {
          await apiDel('/api/posts', { id });
          await loadPosts();
        } catch (err) {
          console.error('Erro ao excluir postagem:', err);
        }
      },
    });
  };

  const handleTogglePin = async (post: Post) => {
    try {
      await apiPatch('/api/posts', { id: post.id, is_pinned: !post.is_pinned });
      await loadPosts();
    } catch (err) {
      console.error('Erro ao alternar destaque:', err);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    try {
      const nextStatus = post.status === 'published' ? 'draft' : 'published';
      await apiPatch('/api/posts', { id: post.id, status: nextStatus });
      await loadPosts();
    } catch (err) {
      console.error('Erro ao alternar status:', err);
    }
  };

  // ── Event CRUD Actions ──
  function openEventCreate() {
    setEditingEventId(null);
    setEventForm({ ...EMPTY_EVENT_FORM, type: eventTypes[0]?.key || '' });
    setShowEventForm(true);
  }

  function openEventEdit(evt: MagicalEvent) {
    setEditingEventId(evt.id);
    setEventForm({
      month: evt.month,
      day: evt.day,
      time: evt.time,
      title: evt.title,
      description: evt.description,
      instructor: evt.instructor || '',
      type: evt.type,
      image: evt.image || '',
      crystal: evt.crystal || false,
      stars: evt.stars || false,
    });
    setShowEventForm(true);
  }

  async function handleEventSave(e: React.FormEvent) {
    e.preventDefault();
    if (!eventForm.title.trim()) return;
    const clampedDay = Math.max(1, Math.min(31, eventForm.day));
    setSavingEvent(true);
    try {
      const payload = {
        month: eventForm.month,
        day: clampedDay,
        time: eventForm.time,
        title: eventForm.title,
        description: eventForm.description,
        instructor: eventForm.instructor,
        type: eventForm.type,
        image: eventForm.image,
        crystal: eventForm.crystal,
        stars: eventForm.stars,
      };
      if (editingEventId) {
        await apiPatch('/api/events', { ...payload, id: editingEventId });
      } else {
        await apiPost('/api/events', payload);
      }
      setShowEventForm(false);
      setEditingEventId(null);
      await loadEvents();
    } catch (err: any) {
      setEventError(err?.detail || err?.message || 'Não foi possível salvar o evento. Verifique os campos e tente novamente.');
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleEventDelete(id: string) {
    setConfirmState({
      open: true,
      title: 'Excluir evento',
      message: 'Excluir este evento? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, open: false }));
        setDeletingEventId(id);
        try {
          await apiDel('/api/events', { id });
          await loadEvents();
        } catch (err: any) {
          setEventError(err?.detail || err?.message || 'Não foi possível excluir o evento. Tente novamente.');
        } finally {
          setDeletingEventId(null);
        }
      },
    });
  }

  function setEventField<K extends keyof EventFormState>(key: K, val: EventFormState[K]) {
    setEventForm(prev => ({ ...prev, [key]: val }));
  }

  // ── Type CRUD Actions ──
  function openTypeCreate() {
    setEditingTypeId(null);
    setTypeForm({ ...EMPTY_TYPE_FORM, sort_order: eventTypes.length });
    setShowTypeForm(true);
  }

  function openTypeEdit(et: EventTypeItem) {
    setEditingTypeId(et.id);
    setTypeForm({
      key: et.key,
      label: et.label,
      color: et.color,
      icon: et.icon,
      sort_order: et.sort_order,
    });
    setShowTypeForm(true);
  }

  async function handleTypeSave(e: React.FormEvent) {
    e.preventDefault();
    if (!typeForm.key.trim() || !typeForm.label.trim()) return;
    setSavingType(true);
    try {
      if (editingTypeId) {
        await apiPatch('/api/event-types', { ...typeForm, id: editingTypeId });
      } else {
        await apiPost('/api/event-types', typeForm);
      }
      setShowTypeForm(false);
      setEditingTypeId(null);
      await loadEvents();
    } catch (err: any) {
      setEventError(err?.detail || err?.message || 'Não foi possível salvar o tipo. Verifique os campos e tente novamente.');
    } finally {
      setSavingType(false);
    }
  }

  async function handleTypeDelete(id: string) {
    setConfirmState({
      open: true,
      title: 'Excluir tipo de atividade',
      message: 'Excluir este tipo de atividade? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        setConfirmState(prev => ({ ...prev, open: false }));
        setDeletingTypeId(id);
        try {
          await apiDel('/api/event-types', { id });
          await loadEvents();
        } catch (err: any) {
          setEventError(err?.detail || err?.message || 'Não foi possível excluir o tipo. Tente novamente.');
        } finally {
          setDeletingTypeId(null);
        }
      },
    });
  }

  function setTypeField<K extends keyof TypeFormState>(key: K, val: TypeFormState[K]) {
    setTypeForm(prev => ({ ...prev, [key]: val }));
  }

  function getTypeLabel(key: string): string {
    return eventTypes.find(t => t.key === key)?.label || key;
  }

  useEscapeKey(() => { setShowEventForm(false); setEditingEventId(null); }, showEventForm);
  useEscapeKey(() => { setShowTypeForm(false); setEditingTypeId(null); }, showTypeForm);
  const eventModalRef = useFocusTrap(showEventForm);
  const typeModalRef = useFocusTrap(showTypeForm);

  const filteredPosts = posts.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header do Painel Admin */}
      <div className="glass rounded-2xl p-8 border border-[var(--color-outline)]/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="type-label text-[var(--color-primary)] inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
            <ShieldCheck className="w-4 h-4" />
            Área Administrativa
          </div>
          <h1 className="type-display text-[var(--color-on-surface)]">
            Painel Administrativo
          </h1>
          <p className="type-body text-[var(--color-on-surface-variant)]">
            Conectado como <strong className="text-[var(--color-on-surface)]">{admin.display_name}</strong> (@{admin.username})
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-crimson)]/10 hover:bg-[var(--color-crimson)]/20 text-[var(--color-crimson)] border border-[var(--color-crimson)]/30 type-label normal-case font-bold flex items-center gap-2 transition-all shrink-0"
        >
          <LogOut className="w-4 h-4" /> Sair do Painel
        </button>
      </div>

      {/* Abas de Gerenciamento */}
      <div role="tablist" className="flex items-center gap-2 border-b border-[var(--color-outline-variant)] pb-3 overflow-x-auto">
        <button
          role="tab"
          aria-selected={activeTab === 'posts'}
          aria-controls="tabpanel-posts"
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl type-title transition-all whitespace-nowrap ${
            activeTab === 'posts'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[var(--color-secondary)]" />
          Postagens & Códices ({posts.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'events'}
          aria-controls="tabpanel-events"
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl type-title transition-all whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[var(--color-secondary)]" />
          Eventos do Calendário ({events.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'types'}
          aria-controls="tabpanel-types"
          onClick={() => setActiveTab('types')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl type-title transition-all whitespace-nowrap ${
            activeTab === 'types'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <Tag className="w-4 h-4 text-[var(--color-secondary)]" />
          Tipos de Atividade ({eventTypes.length})
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'recipes'}
          aria-controls="tabpanel-recipes"
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl type-title transition-all whitespace-nowrap ${
            activeTab === 'recipes'
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 text-[var(--color-secondary)]" />
          Receitas ({recipes.length})
        </button>
      </div>

      {/* Error Banner */}
      {eventError && (
        <div className="type-body text-[var(--color-crimson)] bg-[var(--color-crimson)]/10 border border-[var(--color-crimson)]/30 rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{eventError}</span>
          <button onClick={() => setEventError(null)} className="underline font-bold ml-2">Dispensar</button>
        </div>
      )}

      {/* ═══════════════════ TAB CONTENT ═══════════════════ */}
      <AnimatePresence mode="wait">
        {activeTab === 'posts' && (
          <motion.div
            key="tabpanel-posts"
            role="tabpanel"
            id="tabpanel-posts"
            aria-labelledby="tab-posts"
            className="space-y-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >

          {/* Controles */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">

            <button
              onClick={() => {
                setSelectedPost(null);
                setIsPostModalOpen(true);
              }}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] type-label normal-case font-bold flex items-center justify-center gap-2 transition-all hover:shadow-md"
            >
              <Plus className="w-4 h-4 text-[var(--color-secondary)]" /> Nova Postagem / Guia
            </button>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

              {/* Filtro de Status */}
              <div className="flex items-center gap-1 bg-[var(--color-background)] p-1 rounded-xl border border-[var(--color-outline-variant)]">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg type-body font-bold transition-all ${
                    statusFilter === 'all' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-on-surface-variant)]'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-3 py-1 rounded-lg type-body font-bold transition-all ${
                    statusFilter === 'published' ? 'bg-[var(--color-sage)] text-white' : 'text-[var(--color-on-surface-variant)]'
                  }`}
                >
                  Publicadas
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1 rounded-lg type-body font-bold transition-all ${
                    statusFilter === 'draft' ? 'bg-[var(--color-amber)] text-white' : 'text-[var(--color-on-surface-variant)]'
                  }`}
                >
                  Rascunhos
                </button>
              </div>

              {/* Busca */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" />
                <input
                  type="text"
                  value={postsSearch}
                  onChange={e => setPostsSearch(e.target.value)}
                  placeholder="Buscar postagem..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] type-body text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                />
                {postsSearch && (
                  <button
                    onClick={() => setPostsSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-[var(--color-primary-light)] text-[var(--color-on-surface-variant)] transition-colors"
                    aria-label="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* Tabela de Postagens */}
          {loadingPosts ? (
            <div className="h-64 bg-[var(--color-surface)] rounded-2xl shimmer" />
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
              <BookOpen className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3" />
              <p className="type-title text-[var(--color-on-surface)]">Nenhuma postagem cadastrada.</p>
              <p className="type-body text-[var(--color-on-surface-variant)] mt-1">Clique em "Nova Postagem / Guia" para criar a primeira publicação.</p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left type-body text-[var(--color-on-surface)]">
                  <thead className="bg-[var(--color-background)] border-b border-[var(--color-outline-variant)] type-label text-[var(--color-on-surface-variant)]">
                    <tr>
                      <th className="p-4">Título</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Destaque</th>
                      <th className="p-4">Autor</th>
                      <th className="p-4">Data</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-outline-variant)] font-medium">
                    {filteredPosts.map(post => (
                      <tr key={post.id} className="hover:bg-[var(--color-primary-light)]/40 transition-colors">
                        <td className="p-4 type-title max-w-xs truncate">
                          {post.title}
                        </td>
                        <td className="p-4">
                          <span className={`type-caption font-bold px-2.5 py-1 rounded-md ${getPostCategoryColor(post.category).bg} ${getPostCategoryColor(post.category).text}`}>
                            {post.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`px-2.5 py-1 rounded-full type-caption font-bold transition-all cursor-pointer hover:opacity-80 ${
                              post.status === 'published'
                                ? 'bg-[var(--color-sage)]/10 text-[var(--color-sage)] border border-[var(--color-sage)]/30'
                                : 'bg-[var(--color-amber)]/10 text-[var(--color-amber)] border border-[var(--color-amber)]/30'
                            }`}
                          >
                            {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleTogglePin(post)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer hover:opacity-80 ${
                              post.is_pinned
                                ? 'bg-[var(--color-secondary)] text-[var(--color-background)] border-[var(--color-secondary)]'
                                : 'text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)] hover:text-[var(--color-secondary)]'
                            }`}
                            title={post.is_pinned ? 'Remover dos Destaques' : 'Fixar em Destaque'}
                          >
                            <Pin className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                        <td className="p-4 text-[var(--color-on-surface-variant)]">{post.author_name}</td>
                        <td className="p-4 text-[var(--color-on-surface-variant)]">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleNavigatePost(post.slug)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)]"
                            title="Ver Publicação"
                            aria-label={`Ver publicação: ${post.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPost(post);
                              setIsPostModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-primary)]"
                            title="Editar Postagem"
                            aria-label={`Editar postagem: ${post.title}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-crimson)]/10 text-[var(--color-crimson)]"
                            title="Excluir Postagem"
                            aria-label={`Excluir postagem: ${post.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          </motion.div>
        )}

        {activeTab === 'events' && (
        <motion.div
          key="tabpanel-events"
          role="tabpanel"
          id="tabpanel-events"
          aria-labelledby="tab-events"
          className="space-y-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >

          {/* Controles de Eventos */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">

            <button
              onClick={openEventCreate}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-[var(--color-secondary)]" /> Novo Evento
            </button>

            <button
              onClick={() => void loadEvents()}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-background)] hover:bg-[var(--color-surface-alt)] border border-[var(--color-outline-variant)] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Recarregar
            </button>

          </div>

          {/* Lista de Eventos */}
          {loadingEvents ? (
            <div className="h-48 bg-[var(--color-surface)] rounded-2xl shimmer" />
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
              <Calendar className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">Nenhum evento cadastrado.</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Clique em "Novo Evento" para criar o primeiro registro no calendário.</p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[var(--color-on-surface)]">
                  <thead className="bg-[var(--color-background)] border-b border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Dia</th>
                      <th className="p-4">Mês</th>
                      <th className="p-4">Horário</th>
                      <th className="p-4">Título</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Instrutor</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-outline-variant)] font-medium">
                    {events.map(evt => (
                      <tr key={evt.id} className="hover:bg-[var(--color-primary-light)]/40 transition-colors">
                        <td className="p-4 font-display font-bold text-[var(--color-primary-deep)]">
                          {evt.day < 10 ? `0${evt.day}` : evt.day}
                        </td>
                        <td className="p-4">{evt.month}</td>
                        <td className="p-4 text-[var(--color-on-secondary-deep)] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {evt.time}
                        </td>
                        <td className="p-4 font-semibold max-w-[200px] truncate">
                          {evt.title}
                        </td>
                        <td className="p-4">
                          <span
                            className="px-2.5 py-1 rounded-md font-bold uppercase text-[10px] text-white"
                            style={{ backgroundColor: eventTypes.find(t => t.key === evt.type)?.color || 'var(--color-primary)' }}
                          >
                            {getTypeLabel(evt.type)}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--color-on-surface-variant)]">{evt.instructor || '—'}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEventEdit(evt)}
                              className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-primary)]"
                              title="Editar"
                              aria-label={`Editar evento: ${evt.title}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => void handleEventDelete(evt.id)}
                              disabled={deletingEventId === evt.id}
                              className="p-1.5 rounded-lg hover:bg-[var(--color-crimson)]/10 text-[var(--color-crimson)] disabled:opacity-50"
                              title="Deletar"
                              aria-label={`Deletar evento: ${evt.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          </motion.div>
        )}

      {activeTab === 'types' && (
        <motion.div
          key="tabpanel-types"
          role="tabpanel"
          id="tabpanel-types"
          aria-labelledby="tab-types"
          className="space-y-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >

          {/* Controles de Tipos */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">

            <button
              onClick={openTypeCreate}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-[var(--color-secondary)]" /> Novo Tipo
            </button>

            <button
              onClick={() => void loadEvents()}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-background)] hover:bg-[var(--color-surface-alt)] border border-[var(--color-outline-variant)] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Recarregar
            </button>

          </div>

          {/* Lista de Tipos */}
          {loadingEvents ? (
            <div className="h-48 bg-[var(--color-surface)] rounded-2xl shimmer" />
          ) : eventTypes.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
              <Tag className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">Nenhum tipo cadastrado.</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Clique em "Novo Tipo" para criar o primeiro tipo de atividade.</p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[var(--color-on-surface)]">
                  <thead className="bg-[var(--color-background)] border-b border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4 w-10">#</th>
                      <th className="p-4">Chave</th>
                      <th className="p-4">Nome</th>
                      <th className="p-4">Cor</th>
                      <th className="p-4">Ícone</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-outline-variant)] font-medium">
                    {eventTypes.map(et => (
                      <tr key={et.id} className="hover:bg-[var(--color-primary-light)]/40 transition-colors">
                        <td className="p-4 text-[var(--color-on-surface-variant)]">
                          {et.sort_order}
                        </td>
                        <td className="p-4 font-mono text-xs text-[var(--color-on-secondary-deep)]">{et.key}</td>
                        <td className="p-4 font-semibold">{et.label}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-[var(--color-outline)]" style={{ backgroundColor: et.color }} />
                            <span className="text-xs font-mono text-[var(--color-on-surface-variant)]">{et.color}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs">{et.icon}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openTypeEdit(et)}
                              className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-primary)]"
                              title="Editar"
                              aria-label={`Editar tipo: ${et.label}`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => void handleTypeDelete(et.id)}
                              disabled={deletingTypeId === et.id}
                              className="p-1.5 rounded-lg hover:bg-[var(--color-crimson)]/10 text-[var(--color-crimson)] disabled:opacity-50"
                              title="Deletar"
                              aria-label={`Deletar tipo: ${et.label}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          </motion.div>
        )}

      {activeTab === 'recipes' && (
        <motion.div
          key="tabpanel-recipes"
          role="tabpanel"
          id="tabpanel-recipes"
          aria-labelledby="tab-recipes"
          className="space-y-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >

          {/* Controles */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">

            <button
              onClick={() => {
                setSelectedRecipe(null);
                setIsRecipeModalOpen(true);
              }}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:shadow-md"
            >
              <Plus className="w-4 h-4 text-[var(--color-secondary)]" /> Nova Receita
            </button>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

              <div className="flex items-center gap-1 bg-[var(--color-background)] p-1 rounded-xl border border-[var(--color-outline-variant)]">
                <button
                  onClick={() => setRecipeStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${recipeStatusFilter === 'all' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-on-surface-variant)]'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setRecipeStatusFilter('published')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${recipeStatusFilter === 'published' ? 'bg-[var(--color-sage)] text-white' : 'text-[var(--color-on-surface-variant)]'}`}
                >
                  Publicadas
                </button>
                <button
                  onClick={() => setRecipeStatusFilter('draft')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${recipeStatusFilter === 'draft' ? 'bg-[var(--color-amber)] text-white' : 'text-[var(--color-on-surface-variant)]'}`}
                >
                  Rascunhos
                </button>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" />
                <input
                  type="text"
                  value={recipesSearch}
                  onChange={e => setRecipesSearch(e.target.value)}
                  placeholder="Buscar receita..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                />
                {recipesSearch && (
                  <button
                    onClick={() => setRecipesSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-[var(--color-primary-light)] text-[var(--color-on-surface-variant)] transition-colors"
                    aria-label="Limpar busca"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Tabela de Receitas */}
          {loadingRecipes ? (
            <div className="h-64 bg-[var(--color-surface)] rounded-2xl shimmer" />
          ) : recipes.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
              <UtensilsCrossed className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">Nenhuma receita cadastrada.</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Clique em "Nova Receita" para criar a primeira.</p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[var(--color-on-surface)]">
                  <thead className="bg-[var(--color-background)] border-b border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Título</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Dificuldade</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-outline-variant)] font-medium">
                    {recipes.filter(r => recipeStatusFilter === 'all' || r.status === recipeStatusFilter).map(recipe => (
                      <tr key={recipe.id} className="hover:bg-[var(--color-primary-light)]/40 transition-colors">
                        <td className="p-4 font-bold text-sm max-w-xs truncate">{recipe.title}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md font-bold uppercase text-[10px] ${getRecipeCategoryColor(recipe.category).bg} ${getRecipeCategoryColor(recipe.category).text}`}>
                            {recipe.category?.replace('_', ' ') || '—'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            recipe.difficulty === 'Easy' ? 'bg-[var(--color-sage-light)] text-[var(--color-sage)] border border-[var(--color-sage)]/30' :
                            recipe.difficulty === 'Medium' ? 'bg-[var(--color-amber-light)] text-[var(--color-amber)] border border-[var(--color-amber)]/30' :
                            'bg-[var(--color-crimson-light)] text-[var(--color-crimson)] border border-[var(--color-crimson)]/30'
                          }`}>
                            {recipe.difficulty}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleRecipeStatus(recipe)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                              recipe.status === 'published'
                                ? 'bg-[var(--color-sage)]/10 text-[var(--color-sage)] border border-[var(--color-sage)]/30'
                                : 'bg-[var(--color-amber)]/10 text-[var(--color-amber)] border border-[var(--color-amber)]/30'
                            }`}
                          >
                            {recipe.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRecipe(recipe);
                              setIsRecipeModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-primary)]"
                            title="Editar"
                            aria-label={`Editar receita: ${recipe.title}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/receitas/${recipe.slug}`)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)]"
                            title="Ver"
                            aria-label={`Ver receita: ${recipe.title}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-crimson)]/10 text-[var(--color-crimson)]"
                            title="Excluir"
                            aria-label={`Excluir receita: ${recipe.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ MODAL: EVENTO ═══════════════════ */}
      <AnimatePresence>
        {showEventForm && (
          <motion.div
            key="event-modal"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={editingEventId ? 'Editar evento' : 'Novo evento'}
            onClick={() => { setShowEventForm(false); setEditingEventId(null); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              ref={eventModalRef}
              className="bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] rounded-2xl w-full max-w-xl shadow-2xl"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
            <div className="h-1.5 bg-[var(--color-secondary)] w-full" />
            <form onSubmit={e => void handleEventSave(e)} className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--color-outline-variant)] pb-4">
                <h3 className="text-lg font-display font-bold text-[var(--color-primary)]">
                  {editingEventId ? 'Editar Evento' : 'Novo Evento'}
                </h3>
                <button type="button" onClick={() => { setShowEventForm(false); setEditingEventId(null); }} className="p-1 rounded-full hover:bg-[var(--color-surface-alt)]" aria-label="Fechar modal de evento">
                  <X className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Mês</label>
                  <select value={eventForm.month} onChange={e => setEventField('month', e.target.value)} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Dia</label>
                  <input type="number" min={1} max={31} value={eventForm.day} onChange={e => setEventField('day', Number(e.target.value))} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                </div>
              </div>

              <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Horário</label>
                <input type="text" value={eventForm.time} onChange={e => setEventField('time', e.target.value)} placeholder="09:00 — 11:30" className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Título *</label>
                <input type="text" required value={eventForm.title} onChange={e => setEventField('title', e.target.value)} maxLength={200} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                <p className="text-[9px] text-[var(--color-on-surface-variant)] mt-1">Máximo 200 caracteres</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Descrição</label>
                <textarea rows={3} value={eventForm.description} onChange={e => setEventField('description', e.target.value)} maxLength={2000} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none" />
                <p className="text-[9px] text-[var(--color-on-surface-variant)] mt-1">{eventForm.description.length}/2000</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Instrutor</label>
                  <input type="text" value={eventForm.instructor} onChange={e => setEventField('instructor', e.target.value)} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Tipo</label>
                  <select value={eventForm.type} onChange={e => setEventField('type', e.target.value)} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30">
                    <option value="">Selecione…</option>
                    {eventTypes.map(et => (
                      <option key={et.id} value={et.key}>{et.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">URL da Imagem</label>
                <input type="text" value={eventForm.image} onChange={e => setEventField('image', e.target.value)} placeholder="https://..." className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30" />
              </div>

              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={eventForm.crystal} onChange={e => setEventField('crystal', e.target.checked)} className="accent-[var(--color-primary)] rounded" />
                  Cristal
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={eventForm.stars} onChange={e => setEventField('stars', e.target.checked)} className="accent-[var(--color-primary)] rounded" />
                  Estrelas
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-outline-variant)]">
                <button type="button" onClick={() => { setShowEventForm(false); setEditingEventId(null); }} className="bg-[var(--color-surface-alt)] hover:bg-[var(--color-outline)] text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={savingEvent} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/20">
                  <Check className="w-4 h-4 text-[var(--color-secondary)]" />
                  {savingEvent ? 'Salvando…' : editingEventId ? 'Salvar Evento' : 'Criar Evento'}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ MODAL: TIPO DE ATIVIDADE ═══════════════════ */}
      <AnimatePresence>
        {showTypeForm && (
          <motion.div
            key="type-modal"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={editingTypeId ? 'Editar tipo' : 'Novo tipo'}
            onClick={() => { setShowTypeForm(false); setEditingTypeId(null); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              ref={typeModalRef}
              className="bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] rounded-2xl w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
            <div className="h-1.5 bg-[var(--color-secondary)] w-full" />
            <form onSubmit={e => void handleTypeSave(e)} className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--color-outline-variant)] pb-4">
                <h3 className="text-lg font-display font-bold text-[var(--color-primary)]">
                  {editingTypeId ? 'Editar Tipo' : 'Novo Tipo'}
                </h3>
                <button type="button" onClick={() => { setShowTypeForm(false); setEditingTypeId(null); }} className="p-1 rounded-full hover:bg-[var(--color-surface-alt)]" aria-label="Fechar modal de tipo">
                  <X className="w-5 h-5 text-[var(--color-on-surface-variant)]" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Chave (key) *</label>
                <input
                  type="text"
                  required
                  value={typeForm.key}
                  onChange={e => setTypeField('key', e.target.value)}
                  placeholder="ex: spells, alchemy"
                  className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
                <p className="text-[9px] text-[var(--color-on-surface-variant)] mt-1">Slug lowercase, sem espaços (ex: my-type)</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Nome de exibição *</label>
                <input
                  type="text"
                  required
                  value={typeForm.label}
                  onChange={e => setTypeField('label', e.target.value)}
                  placeholder="ex: Spells (Magias)"
                  className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Cor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={typeForm.color}
                      onChange={e => setTypeField('color', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-[var(--color-outline-variant)] cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={typeForm.color}
                      onChange={e => setTypeField('color', e.target.value)}
                      className="flex-1 bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Ícone</label>
                  <select
                    value={typeForm.icon}
                    onChange={e => setTypeField('icon', e.target.value)}
                    className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                  >
                    {ICON_OPTIONS.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] mb-1">Ordem</label>
                <input
                  type="number"
                  min={0}
                  value={typeForm.sort_order}
                  onChange={e => setTypeField('sort_order', Number(e.target.value))}
                  className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-outline-variant)]">
                <button type="button" onClick={() => { setShowTypeForm(false); setEditingTypeId(null); }} className="bg-[var(--color-surface-alt)] hover:bg-[var(--color-outline)] text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={savingType} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/20">
                  <Check className="w-4 h-4 text-[var(--color-secondary)]" />
                  {savingType ? 'Salvando…' : editingTypeId ? 'Salvar Tipo' : 'Criar Tipo'}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Criação / Edição de Postagem */}
      <PostModal
        isOpen={isPostModalOpen}
        post={selectedPost}
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
      />

      {/* Modal de Criação / Edição de Receita */}
      <RecipeModal
        isOpen={isRecipeModalOpen}
        recipe={selectedRecipe}
        onClose={() => setIsRecipeModalOpen(false)}
        onSave={handleSaveRecipe}
        onDelete={handleDeleteRecipe}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))}
      />

    </main>
  );
};
