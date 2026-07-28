import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Sparkles, ChevronLeft, ChevronRight, X, Clock,
  Wand2, Swords, FlaskConical, Layers, Eye, Moon, Star, Calendar, RefreshCw
} from 'lucide-react';
import { MagicalEvent, MonthData, EventTypeItem } from '../types';
import { apiGet } from '../lib/api';
import { EmptyCalendarState } from '../components/EmptyCalendarState';
import { useEscapeKey } from '../lib/useEscapeKey';
import { useFocusTrap } from '../lib/useFocusTrap';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Wand2, Swords, FlaskConical, BookOpen, Sparkles, Eye, Moon, Star, Layers,
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

function getWeekdayOfMonth(monthName: string, day: number, year: number): number {
  const monthIdx = REAL_MONTH_NAMES.indexOf(monthName);
  if (monthIdx === -1) return 0;
  return new Date(year, monthIdx, day).getDay();
}

function eventMatchesMonth(event: MagicalEvent, monthName: string, year: number): boolean {
  const evMonth = event.month.toLowerCase();
  const curMonth = monthName.toLowerCase();

  if (event.is_recurring) {
    const evWeekday = getWeekdayOfMonth(event.month, event.day, year);
    const monthIdx = REAL_MONTH_NAMES.indexOf(monthName);
    if (monthIdx === -1) return false;
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(year, monthIdx, d).getDay() === evWeekday) return true;
    }
    return false;
  }

  if (event.end_day || event.end_month) {
    const curMonthIdx = REAL_MONTH_NAMES.indexOf(monthName);
    const evStartMonthIdx = REAL_MONTH_NAMES.indexOf(event.month);
    const evEndMonthIdx = REAL_MONTH_NAMES.indexOf(event.end_month || event.month);
    if (curMonthIdx === -1 || evStartMonthIdx === -1 || evEndMonthIdx === -1) return false;
    if (curMonthIdx < evStartMonthIdx || curMonthIdx > evEndMonthIdx) return false;
    return true;
  }

  return evMonth === curMonth;
}

