import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, BookOpen, Plus, Edit3, Trash2, Pin, Search, ShieldCheck, LogOut, Check, Eye,
  PlusCircle, X, Clock, Tag, RefreshCw, GripVertical,
} from 'lucide-react';
import { Post, MagicalEvent, EventTypeItem } from '../types';
import { apiGet, apiPost, apiPatch, apiDel } from '../lib/api';
import { PostModal } from '../components/PostModal';
import { useAuth } from '../lib/AuthContext';

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
  color: '#1a3a5f',
  icon: 'Wand2',
  sort_order: 0,
};

export const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { admin, onLogout } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'types'>('posts');

  // ── States for Posts Manager ──
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsSearch, setPostsSearch] = useState('');
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

  // ── Load Posts ──
  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      let url = '/api/posts?status=all';
      if (postsSearch) url += `&search=${encodeURIComponent(postsSearch)}`;
      const data = await apiGet<Post[]>(url);
      setPosts(data || []);
    } catch (err) {
      console.error('Erro ao carregar postagens no admin:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // ── Load Events & Types ──
  const loadEvents = async () => {
    setLoadingEvents(true);
    setEventError(null);
    try {
      const [evs, types] = await Promise.all([
        apiGet<MagicalEvent[]>('/api/events'),
        apiGet<EventTypeItem[]>('/api/event-types'),
      ]);
      setEvents(evs || []);
      setEventTypes(types || []);
    } catch (err: any) {
      console.error('Erro ao carregar eventos no admin:', err);
      setEventError(err?.detail || err?.message || 'Falha ao carregar eventos.');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') {
      loadPosts();
    } else {
      loadEvents();
    }
  }, [activeTab, postsSearch]);

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
    await apiDel('/api/posts', { id });
    await loadPosts();
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
      setEventError(err?.detail || err?.message || 'Erro ao salvar evento.');
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleEventDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    setDeletingEventId(id);
    try {
      await apiDel('/api/events', { id });
      await loadEvents();
    } catch (err: any) {
      setEventError(err?.detail || err?.message || 'Erro ao deletar evento.');
    } finally {
      setDeletingEventId(null);
    }
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
      setEventError(err?.detail || err?.message || 'Erro ao salvar tipo.');
    } finally {
      setSavingType(false);
    }
  }

  async function handleTypeDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de atividade?')) return;
    setDeletingTypeId(id);
    try {
      await apiDel('/api/event-types', { id });
      await loadEvents();
    } catch (err: any) {
      setEventError(err?.detail || err?.message || 'Erro ao deletar tipo.');
    } finally {
      setDeletingTypeId(null);
    }
  }

  function setTypeField<K extends keyof TypeFormState>(key: K, val: TypeFormState[K]) {
    setTypeForm(prev => ({ ...prev, [key]: val }));
  }

  function getTypeLabel(key: string): string {
    return eventTypes.find(t => t.key === key)?.label || key;
  }

  const filteredPosts = posts.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header do Painel Admin */}
      <div className="bg-gradient-to-r from-[#1D6A6A] via-[#124949] to-[#121921] rounded-3xl p-8 text-white border-2 border-[#D4AF37] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6B8] text-xs font-bold uppercase">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            Área de Administração Reitoral
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#F5E6B8]">
            Painel Administrativo Unificado
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90">
            Conectado como <strong className="text-white">{admin.display_name}</strong> (@{admin.username})
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0"
        >
          <LogOut className="w-4 h-4" /> Sair do Painel
        </button>
      </div>

      {/* Abas de Gerenciamento */}
      <div className="flex items-center gap-2 border-b border-[var(--color-outline-variant)] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-serif font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'posts'
              ? 'bg-[#1D6A6A] text-white shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#D4AF37]" />
          Postagens & Códices ({posts.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-serif font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'events'
              ? 'bg-[#1D6A6A] text-white shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          Eventos do Calendário ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('types')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-serif font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'types'
              ? 'bg-[#1D6A6A] text-white shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <Tag className="w-4 h-4 text-[#D4AF37]" />
          Tipos de Atividade ({eventTypes.length})
        </button>
      </div>

      {/* Error Banner */}
      {eventError && (
        <div className="text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <span>{eventError}</span>
          <button onClick={() => setEventError(null)} className="underline font-bold ml-2">dispensar</button>
        </div>
      )}

      {/* ═══════════════════ ABA 1: POSTAGENS ═══════════════════ */}
      {activeTab === 'posts' && (
        <div className="space-y-6">

          {/* Controles */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">

            <button
              onClick={() => {
                setSelectedPost(null);
                setIsPostModalOpen(true);
              }}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#1D6A6A] hover:bg-[#2A8A8A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Nova Postagem / Guia
            </button>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">

              {/* Filtro de Status */}
              <div className="flex items-center gap-1 bg-[var(--color-background)] p-1 rounded-xl border border-[var(--color-outline-variant)]">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === 'all' ? 'bg-[#1D6A6A] text-white' : 'text-slate-500'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === 'published' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Publicadas
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === 'draft' ? 'bg-amber-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Rascunhos
                </button>
              </div>

              {/* Busca */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={postsSearch}
                  onChange={e => setPostsSearch(e.target.value)}
                  placeholder="Buscar postagem..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:ring-2 focus:ring-[#1D6A6A] focus:outline-none"
                />
              </div>

            </div>

          </div>

          {/* Tabela de Postagens */}
          {loadingPosts ? (
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">Nenhuma postagem cadastrada.</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Clique em "Nova Postagem / Guia" para criar a primeira publicação.</p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[var(--color-on-surface)]">
                  <thead className="bg-[var(--color-background)] border-b border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-bold uppercase tracking-wider">
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
                        <td className="p-4 font-bold text-sm max-w-xs truncate">
                          {post.title}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-[#1D6A6A]/10 text-[#1D6A6A] dark:text-[#4ECDC4] font-bold uppercase text-[10px]">
                            {post.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                              post.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleTogglePin(post)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              post.is_pinned
                                ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]'
                                : 'text-slate-400 border-slate-300 dark:border-slate-700 hover:text-[#D4AF37]'
                            }`}
                            title={post.is_pinned ? 'Remover dos Destaques' : 'Fixar em Destaque'}
                          >
                            <Pin className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                        <td className="p-4 text-slate-500">{post.author_name}</td>
                        <td className="p-4 text-slate-500">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/post/${post.slug}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            title="Ver Publicação"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPost(post);
                              setIsPostModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-[#1D6A6A] dark:text-[#4ECDC4]"
                            title="Editar Postagem"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                            title="Excluir Postagem"
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

        </div>
      )}

      {/* ═══════════════════ ABA 2: EVENTOS DO CALENDÁRIO ═══════════════════ */}
      {activeTab === 'events' && (
        <div className="space-y-6">

          {/* Controles de Eventos */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">

            <button
              onClick={openEventCreate}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#1D6A6A] hover:bg-[#2A8A8A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-[#D4AF37]" /> Novo Evento
            </button>

            <button
              onClick={() => void loadEvents()}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-background)] hover:bg-slate-200 dark:hover:bg-slate-800 border border-[var(--color-outline-variant)] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Recarregar
            </button>

          </div>

          {/* Lista de Eventos */}
          {loadingEvents ? (
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
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
                        <td className="p-4 font-serif font-bold text-[#124949]">
                          {evt.day < 10 ? `0${evt.day}` : evt.day}
                        </td>
                        <td className="p-4">{evt.month}</td>
                        <td className="p-4 text-[#735C00] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {evt.time}
                        </td>
                        <td className="p-4 font-semibold max-w-[200px] truncate">
                          {evt.title}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-[#1D6A6A]/10 text-[#1D6A6A] dark:text-[#4ECDC4] font-bold uppercase text-[10px]">
                            {getTypeLabel(evt.type)}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{evt.instructor || '—'}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEventEdit(evt)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-[#1D6A6A] dark:text-[#4ECDC4]"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => void handleEventDelete(evt.id)}
                              disabled={deletingEventId === evt.id}
                              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 disabled:opacity-50"
                              title="Deletar"
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

        </div>
      )}

      {/* ═══════════════════ ABA 3: TIPOS DE ATIVIDADE ═══════════════════ */}
      {activeTab === 'types' && (
        <div className="space-y-6">

          {/* Controles de Tipos */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">

            <button
              onClick={openTypeCreate}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#1D6A6A] hover:bg-[#2A8A8A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4 text-[#D4AF37]" /> Novo Tipo
            </button>

            <button
              onClick={() => void loadEvents()}
              className="px-4 py-2.5 rounded-xl bg-[var(--color-background)] hover:bg-slate-200 dark:hover:bg-slate-800 border border-[var(--color-outline-variant)] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Recarregar
            </button>

          </div>

          {/* Lista de Tipos */}
          {loadingEvents ? (
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ) : eventTypes.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
              <Tag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
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
                        <td className="p-4 text-slate-400">
                          <GripVertical className="w-4 h-4" />
                        </td>
                        <td className="p-4 font-mono text-xs text-[#735C00]">{et.key}</td>
                        <td className="p-4 font-semibold">{et.label}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: et.color }} />
                            <span className="text-xs font-mono text-slate-500">{et.color}</span>
                          </div>
                        </td>
                        <td className="p-4 text-xs">{et.icon}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openTypeEdit(et)}
                              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-[#1D6A6A] dark:text-[#4ECDC4]"
                              title="Editar"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => void handleTypeDelete(et.id)}
                              disabled={deletingTypeId === et.id}
                              className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 disabled:opacity-50"
                              title="Deletar"
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

        </div>
      )}

      {/* ═══════════════════ MODAL: EVENTO ═══════════════════ */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={editingEventId ? 'Editar evento' : 'Novo evento'}>
          <div className="bg-[var(--color-surface)] border-2 border-[#D4AF37] rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="h-1.5 bg-[#D4AF37] w-full" />
            <form onSubmit={e => void handleEventSave(e)} className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--color-outline-variant)] pb-4">
                <h3 className="text-lg font-serif font-bold text-[#1D6A6A]">
                  {editingEventId ? 'Editar Evento' : 'Novo Evento'}
                </h3>
                <button type="button" onClick={() => { setShowEventForm(false); setEditingEventId(null); }} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Mês</label>
                  <select value={eventForm.month} onChange={e => setEventField('month', e.target.value)} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Dia</label>
                  <input type="number" min={1} max={31} value={eventForm.day} onChange={e => setEventField('day', Number(e.target.value))} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Horário</label>
                <input type="text" value={eventForm.time} onChange={e => setEventField('time', e.target.value)} placeholder="09:00 — 11:30" className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Título *</label>
                <input type="text" required value={eventForm.title} onChange={e => setEventField('title', e.target.value)} maxLength={200} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30" />
                <p className="text-[9px] text-slate-400 mt-1">Máximo 200 caracteres</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Descrição</label>
                <textarea rows={3} value={eventForm.description} onChange={e => setEventField('description', e.target.value)} maxLength={2000} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30 resize-none" />
                <p className="text-[9px] text-slate-400 mt-1">{eventForm.description.length}/2000</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Instrutor</label>
                  <input type="text" value={eventForm.instructor} onChange={e => setEventField('instructor', e.target.value)} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Tipo</label>
                  <select value={eventForm.type} onChange={e => setEventField('type', e.target.value)} className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30">
                    <option value="">Selecione…</option>
                    {eventTypes.map(et => (
                      <option key={et.id} value={et.key}>{et.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">URL da Imagem</label>
                <input type="text" value={eventForm.image} onChange={e => setEventField('image', e.target.value)} placeholder="https://..." className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30" />
              </div>

              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={eventForm.crystal} onChange={e => setEventField('crystal', e.target.checked)} className="accent-[#1D6A6A] rounded" />
                  Cristal
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input type="checkbox" checked={eventForm.stars} onChange={e => setEventField('stars', e.target.checked)} className="accent-[#1D6A6A] rounded" />
                  Estrelas
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-outline-variant)]">
                <button type="button" onClick={() => { setShowEventForm(false); setEditingEventId(null); }} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl">
                  Cancelar
                </button>
                <button type="submit" disabled={savingEvent} className="bg-[#1D6A6A] hover:bg-[#2A8A8A] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md">
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  {savingEvent ? 'Salvando…' : editingEventId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════ MODAL: TIPO DE ATIVIDADE ═══════════════════ */}
      {showTypeForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={editingTypeId ? 'Editar tipo' : 'Novo tipo'}>
          <div className="bg-[var(--color-surface)] border-2 border-[#D4AF37] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="h-1.5 bg-[#D4AF37] w-full" />
            <form onSubmit={e => void handleTypeSave(e)} className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--color-outline-variant)] pb-4">
                <h3 className="text-lg font-serif font-bold text-[#1D6A6A]">
                  {editingTypeId ? 'Editar Tipo' : 'Novo Tipo'}
                </h3>
                <button type="button" onClick={() => { setShowTypeForm(false); setEditingTypeId(null); }} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Chave (key) *</label>
                <input
                  type="text"
                  required
                  value={typeForm.key}
                  onChange={e => setTypeField('key', e.target.value)}
                  placeholder="ex: spells, alchemy"
                  className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30"
                />
                <p className="text-[9px] text-slate-400 mt-1">Slug lowercase, sem espaços (ex: my-type)</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Nome de exibição *</label>
                <input
                  type="text"
                  required
                  value={typeForm.label}
                  onChange={e => setTypeField('label', e.target.value)}
                  placeholder="ex: Spells (Magias)"
                  className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Cor</label>
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
                      className="flex-1 bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Ícone</label>
                  <select
                    value={typeForm.icon}
                    onChange={e => setTypeField('icon', e.target.value)}
                    className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30"
                  >
                    {ICON_OPTIONS.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1D6A6A] mb-1">Ordem</label>
                <input
                  type="number"
                  min={0}
                  value={typeForm.sort_order}
                  onChange={e => setTypeField('sort_order', Number(e.target.value))}
                  className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D6A6A]/30"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-outline-variant)]">
                <button type="button" onClick={() => { setShowTypeForm(false); setEditingTypeId(null); }} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl">
                  Cancelar
                </button>
                <button type="submit" disabled={savingType} className="bg-[#1D6A6A] hover:bg-[#2A8A8A] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md">
                  <Check className="w-4 h-4 text-[#D4AF37]" />
                  {savingType ? 'Salvando…' : editingTypeId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Postagem */}
      <PostModal
        isOpen={isPostModalOpen}
        post={selectedPost}
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
      />

    </div>
  );
};
