import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Sparkles, ChevronLeft, ChevronRight, X, Clock, ShieldCheck,
  Flame, Wand2, Swords, FlaskConical, Layers, Eye, Moon, Star
} from 'lucide-react';
import { MagicalEvent, MonthData, EventTypeItem } from '../types';
import { apiGet } from '../lib/api';
import { EmptyCalendarState } from '../components/EmptyCalendarState';

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

interface CalendarPageProps {
  onOpenAdmin?: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ onOpenAdmin }) => {
  const months = useMemo(() => buildRealMonths(TODAY.getFullYear(), 0, 12), []);
  const [monthIndex, setMonthIndex] = useState(() => TODAY.getMonth());
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<MagicalEvent | null>(null);

  const [events, setEvents] = useState<MagicalEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [evs, types] = await Promise.all([
          apiGet<MagicalEvent[]>('/api/events'),
          apiGet<EventTypeItem[]>('/api/event-types'),
        ]);
        setEvents(evs || []);
        setEventTypes(types || []);
      } catch (err) {
        console.error('Erro ao carregar dados do calendário:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header do Calendário */}
      <div className="bg-gradient-to-r from-[#1D6A6A] via-[#124949] to-[#121921] rounded-3xl p-8 sm:p-10 text-white border-2 border-[#D4AF37] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5 justify-center md:justify-start">
            <Sparkles className="w-4 h-4" /> Cronograma de Aulas e Batalhas
          </span>
          <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#F5E6B8]">
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

          <span className="font-serif font-bold text-sm px-4 min-w-[120px] text-center text-[#F5E6B8]">
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
      <div className="flex flex-wrap items-center gap-2 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">
        <span className="text-xs font-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider mr-2">
          Disciplinas:
        </span>

        <button
          onClick={() => setSelectedType('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedType === 'all'
              ? 'bg-[#1D6A6A] text-white shadow-xs'
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
                  ? 'bg-[#1D6A6A] text-white shadow-xs'
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
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
      ) : monthEvents.length === 0 ? (
        <EmptyCalendarState onOpenAdmin={onOpenAdmin} />
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
                className="min-h-[110px] p-2 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl opacity-40 border border-transparent select-none"
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
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-md ring-2 ring-[#D4AF37]/40'
                      : 'border-[var(--color-outline-variant)] bg-[var(--color-background)] hover:border-[#1D6A6A]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-[#D4AF37] font-black scale-110' : 'text-[var(--color-on-surface)]'}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-[#D4AF37] text-slate-950">
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
                          onClick={() => setSelectedEvent(ev)}
                          className="w-full text-left p-1.5 rounded-lg text-white font-medium text-[11px] truncate flex items-center gap-1.5 transition-transform hover:scale-[1.02]"
                          style={{ backgroundColor: tInfo?.color || '#1D6A6A' }}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-surface)] border-2 border-[#D4AF37] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4"
            >
              {/* Cover Image */}
              {selectedEvent.image && (
                <div className="h-44 relative bg-slate-950">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                    {selectedEvent.month} • Dia {selectedEvent.day}
                  </span>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="font-serif font-bold text-xl text-[var(--color-on-surface)]">
                  {selectedEvent.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-[var(--color-on-surface-variant)]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#1D6A6A]" />
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
                    className="px-5 py-2 rounded-xl bg-[#1D6A6A] text-white text-xs font-bold hover:bg-[#2A8A8A] transition-all"
                  >
                    Fechar Detalhes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
