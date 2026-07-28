import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Sparkles, ChevronLeft, ChevronRight, X, Clock, ShieldCheck,
  Flame, Wand2, Swords, FlaskConical, Layers, Eye, Moon, Star, Calendar
} from 'lucide-react';
import { MagicalEvent, MonthData, EventTypeItem } from '../types';
import { apiGet } from '../lib/api';
import { EmptyCalendarState } from '../components/EmptyCalendarState';
import { useEscapeKey } from '../lib/useEscapeKey';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Wand2, Swords, FlaskConical, BookOpen, Sparkles, Flame, Eye, Moon, Star, Layers,
};

function resolveIcon(name: string): React.ComponentType<any> {
  return ICON_MAP[name] || Layers;
}

const REAL_MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function buildRealMonths(startYear: number, startMonth: number, count = 12): MonthData[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(startYear, startMonth + i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const daysCount = new Date(year, month + 1, 0).getDate();
    const firstWeekday = d.getDay();
    const prevMonthDays: number[] = [];
    if (firstWeekday > 0) {
      const prevTotal = new Date(year, month, 0).getDate();
      for (let p = prevTotal - firstWeekday + 1; p <= prevTotal; p++) {
        prevMonthDays.push(p);
      }
    }
    return {
      name: REAL_MONTH_NAMES[month],
      cycle: `${year}`,
      daysCount,
      offset: firstWeekday,
      prevMonthDays,
    };
  });
}

