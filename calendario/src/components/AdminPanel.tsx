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
} from 'lucide-react';
import { MagicalEvent, EventType } from '../types';
import { apiGet, apiPost, apiPatch, apiDel } from '../lib/api';
import { AdminProfile } from '../hooks/useAuth';

const TYPE_LABELS: Record<EventType, string> = {
  spells: 'Spells (Magias)',
  tactics: 'Tactics (Táticas)',
  alchemy: 'Alquimia (Alchemy)',
  ritual: 'Ritual Sagrado',
  other: 'Outros',
};

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

interface AdminPanelProps {
  user: AdminProfile;
  onLogout: () => void;
}

type FormState = {
  month: string;
  day: number;
  time: string;
  title: string;
  description: string;
  instructor: string;
  type: EventType;
  image: string;
  crystal: boolean;
  stars: boolean;
};

const EMPTY_FORM: FormState = {
  month: MONTHS[new Date().getMonth()],
  day: 1,
  time: '09:00 — 11:30',
  title: '',
  description: '',
  instructor: '',
  type: 'spells',
  image: '',
  crystal: false,
  stars: false,
};

export default function AdminPanel({ user, onLogout }: AdminPanelProps) {
  const [events, setEvents] = useState<MagicalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  function openEdit(evt: MagicalEvent) {
    setEditingId(evt.id);
    setForm({
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
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        month: form.month,
        day: form.day,
        time: form.time,
        title: form.title,
        description: form.description,
        instructor: form.instructor,
        type: form.type,
        image: form.image,
        crystal: form.crystal,
        stars: form.stars,
      };
      if (editingId) {
        await apiPatch(`/api/admin/events/${editingId}`, payload);
      } else {
        await apiPost('/api/admin/events', payload);
      }
      setShowForm(false);
      setEditingId(null);
      await fetchEvents();
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await apiDel(`/api/admin/events/${id}`);
      await fetchEvents();
    } catch (err: any) {
      setError(err?.detail || err?.message || 'Erro ao deletar.');
    } finally {
      setDeletingId(null);
    }
  }

  function setField<K extends keyof FormState>(key: K, val: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

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
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold text-[#002446]">
            Eventos ({events.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void fetchEvents()}
              className="p-2 border border-[#c3c6cf] rounded-lg hover:bg-[#ebe8df] cursor-pointer"
              title="Recarregar"
            >
              <RefreshCw className="w-4 h-4 text-[#43474e]" />
            </button>
            <button
              onClick={openCreate}
              className="bg-[#002446] hover:brightness-110 text-white text-xs font-caps uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer border border-[#abc8f5]/20"
            >
              <PlusCircle className="w-4 h-4 text-[#fed65b]" /> Novo Evento
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg px-4 py-3">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">dispensar</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16 text-[#73777f] text-sm">Carregando eventos…</div>
        )}

        {/* Events table */}
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
                          {TYPE_LABELS[evt.type] || evt.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#73777f] text-xs">{evt.instructor || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(evt)}
                            className="p-1.5 rounded hover:bg-[#e5e2da] text-[#735c00] cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => void handleDelete(evt.id)}
                            disabled={deletingId === evt.id}
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
            <button onClick={openCreate} className="mt-3 text-[#735c00] hover:underline text-xs cursor-pointer">
              Criar o primeiro evento
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#002446]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#fcf9f0] border-2 border-[#735c00] rounded-2xl w-full max-w-xl shadow-2xl">
            <div className="h-1.5 bg-[#735c00] w-full" />
            <form onSubmit={e => void handleSave(e)} className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#c3c6cf]/40 pb-4">
                <h3 className="text-lg font-serif font-bold text-[#735c00]">
                  {editingId ? 'Editar Evento' : 'Novo Evento'}
                </h3>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1 rounded-full hover:bg-[#e5e2da] cursor-pointer">
                  <X className="w-5 h-5 text-[#43474e]" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Mês</label>
                  <select value={form.month} onChange={e => setField('month', e.target.value)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Dia</label>
                  <input type="number" min={1} max={31} value={form.day} onChange={e => setField('day', Number(e.target.value))} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Horário</label>
                <input type="text" value={form.time} onChange={e => setField('time', e.target.value)} placeholder="09:00 — 11:30" className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Título</label>
                <input type="text" required value={form.title} onChange={e => setField('title', e.target.value)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Descrição</label>
                <textarea rows={3} value={form.description} onChange={e => setField('description', e.target.value)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Instrutor</label>
                  <input type="text" value={form.instructor} onChange={e => setField('instructor', e.target.value)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
                </div>
                <div>
                  <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">Tipo</label>
                  <select value={form.type} onChange={e => setField('type', e.target.value as EventType)} className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30">
                    <option value="spells">Spells (Magias)</option>
                    <option value="tactics">Tactics (Táticas)</option>
                    <option value="alchemy">Alquimia (Alchemy)</option>
                    <option value="ritual">Ritual Sagrado</option>
                    <option value="other">Outros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">URL da Imagem</label>
                <input type="text" value={form.image} onChange={e => setField('image', e.target.value)} placeholder="https://..." className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30" />
              </div>

              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2 text-xs text-[#43474e] cursor-pointer">
                  <input type="checkbox" checked={form.crystal} onChange={e => setField('crystal', e.target.checked)} className="accent-[#735c00] rounded" />
                  Cristal
                </label>
                <label className="flex items-center gap-2 text-xs text-[#43474e] cursor-pointer">
                  <input type="checkbox" checked={form.stars} onChange={e => setField('stars', e.target.checked)} className="accent-[#735c00] rounded" />
                  Estrelas
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#c3c6cf]/40">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-[#ebe8df] hover:bg-[#e5e2da] text-[#43474e] text-xs font-caps uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="bg-[#002446] hover:brightness-110 disabled:opacity-50 text-white text-xs font-caps uppercase tracking-wider px-6 py-2.5 rounded-xl cursor-pointer border border-[#abc8f5]/20 flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#fed65b]" />
                  {saving ? 'Salvando…' : editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
