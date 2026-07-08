import React, { useEffect, useState, useCallback } from 'react';
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Check,
  LogOut,
  RefreshCw,
  Clock,
  CalendarDays,
  Tag,
  GripVertical,
} from 'lucide-react';
import { MagicalEvent, EventTypeItem } from '../types';
import { apiGet, apiPost, apiPatch, apiDel } from '../lib/api';
import { AdminProfile } from '../hooks/useAuth';
import { useFocusTrap } from '../hooks/useFocusTrap';

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

const ICON_OPTIONS = [
  'Wand2','Swords','FlaskConical','BookOpen','Sparkles',
  'Shield','Flame','Eye','Moon','Star','Layers',
];

interface AdminPanelProps {
  user: AdminProfile;
  onLogout: () => void;
}

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

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [tab, setTab] = useState<'events' | 'types'>('events');

  // ── Event Types ──
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);

  const fetchEventTypes = useCallback(async () => {
    try {
      const data = await apiGet<EventTypeItem[]>('/api/event-types');
      setEventTypes(data);
    } catch {
      // mantem vazio
    }
  }, []);

  useEffect(() => {
    void fetchEventTypes();
  }, [fetchEventTypes]);

  // ── Events ──
  const [events, setEvents] = useState<MagicalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<MagicalEvent[]>('/api/events');
      setEvents(data);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  // ── Event Form ──
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>({ ...EMPTY_EVENT_FORM });
  const [savingEvent, setSavingEvent] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

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
      await fetchEvents();
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Erro ao salvar.');
    } finally {
      setSavingEvent(false);
    }
  }

  async function handleEventDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    setDeletingEventId(id);
    try {
      await apiDel('/api/events', { id });
      await fetchEvents();
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Erro ao deletar.');
    } finally {
      setDeletingEventId(null);
    }
  }

  function setEventField<K extends keyof EventFormState>(key: K, val: EventFormState[K]) {
    setEventForm(prev => ({ ...prev, [key]: val }));
  }

  // ── Type Form ──
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typeForm, setTypeForm] = useState<TypeFormState>({ ...EMPTY_TYPE_FORM });
  const [savingType, setSavingType] = useState(false);
  const [deletingTypeId, setDeletingTypeId] = useState<string | null>(null);

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
      await fetchEventTypes();
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Erro ao salvar tipo.');
    } finally {
      setSavingType(false);
    }
  }

  async function handleTypeDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja excluir este tipo de atividade?')) return;
    setDeletingTypeId(id);
    try {
      await apiDel('/api/event-types', { id });
      await fetchEventTypes();
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Erro ao deletar tipo.');
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

  const eventModalRef = useFocusTrap(showEventForm);
  const typeModalRef = useFocusTrap(showTypeForm);

  return (
    <div className="min-h-screen bg-[#fcf9f0] text-[#1c1c17]">
      {/* Top bar */}
      <header className="bg-[#002446] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-5 h-5 text-[#fed65b]" />
          <h1 className="text-lg font-serif font-bold">Painel Admin — HoN EX</h1>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-[#abc8f5]">
            Logado como <strong className="text-white">{user.display_name || user.username}</strong>
          </span>
          <button
            onClick={() => void onLogout()}
            className="flex items-center gap-1 text-[#fed65b] hover:underline cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
          <a
            href="#/"
            className="text-[#abc8f5] hover:text-white hover:underline cursor-pointer"
          >
            ← Calendário
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#c3c6cf]/40">
          <button
            onClick={() => setTab('events')}
            className={`px-5 py-3 text-sm font-caps uppercase tracking-wider cursor-pointer transition-colors border-b-2 ${
              tab === 'events'
                ? 'border-[#735c00] text-[#735c00] font-bold'
                : 'border-transparent text-[#73777f] hover:text-[#43474e]'
            }`}
          >
            <CalendarDays className="w-4 h-4 inline mr-2" />
            Eventos ({events.length})
          </button>
          <button
            onClick={() => setTab('types')}
            className={`px-5 py-3 text-sm font-caps uppercase tracking-wider cursor-pointer transition-colors border-b-2 ${
              tab === 'types'
                ? 'border-[#735c00] text-[#735c00] font-bold'
                : 'border-transparent text-[#73777f] hover:text-[#43474e]'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Tipos de Atividade ({eventTypes.length})
          </button>
        </div>

        {error && (
          <div className="text-xs text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg px-4 py-3">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">dispensar</button>
          </div>
        )}

        {/* ═══════ TAB: EVENTOS ═══════ */}
        {tab === 'events' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#002446]">Eventos</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void fetchEvents()}
                  className="p-2 border border-[#c3c6cf] rounded-lg hover:bg-[#ebe8df] cursor-pointer"
                  title="Recarregar"
                >
                  <RefreshCw className="w-4 h-4 text-[#43474e]" />
                </button>
                <button
                  onClick={openEventCreate}
                  className="bg-[#002446] hover:brightness-110 text-white text-xs font-caps uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer border border-[#abc8f5]/20"
                >
                  <PlusCircle className="w-4 h-4 text-[#fed65b]" /> Novo Evento
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-16 text-[#73777f] text-sm">Carregando eventos…</div>
            )}

            {!loading && events.length > 0 && (
              <div className="bg-[#fcf9f0] border border-[#c3c6cf] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f1eee5] text-left text-[10px] font-caps uppercase tracking-widest text-[#73777f]">
                        <th className="px-4 py-3">Dia</th>
                        <th className="px-4 py-3">Mês</th>
                        <th className="px-4 py-3">Horário</th>
                        <th className="px-4 py-3">Título</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Instrutor</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(evt => (
                        <tr key={evt.id} className="border-t border-[#c3c6cf]/40 hover:bg-[#f1eee5]/50">
                          <td className="px-4 py-3 font-serif font-bold text-[#002446]">
                            {evt.day < 10 ? `0${evt.day}` : evt.day}
                          </td>
                          <td className="px-4 py-3 text-[#43474e]">{evt.month}</td>
                          <td className="px-4 py-3 text-[#735c00] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {evt.time}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#002446] max-w-[200px] truncate">
                            {evt.title}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[9px] font-caps px-2 py-0.5 rounded-full border border-[#c3c6cf] bg-[#f1eee5] text-[#43474e] uppercase">
                              {getTypeLabel(evt.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#73777f] text-xs">{evt.instructor || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEventEdit(evt)}
                                className="p-1.5 rounded hover:bg-[#e5e2da] text-[#735c00] cursor-pointer"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => void handleEventDelete(evt.id)}
                                disabled={deletingEventId === evt.id}
                                className="p-1.5 rounded hover:bg-[#ffdad6] text-[#ba1a1a] cursor-pointer disabled:opacity-50"
                                title="Deletar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

            {!loading && events.length === 0 && (
              <div className="text-center py-16 text-[#73777f]">
                <p className="text-sm">Nenhum evento encontrado.</p>
                <button onClick={openEventCreate} className="mt-3 text-[#735c00] hover:underline text-xs cursor-pointer">
                  Criar o primeiro evento
                </button>
              </div>
            )}
          </>
        )}

        {/* ═══════ TAB: TIPOS ═══════ */}
        {tab === 'types' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-[#002446]">Tipos de Atividade</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => void fetchEventTypes()}
                  className="p-2 border border-[#c3c6cf] rounded-lg hover:bg-[#ebe8df] cursor-pointer"
                  title="Recarregar"
                >
                  <RefreshCw className="w-4 h-4 text-[#43474e]" />
                </button>
                <button
                  onClick={openTypeCreate}
                  className="bg-[#002446] hover:brightness-110 text-white text-xs font-caps uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer border border-[#abc8f5]/20"
                >
                  <PlusCircle className="w-4 h-4 text-[#fed65b]" /> Novo Tipo
                </button>
              </div>
            </div>

            {eventTypes.length > 0 && (
              <div className="bg-[#fcf9f0] border border-[#c3c6cf] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#f1eee5] text-left text-[10px] font-caps uppercase tracking-widest text-[#73777f]">
                        <th className="px-4 py-3 w-10">#</th>
                        <th className="px-4 py-3">Chave (key)</th>
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Cor</th>
                        <th className="px-4 py-3">Ícone</th>
                        <th className="px-4 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventTypes.map(et => (
                        <tr key={et.id} className="border-t border-[#c3c6cf]/40 hover:bg-[#f1eee5]/50">
                          <td className="px-4 py-3 text-[#73777f]">
                            <GripVertical className="w-3.5 h-3.5" />
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[#735c00]">{et.key}</td>
                          <td className="px-4 py-3 font-semibold text-[#002446]">{et.label}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border border-[#c3c6cf]" style={{ backgroundColor: et.color }} />
                              <span className="text-xs font-mono text-[#73777f]">{et.color}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#43474e]">{et.icon}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openTypeEdit(et)}
                                className="p-1.5 rounded hover:bg-[#e5e2da] text-[#735c00] cursor-pointer"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => void handleTypeDelete(et.id)}
                                disabled={deletingTypeId === et.id}
                                className="p-1.5 rounded hover:bg-[#ffdad6] text-[#ba1a1a] cursor-pointer disabled:opacity-50"
                                title="Deletar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

            {eventTypes.length === 0 && (
              <div className="text-center py-16 text-[#73777f]">
                <p className="text-sm">Nenhum tipo cadastrado.</p>
                <button onClick={openTypeCreate} className="mt-3 text-[#735c00] hover:underline text-xs cursor-pointer">
                  Criar o primeiro tipo
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ═══════ EVENT MODAL ═══════ */}
      {showEventForm && (
        <div className="fixed inset-0 bg-[#002446]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={editingEventId ? 'Editar evento' : 'Novo evento'}>
          <div ref={eventModalRef} className="bg-[#fcf9f0] border-2 border-[#735c00] rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="h-1.5 bg-[#735c00] w-full" />
            <form onSubmit={e => void handleEventSave(e)} className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#c3c6cf]/40 pb-4">
                <h3 className="text-lg font-serif font-bold text-[#735c00]">
                  {editingEventId ? 'Editar Evento' : 'Novo Evento'}
                </h3>
                <button type="button" onClick={() => { setShowEventForm(false); setEditingEventId(null); }} className="p-1 rounded-full hover:bg-[#e5e2da] cursor-pointer" aria-label="Fechar">
                  <X className="w-5 h-5 text-[#43474e]" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Mês</label>
                  <select value={eventForm.month} onChange={e => setEventField('month', e.target.value)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Dia</label>
                  <input type="number" min={1} max={31} value={eventForm.day} onChange={e => setEventField('day', Number(e.target.value))} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Horário</label>
                <input type="text" value={eventForm.time} onChange={e => setEventField('time', e.target.value)} placeholder="09:00 — 11:30" className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Título</label>
                <input type="text" required value={eventForm.title} onChange={e => setEventField('title', e.target.value)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Descrição</label>
                <textarea rows={3} value={eventForm.description} onChange={e => setEventField('description', e.target.value)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Instrutor</label>
                  <input type="text" value={eventForm.instructor} onChange={e => setEventField('instructor', e.target.value)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Tipo</label>
                  <select value={eventForm.type} onChange={e => setEventField('type', e.target.value)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30">
                    <option value="">Selecione…</option>
                    {eventTypes.map(et => (
                      <option key={et.id} value={et.key}>{et.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">URL da Imagem</label>
                <input type="text" value={eventForm.image} onChange={e => setEventField('image', e.target.value)} placeholder="https://..." className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
              </div>

              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2 text-xs text-[#43474e] cursor-pointer">
                  <input type="checkbox" checked={eventForm.crystal} onChange={e => setEventField('crystal', e.target.checked)} className="accent-[#735c00] rounded" />
                  Cristal
                </label>
                <label className="flex items-center gap-2 text-xs text-[#43474e] cursor-pointer">
                  <input type="checkbox" checked={eventForm.stars} onChange={e => setEventField('stars', e.target.checked)} className="accent-[#735c00] rounded" />
                  Estrelas
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#c3c6cf]/40">
                <button type="button" onClick={() => { setShowEventForm(false); setEditingEventId(null); }} className="bg-[#ebe8df] hover:bg-[#e5e2da] text-[#43474e] text-xs font-caps uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={savingEvent} className="bg-[#002446] hover:brightness-110 disabled:opacity-50 text-white text-xs font-caps uppercase tracking-wider px-6 py-2.5 rounded-xl cursor-pointer border border-[#abc8f5]/20 flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#fed65b]" />
                  {savingEvent ? 'Salvando…' : editingEventId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ TYPE MODAL ═══════ */}
      {showTypeForm && (
        <div className="fixed inset-0 bg-[#002446]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label={editingTypeId ? 'Editar tipo' : 'Novo tipo'}>
          <div ref={typeModalRef} className="bg-[#fcf9f0] border-2 border-[#735c00] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="h-1.5 bg-[#735c00] w-full" />
            <form onSubmit={e => void handleTypeSave(e)} className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#c3c6cf]/40 pb-4">
                <h3 className="text-lg font-serif font-bold text-[#735c00]">
                  {editingTypeId ? 'Editar Tipo' : 'Novo Tipo'}
                </h3>
                <button type="button" onClick={() => { setShowTypeForm(false); setEditingTypeId(null); }} className="p-1 rounded-full hover:bg-[#e5e2da] cursor-pointer" aria-label="Fechar">
                  <X className="w-5 h-5 text-[#43474e]" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Chave (key)</label>
                <input
                  type="text"
                  required
                  value={typeForm.key}
                  onChange={e => setTypeField('key', e.target.value)}
                  placeholder="ex: spells, alchemy"
                  className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                />
                <p className="text-[9px] text-[#73777f] mt-1">Slug lowercase, sem espaços (ex: my-type)</p>
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Nome de exibição</label>
                <input
                  type="text"
                  required
                  value={typeForm.label}
                  onChange={e => setTypeField('label', e.target.value)}
                  placeholder="ex: Spells (Magias)"
                  className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Cor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={typeForm.color}
                      onChange={e => setTypeField('color', e.target.value)}
                      className="w-10 h-10 rounded-lg border border-[#c3c6cf] cursor-pointer p-0"
                    />
                    <input
                      type="text"
                      value={typeForm.color}
                      onChange={e => setTypeField('color', e.target.value)}
                      className="flex-1 bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Ícone</label>
                  <select
                    value={typeForm.icon}
                    onChange={e => setTypeField('icon', e.target.value)}
                    className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                  >
                    {ICON_OPTIONS.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Ordem</label>
                <input
                  type="number"
                  min={0}
                  value={typeForm.sort_order}
                  onChange={e => setTypeField('sort_order', Number(e.target.value))}
                  className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#c3c6cf]/40">
                <button type="button" onClick={() => { setShowTypeForm(false); setEditingTypeId(null); }} className="bg-[#ebe8df] hover:bg-[#e5e2da] text-[#43474e] text-xs font-caps uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={savingType} className="bg-[#002446] hover:brightness-110 disabled:opacity-50 text-white text-xs font-caps uppercase tracking-wider px-6 py-2.5 rounded-xl cursor-pointer border border-[#abc8f5]/20 flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#fed65b]" />
                  {savingType ? 'Salvando…' : editingTypeId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