const TODAY = new Date();

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const months = useMemo(() => buildRealMonths(TODAY.getFullYear(), 0, 12), []);
  const [monthIndex, setMonthIndex] = useState(() => TODAY.getMonth());
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<MagicalEvent | null>(null);
  const [eventImgError, setEventImgError] = useState(false);

  const [events, setEvents] = useState<MagicalEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      try {
        const [evs, types] = await Promise.all([
          apiGet<MagicalEvent[]>('/api/events'),
          apiGet<EventTypeItem[]>('/api/event-types'),
        ]);
        if (!cancelled) {
          setEvents(evs || []);
          setEventTypes(types || []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do calendário:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const currentMonth = months[monthIndex];

  // Map types for colors and icons
  const typeMap = useMemo(() => {
    const map = new Map<string, { label: string; color: string; icon: string }>();
    for (const t of eventTypes) {
      map.set(t.key, { label: t.label, color: t.color, icon: t.icon });
    }
    return map;
  }, [eventTypes]);

  // Filter events for the current month and selected type
  const monthEvents = useMemo(() => {
    return events.filter(e => e.month.toLowerCase() === currentMonth.name.toLowerCase());
  }, [events, currentMonth.name]);

  const filteredEvents = useMemo(() => {
    if (selectedType === 'all') return monthEvents;
    return monthEvents.filter(e => e.type === selectedType);
  }, [monthEvents, selectedType]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, MagicalEvent[]>();
    for (const ev of filteredEvents) {
      const list = map.get(ev.day) || [];
      list.push(ev);
      map.set(ev.day, list);
    }
    return map;
  }, [filteredEvents]);

  const nextMonth = () => setMonthIndex(i => Math.min(months.length - 1, i + 1));
  const prevMonth = () => setMonthIndex(i => Math.max(0, i - 1));

  useEscapeKey(() => setSelectedEvent(null), !!selectedEvent);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header do Calendário */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary-deep)] to-[var(--color-primary-deep)] rounded-3xl p-8 sm:p-10 text-white border-2 border-[var(--color-secondary)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-secondary)] flex items-center gap-1.5 justify-center md:justify-start">
            <Sparkles className="w-4 h-4" /> Cronograma de Aulas e Batalhas
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-[var(--color-secondary-light)]">
            Calendário de Atividades — {currentMonth.name} {currentMonth.cycle}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90">
            Acompanhe as Learning Parties, Exames de Combate e Rituais Acadêmicos.
          </p>
        </div>

        {/* Seletor de Mês */}
        <div className="flex items-center gap-3 bg-slate-950/40 p-2 rounded-2xl border border-white/10 shrink-0">
          <button
            onClick={prevMonth}
            disabled={monthIndex === 0}
            className="p-2 rounded-xl hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="font-serif font-bold text-sm px-4 min-w-[120px] text-center text-[var(--color-secondary-light)]">
            {currentMonth.name}
          </span>

          <button
            onClick={nextMonth}
            disabled={monthIndex === months.length - 1}
            className="p-2 rounded-xl hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filtro de Tipos de Atividade */}
      <div className="flex flex-wrap items-center gap-2 bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">
        <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mr-2">
          Disciplinas:
        </span>

        <button
          onClick={() => setSelectedType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedType === 'all'
              ? 'bg-[var(--color-primary)] text-white shadow-xs'
              : 'bg-[var(--color-background)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)]'
          }`}
        >
          Todas ({monthEvents.length})
        </button>

        {eventTypes.map(t => {
          const IconComp = resolveIcon(t.icon);
          const count = monthEvents.filter(e => e.type === t.key).length;
          return (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedType === t.key
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-[var(--color-background)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary-light)]'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
              <IconComp className="w-3.5 h-3.5" />
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grade do Calendário */}
      {loading ? (
        <div className="h-96 bg-[var(--color-surface-alt)] rounded-3xl animate-pulse" />
      ) : monthEvents.length === 0 ? (
        <EmptyCalendarState />
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-lg text-[var(--color-on-surface)]">Nenhum evento nesta disciplina</h3>
          <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Selecione "Todas" ou outro tipo para ver mais eventos.</p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-3xl p-4 sm:p-6 shadow-sm">
          
          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold uppercase tracking-wider text-[var(--color-on-surface-variant)]">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="py-2 bg-[var(--color-background)] rounded-xl">
                {d}
              </div>
            ))}
          </div>

          {/* Células dos dias */}
          <div className="grid grid-cols-7 gap-2">
            
            {/* Overflow mês anterior */}
            {currentMonth.prevMonthDays.map(pDay => (
              <div
                key={`prev-${pDay}`}
                className="min-h-[110px] p-2 bg-[var(--color-surface-alt)] rounded-2xl opacity-40 border border-transparent select-none"
              >
                <span className="text-xs font-bold text-slate-400">{pDay}</span>
              </div>
            ))}

            {/* Dias do mês atual */}
            {Array.from({ length: currentMonth.daysCount }, (_, i) => i + 1).map(day => {
              const dayEvs = eventsByDay.get(day) || [];
              const isToday =
                TODAY.getFullYear() === Number(currentMonth.cycle) &&
                TODAY.getMonth() === REAL_MONTH_NAMES.indexOf(currentMonth.name) &&
                TODAY.getDate() === day;

              return (
                <div
                  key={day}
                  className={`min-h-[110px] p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 shadow-md ring-2 ring-[var(--color-secondary)]/40'
                      : 'border-[var(--color-outline-variant)] bg-[var(--color-background)] hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-[var(--color-secondary)] font-black scale-110' : 'text-[var(--color-on-surface)]'}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-[var(--color-secondary)] text-slate-950">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* Lista de eventos no dia */}
                  <div className="space-y-1 mt-2">
                    {dayEvs.map(ev => {
                      const tInfo = typeMap.get(ev.type);
                      return (
                        <button
                          key={ev.id}
                          onClick={() => { setEventImgError(false); setSelectedEvent(ev); }}
                          className="w-full text-left py-3 px-2 rounded-lg text-white font-medium text-[11px] truncate flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
                          style={{ backgroundColor: tInfo?.color || 'var(--color-primary)' }}
                        >
                          <span className="truncate flex-1">{ev.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </div>

        </div>
      )}

      {/* Modal de Detalhes do Evento */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            key="event-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes do evento"
            onClick={() => setSelectedEvent(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-[var(--color-surface)] border-2 border-[var(--color-secondary)] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Cover Image */}
              {selectedEvent.image && !eventImgError && (
                <div className="h-44 relative bg-slate-950">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                    onError={() => setEventImgError(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 px-3 py-1 rounded-full border border-[var(--color-secondary)]/30">
                    {selectedEvent.month} • Dia {selectedEvent.day}
                  </span>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 rounded-lg hover:bg-[var(--color-surface-alt)] text-slate-500"
                    aria-label="Fechar detalhes do evento"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="font-serif font-bold text-xl text-[var(--color-on-surface)]">
                  {selectedEvent.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-[var(--color-on-surface-variant)]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    {selectedEvent.time}
                  </span>
                  {selectedEvent.instructor && (
                    <span>• Professor: <strong>{selectedEvent.instructor}</strong></span>
                  )}
                </div>

                {selectedEvent.description && (
                  <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed bg-[var(--color-background)] p-4 rounded-xl border border-[var(--color-outline-variant)]">
                    {selectedEvent.description}
                  </p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:bg-[var(--color-primary-hover)] transition-all"
                  >
                    Fechar Detalhes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