export const CalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const months = useMemo(() => buildRealMonths(TODAY.getFullYear(), 0, 12), []);
  const [monthIndex, setMonthIndex] = useState(() => TODAY.getMonth());
  const [monthDirection, setMonthDirection] = useState<1 | -1>(1);
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

  const typeMap = useMemo(() => {
    const map = new Map<string, { label: string; color: string; icon: string }>();
    for (const t of eventTypes) {
      map.set(t.key, { label: t.label, color: t.color, icon: t.icon });
    }
    return map;
  }, [eventTypes]);

  const monthEvents = useMemo(() => {
    const year = Number(currentMonth.cycle);
    return events.filter(e => eventMatchesMonth(e, currentMonth.name, year));
  }, [events, currentMonth.name, currentMonth.cycle]);

  const filteredEvents = useMemo(() => {
    if (selectedType === 'all') return monthEvents;
    return monthEvents.filter(e => e.type === selectedType);
  }, [monthEvents, selectedType]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, MagicalEvent[]>();
    const year = Number(currentMonth.cycle);
    const monthIdx = REAL_MONTH_NAMES.indexOf(currentMonth.name);
    if (monthIdx === -1) return map;
    const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

    for (const ev of filteredEvents) {
      if (ev.is_recurring) {
        const evWeekday = getWeekdayOfMonth(ev.month, ev.day, year);
        for (let d = 1; d <= daysInMonth; d++) {
          if (new Date(year, monthIdx, d).getDay() === evWeekday) {
            const list = map.get(d) || [];
            list.push(ev);
            map.set(d, list);
          }
        }
      } else {
        let startDay = ev.day;
        let endDay = ev.end_day || ev.day;

        const evStartMonthIdx = REAL_MONTH_NAMES.indexOf(ev.month);
        const evEndMonthIdx = REAL_MONTH_NAMES.indexOf(ev.end_month || ev.month);

        if (evStartMonthIdx !== monthIdx && evEndMonthIdx !== monthIdx) continue;

        if (evStartMonthIdx === monthIdx && evEndMonthIdx === monthIdx) {
          // same month
        } else if (evStartMonthIdx === monthIdx) {
          endDay = daysInMonth;
        } else if (evEndMonthIdx === monthIdx) {
          startDay = 1;
        } else {
          startDay = 1;
          endDay = daysInMonth;
        }

        for (let d = startDay; d <= endDay && d <= daysInMonth; d++) {
          if (d < 1) continue;
          const list = map.get(d) || [];
          list.push(ev);
          map.set(d, list);
        }
      }
    }
    return map;
  }, [filteredEvents, currentMonth.name, currentMonth.cycle]);

  const nextMonth = () => { setMonthDirection(1); setMonthIndex(i => Math.min(months.length - 1, i + 1)); };
  const prevMonth = () => { setMonthDirection(-1); setMonthIndex(i => Math.max(0, i - 1)); };

  useEscapeKey(() => setSelectedEvent(null), !!selectedEvent);
  const modalRef = useFocusTrap(!!selectedEvent);

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header do Calendário */}
      <div className="glass rounded-2xl p-8 sm:p-10 border border-[var(--color-outline)]/50 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="type-label text-[var(--color-primary)] flex items-center gap-1.5 justify-center md:justify-start">
            <Sparkles className="w-3.5 h-3.5" /> Cronograma de Aulas e Batalhas
          </span>
          <h1 className="type-display text-[var(--color-on-surface)]">
            Calendário — {currentMonth.name} {currentMonth.cycle}
          </h1>
          <p className="type-body text-[var(--color-on-surface-variant)]">
            Acompanhe as Learning Parties, Exames de Combate e Rituais Acadêmicos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--color-surface-alt)] p-1.5 rounded-xl border border-[var(--color-outline)] shrink-0">
        <button
          onClick={prevMonth}
          disabled={monthIndex === 0}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Mês anterior"
        >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-display font-bold text-sm px-3 min-w-[100px] text-center text-[var(--color-on-surface)]">
            {currentMonth.name}
          </span>

        <button
          onClick={nextMonth}
          disabled={monthIndex === months.length - 1}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Próximo mês"
        >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtro de Tipos de Atividade */}
      <div className="flex flex-wrap items-center gap-2 glass p-4 rounded-2xl border border-[var(--color-outline)]/50">
        <span className="type-label text-[var(--color-on-surface-variant)] mr-1">
          Disciplinas:
        </span>

        <button
          onClick={() => setSelectedType('all')}
          aria-pressed={selectedType === 'all'}
          className={`px-3 py-1.5 rounded-xl type-label normal-case transition-all ${
            selectedType === 'all'
              ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
              : 'bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
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
              aria-pressed={selectedType === t.key}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl type-label normal-case transition-all ${
                selectedType === t.key
                  ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20'
                  : 'bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
              <IconComp className="w-3 h-3" />
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grade do Calendário */}
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-96 bg-[var(--color-surface)] rounded-2xl shimmer"
          />
        ) : monthEvents.length === 0 ? (
          <EmptyCalendarState />
        ) : filteredEvents.length === 0 ? (
          <motion.div
            key="no-events"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center py-16 glass rounded-2xl p-8 border border-[var(--color-outline)]/50"
          >
            <Calendar className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-3 opacity-30" />
            <h3 className="font-display font-bold text-base text-[var(--color-on-surface)]">Nenhum evento nesta disciplina</h3>
            <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Selecione "Todas" ou outro tipo para ver mais eventos.</p>
          </motion.div>
        ) : (
          <motion.div
            key={`month-${monthIndex}`}
            initial={{ opacity: 0, x: monthDirection * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: monthDirection * -24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-2xl p-4 sm:p-6 border border-[var(--color-outline)]/50"
          >
          
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center type-label text-[var(--color-on-surface-variant)]">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="py-2 bg-[var(--color-surface-alt)] rounded-lg">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {currentMonth.prevMonthDays.map(pDay => (
              <div
                key={`prev-${pDay}`}
                className="min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] p-2 bg-[var(--color-surface-alt)]/50 rounded-xl opacity-30 border border-transparent select-none"
              >
                <span className="type-caption font-bold text-[var(--color-on-surface-variant)]">{pDay}</span>
              </div>
            ))}

            {Array.from({ length: currentMonth.daysCount }, (_, i) => i + 1).map(day => {
              const dayEvs = eventsByDay.get(day) || [];
              const isToday =
                TODAY.getFullYear() === Number(currentMonth.cycle) &&
                TODAY.getMonth() === REAL_MONTH_NAMES.indexOf(currentMonth.name) &&
                TODAY.getDate() === day;

              return (
                <div
                  key={day}
                  className={`min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'border-[var(--color-tertiary)] bg-[var(--color-tertiary)]/5 shadow-md shadow-[var(--color-tertiary)]/10'
                      : 'border-[var(--color-outline)]/30 bg-[var(--color-surface-alt)]/30 hover:border-[var(--color-primary)]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`type-caption font-bold ${isToday ? 'text-[var(--color-tertiary)] font-black' : 'text-[var(--color-on-surface-variant)]'}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="type-caption uppercase font-black px-1 py-0.5 rounded bg-[var(--color-tertiary)] text-white">
                        Hoje
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 mt-1">
                    {dayEvs.map(ev => {
                      const tInfo = typeMap.get(ev.type);
                      return (
                        <button
                          key={ev.id}
                          onClick={() => { setEventImgError(false); setSelectedEvent(ev); }}
                          className="w-full text-left py-1.5 px-1.5 rounded-lg text-white type-caption font-medium truncate flex items-center gap-1 transition-transform hover:scale-[1.02]"
                          style={{ backgroundColor: tInfo?.color || 'var(--color-primary)' }}
                        >
                          {ev.is_recurring && <RefreshCw className="w-2.5 h-2.5 shrink-0 opacity-80" />}
                          <span className="truncate flex-1">{ev.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Detalhes do Evento */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            key="event-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-background)]/80 backdrop-blur-sm"
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
              ref={modalRef}
              className="glass rounded-2xl max-w-lg w-full overflow-hidden border border-[var(--color-outline)]/80 shadow-2xl space-y-4"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {selectedEvent.image && !eventImgError && (
                <div className="h-56 bg-[var(--color-surface)] relative">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-contain"
                    onError={() => setEventImgError(true)}
                  />
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--color-background)]/60 backdrop-blur-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
                    aria-label="Fechar detalhes do evento"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!selectedEvent.image || eventImgError && (
                <div className="h-16 bg-[var(--color-surface)] relative">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--color-background)]/60 backdrop-blur-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
                    aria-label="Fechar detalhes do evento"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="p-6 pt-4 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="type-label px-2.5 py-1 rounded-lg border text-white"
                    style={{ backgroundColor: typeMap.get(selectedEvent.type)?.color || 'var(--color-primary)', borderColor: 'rgba(255,255,255,0.25)' }}
                  >
                    {selectedEvent.month} • Dia {selectedEvent.day}
                  </span>
                  {selectedEvent.is_recurring && (
                    <span className="inline-flex items-center gap-1 type-caption px-2.5 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 w-fit">
                      <RefreshCw className="w-3 h-3" />
                      Evento fixo — toda semana
                    </span>
                  )}
                  {selectedEvent.end_day && (
                    <span className="inline-flex items-center gap-1 type-caption px-2.5 py-1 rounded-lg bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border border-[var(--color-secondary)]/20 w-fit">
                      <Calendar className="w-3 h-3" />
                      Até {selectedEvent.end_day} de {selectedEvent.end_month || selectedEvent.month}
                    </span>
                  )}
                </div>

                <h2 className="type-title text-[var(--color-on-surface)]">
                  {selectedEvent.title}
                </h2>

                <div className="flex items-center gap-3 type-body text-[var(--color-on-surface-variant)]">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    {selectedEvent.time}
                  </span>
                  {selectedEvent.instructor && (
                    <span>• Professor: <strong>{selectedEvent.instructor}</strong></span>
                  )}
                </div>

                {selectedEvent.description && (
                  <p className="type-body text-[var(--color-on-surface-variant)] bg-[var(--color-surface-alt)] p-4 rounded-xl border border-[var(--color-outline)]/30">
                    {selectedEvent.description}
                  </p>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white type-body font-bold hover:bg-[var(--color-primary-deep)] transition-all hover:shadow-md hover:shadow-[var(--color-primary)]/20"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
};
