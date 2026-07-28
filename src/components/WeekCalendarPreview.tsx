import React, { useState, useEffect, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronRight, Clock, Wand2, Swords, FlaskConical, BookOpen, Sparkles, Eye, Moon, Star, Layers, RefreshCw } from 'lucide-react';
import { MagicalEvent, EventTypeItem } from '../types';
import { apiGet } from '../lib/api';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Wand2, Swords, FlaskConical, BookOpen, Sparkles, Eye, Moon, Star, Layers,
};

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function getWeekdayOfMonth(monthName: string, day: number, year: number): number {
  const monthIdx = MONTH_NAMES.indexOf(monthName);
  if (monthIdx === -1) return 0;
  return new Date(year, monthIdx, day).getDay();
}

function getWeekRange(date: Date): { start: Date; end: Date; days: Date[] } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
  return { start, end, days };
}

function formatDateShort(d: Date): string {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3)}`;
}

export const WeekCalendarPreview: React.FC = memo(() => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<MagicalEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const { start, end, days } = useMemo(() => getWeekRange(today), []);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
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
        console.error('Erro ao carregar eventos:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => { cancelled = true; };
  }, []);

  const typeMap = useMemo(() => {
    const map = new Map<string, { label: string; color: string; icon: string }>();
    for (const t of eventTypes) {
      map.set(t.key, { label: t.label, color: t.color, icon: t.icon });
    }
    return map;
  }, [eventTypes]);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, MagicalEvent[]>();
    const year = today.getFullYear();

    for (const ev of events) {
      if (ev.is_recurring) {
        const evWeekday = getWeekdayOfMonth(ev.month, ev.day, year);
        for (let i = 0; i < 7; i++) {
          const dayDate = days[i];
          if (dayDate.getDay() === evWeekday) {
            const list = map.get(i) || [];
            list.push(ev);
            list.sort((a, b) => a.time.localeCompare(b.time));
            map.set(i, list);
          }
        }
      } else {
        const evStartMonthIdx = MONTH_NAMES.indexOf(ev.month);
        const evEndMonthIdx = MONTH_NAMES.indexOf(ev.end_month || ev.month);
        if (evStartMonthIdx === -1 || evEndMonthIdx === -1) continue;

        for (let i = 0; i < 7; i++) {
          const dayDate = days[i];
          const dayMonthIdx = dayDate.getMonth();
          const dayNum = dayDate.getDate();

          let matches = false;
          if (dayMonthIdx === evStartMonthIdx && dayMonthIdx === evEndMonthIdx) {
            matches = dayNum >= ev.day && dayNum <= (ev.end_day || ev.day);
          } else if (dayMonthIdx === evStartMonthIdx) {
            matches = dayNum >= ev.day;
          } else if (dayMonthIdx === evEndMonthIdx) {
            matches = dayNum <= (ev.end_day || 31);
          } else if (dayMonthIdx > evStartMonthIdx && dayMonthIdx < evEndMonthIdx) {
            matches = true;
          }

          if (matches) {
            const list = map.get(i) || [];
            list.push(ev);
            list.sort((a, b) => a.time.localeCompare(b.time));
            map.set(i, list);
          }
        }
      }
    }
    return map;
  }, [events, days, today]);

  const totalEvents = useMemo(() => {
    let count = 0;
    eventsByDay.forEach(list => { count += list.length; });
    return count;
  }, [eventsByDay]);

  return (
    <div className="glass rounded-2xl border border-[var(--color-outline)]/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--color-outline)]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[var(--color-on-surface)]">
              Eventos da Semana
            </h3>
            <p className="text-[10px] text-[var(--color-on-surface-variant)]">
              {formatDateShort(start)} — {formatDateShort(end)}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/calendario')}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
        >
          Ver tudo
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Week Grid */}
      {loading ? (
        <div className="p-5 space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-16 bg-[var(--color-surface-alt)] rounded-xl shimmer" />
          ))}
        </div>
      ) : totalEvents === 0 ? (
        <div className="px-5 py-10 text-center">
          <Calendar className="w-8 h-8 text-[var(--color-on-surface-variant)] mx-auto mb-2 opacity-30" />
          <p className="text-xs text-[var(--color-on-surface-variant)]">Nenhum evento esta semana</p>
          <p className="text-[10px] text-[var(--color-on-surface-variant)] mt-1 opacity-70">
            Confira o calendário completo
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--color-outline)]/20">
          {days.map((day, idx) => {
            const dayEvents = eventsByDay.get(idx) || [];
            const isToday =
              day.getDate() === today.getDate() &&
              day.getMonth() === today.getMonth() &&
              day.getFullYear() === today.getFullYear();

            return (
              <div
                key={idx}
                className={`px-5 py-3 flex items-start gap-3 transition-colors ${
                  isToday ? 'bg-[var(--color-primary)]/5 today-glow' : 'hover:bg-[var(--color-surface-alt)]/30'
                }`}
              >
                {/* Day Label */}
                <div className={`shrink-0 w-10 text-center pt-0.5 ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                  <span className={`text-[10px] font-bold uppercase block ${isToday ? 'text-[var(--color-primary)]' : ''}`}>
                    {DAY_NAMES[idx]}
                  </span>
                  <span className={`text-lg font-display font-bold leading-none block ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]'}`}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Events or Empty */}
                <div className="flex-1 min-w-0 space-y-1">
                  {dayEvents.length === 0 ? (
                    <span className="text-[10px] text-[var(--color-on-surface-variant)] opacity-40 italic block py-2">
                      —
                    </span>
                  ) : (
                    dayEvents.map(ev => {
                      const tInfo = typeMap.get(ev.type);
                      const IconComp = tInfo ? (ICON_MAP[tInfo.icon] || Layers) : Layers;
                      return (
                        <div
                          key={ev.id}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--color-surface-alt)]/80 border border-[var(--color-outline)]/30 hover:border-[var(--color-primary)]/30 transition-all cursor-default"
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: tInfo?.color || 'var(--color-primary)' }}
                          />
                          <IconComp
                            className="w-3 h-3 shrink-0"
                            style={{ color: tInfo?.color || 'var(--color-primary)' }}
                          />
                          <span className="text-[11px] text-[var(--color-on-surface)] font-medium truncate flex-1">
                            {ev.title}
                          </span>
                          {ev.is_recurring && <RefreshCw className="w-2.5 h-2.5 shrink-0 opacity-50" />}
                          <span className="flex items-center gap-1 text-[10px] text-[var(--color-on-surface-variant)] shrink-0">
                            <Clock className="w-2.5 h-2.5" />
                            {ev.time}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Summary */}
      {totalEvents > 0 && (
        <div className="px-5 py-3 border-t border-[var(--color-outline)]/30 bg-[var(--color-surface-alt)]/20">
          <p className="text-[10px] text-[var(--color-on-surface-variant)] text-center">
            <strong className="text-[var(--color-primary)]">{totalEvents}</strong> evento{totalEvents > 1 ? 's' : ''} esta semana
          </p>
        </div>
      )}
    </div>
  );
});

WeekCalendarPreview.displayName = 'WeekCalendarPreview';
