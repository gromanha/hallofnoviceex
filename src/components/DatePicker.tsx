import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface DatePickerProps {
  month: string;
  day: number;
  onChange: (month: string, day: number) => void;
  disabled?: boolean;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  month,
  day,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    const monthIndex = MONTHS_PT.indexOf(month);
    return { month: monthIndex !== -1 ? monthIndex : today.getMonth(), year: today.getFullYear() };
  });
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const monthIndex = MONTHS_PT.indexOf(month);
    if (monthIndex !== -1) {
      setCurrentMonth(prev => ({ ...prev, month: monthIndex }));
    }
  }, [month]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = useCallback((m: number, y: number) => new Date(y, m + 1, 0).getDate(), []);
  const firstDayOfMonth = useCallback((m: number, y: number) => new Date(y, m, 1).getDay(), []);

  const prevMonth = useCallback(() => {
    setCurrentMonth(prev => ({
      month: prev.month === 0 ? 11 : prev.month - 1,
      year: prev.month === 0 ? prev.year - 1 : prev.year,
    }));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentMonth(prev => ({
      month: prev.month === 11 ? 0 : prev.month + 1,
      year: prev.month === 11 ? prev.year + 1 : prev.year,
    }));
  }, []);

  const selectDay = useCallback((d: number) => {
    const monthName = MONTHS_PT[currentMonth.month];
    onChange(monthName, d);
    setIsOpen(false);
  }, [currentMonth.month, onChange]);

  const today = new Date();
  const isCurrentMonth = currentMonth.month === today.getMonth() && currentMonth.year === today.getFullYear();
  const isSelectedMonth = month === MONTHS_PT[currentMonth.month];

  const days: (number | null)[] = [];
  const firstDay = firstDayOfMonth(currentMonth.month, currentMonth.year);
  const totalDays = daysInMonth(currentMonth.month, currentMonth.year);

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);

  const handleToggleOpen = useCallback(() => {
    if (!disabled) setIsOpen(prev => !prev);
  }, [disabled]);

  const handlePrevMonth = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    prevMonth();
  }, [prevMonth]);

  const handleNextMonth = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    nextMonth();
  }, [nextMonth]);

  const handleSelectDay = useCallback((e: React.MouseEvent, d: number) => {
    e.stopPropagation();
    selectDay(d);
  }, [selectDay]);

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleToggleOpen();
  }, [handleToggleOpen]);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  }, []);

  return (
    <div ref={inputRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleInputClick}
        disabled={disabled}
        className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-2 transition-colors"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
          <span className="font-medium text-[var(--color-on-surface)]">
            {month} {day < 10 ? `0${day}` : day}
          </span>
        </div>
        <ChevronRight className={`w-4 h-4 text-[var(--color-on-surface-variant)] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-2 w-64 bg-[var(--color-surface)] border border-[var(--color-outline)]/50 shadow-2xl rounded-xl p-3"
          role="dialog"
          aria-label="Selecione a data"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handlePrevMonth}
              disabled={disabled}
              className="p-1 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] disabled:opacity-30"
              aria-label="Mês anterior"
              type="button"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-sm text-[var(--color-on-surface)]">
              {MONTHS_PT[currentMonth.month]} {currentMonth.year}
            </span>
            <button
              onClick={handleNextMonth}
              disabled={disabled}
              className="p-1 rounded-lg hover:bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)] disabled:opacity-30"
              aria-label="Próximo mês"
              type="button"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS_PT.map(d => (
              <div key={d} className="text-center text-[10px] font-bold uppercase text-[var(--color-on-surface-variant)] py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((d, i) => {
              if (d === null) return <div key={`empty-${i}`} className="h-8" />;
              const isToday = isCurrentMonth && d === today.getDate();
              const isSelected = isSelectedMonth && d === day;
              return (
                <button
                  key={d}
                  onClick={e => handleSelectDay(e, d)}
                  disabled={disabled}
                  className={`h-8 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md'
                      : isToday
                      ? 'bg-[var(--color-tertiary)]/20 text-[var(--color-tertiary)] font-bold border border-[var(--color-tertiary)]/30 hover:bg-[var(--color-tertiary)]/30'
                      : 'text-[var(--color-on-surface)] hover:bg-[var(--color-surface-alt)]'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                  aria-selected={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  type="button"
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};