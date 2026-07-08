import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  motion,
  AnimatePresence
} from 'motion/react';
import {
  BookOpen,
  Sparkles,
  Layers,
  Wand2,
  Swords,
  FlaskConical,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Clock,
  AlertCircle,
  ShieldCheck,
  Shield,
  Flame,
  Eye,
  Moon,
  Star,
  Menu,
} from 'lucide-react';
import { MagicalEvent, MonthData, EventType, EventTypeItem } from './types';
import { apiGet } from './lib/api';
import { useHashRoute } from './hashRouter';
import { useAuth } from './hooks/useAuth';
import LoginGate from './components/LoginGate';
import AdminPanel from './components/AdminPanel';
import bgImage from './assets/id.png';
import logoImage from './assets/logo.png';

// Mapeamento de nomes de icones Lucide → componentes
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Wand2, Swords, FlaskConical, BookOpen, Sparkles,
  Shield, Flame, Eye, Moon, Star, Layers,
};

function resolveIcon(name: string): React.ComponentType<any> {
  return ICON_MAP[name] || Layers;
}

function safeImageUrl(url?: string): string {
  if (!url) return '';
  const t = url.trim();
  if (!t || t.startsWith('javascript:') || t.startsWith('data:') || t.startsWith('vbscript:')) return '';
  try {
    const u = new URL(t);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
  } catch {
    return '';
  }
  return t;
}

const REAL_MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function buildRealMonths(startYear: number, startMonth: number, count = 3): MonthData[] {
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
const DEFAULT_MONTHS: MonthData[] = buildRealMonths(TODAY.getFullYear(), TODAY.getMonth(), 12);

const PROPHECIES = [
  "Os ventos de mana estão altamente favoráveis para poções hoje. +15% de eficiência na destilação elemental de fogo.",
  "Alerta do Sanctum: Um duende de mana fugitivo foi avistado perto dos jardins de Lavanda Mística. Mantenham os grimórios fechados.",
  "Amanhã as estrelas se alinharão com o Cristal Primordial. Período recomendado para meditação mística silenciosa.",
  "Estudantes de Alquimia: Favor não misturar lágrimas de fênix com essência de sombra na ausência de supervisão oficial.",
  "A barreira do Hall of the Novice EX passará por recalibração rúnica às 18:00. Pequenas oscilações gravitacionais são normais."
];

export default function App() {
  const [route, navigate] = useHashRoute();
  const auth = useAuth();

  const [events, setEvents] = useState<MagicalEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const data = await apiGet<MagicalEvent[]>('/api/events');
      setEvents(data);
    } catch (err: any) {
      setEventsError(err?.message || 'Falha ao carregar eventos.');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);

  const fetchEventTypes = useCallback(async () => {
    try {
      const data = await apiGet<EventTypeItem[]>('/api/event-types');
      setEventTypes(data);
    } catch {
      // mantem vazio se falhar
    }
  }, []);

  useEffect(() => {
    void fetchEventTypes();
  }, [fetchEventTypes]);

  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const currentMonth = DEFAULT_MONTHS[currentMonthIdx];
  const [selectedDay, setSelectedDay] = useState<number>(TODAY.getDate());
  const [activeFilter, setActiveFilter] = useState<'all' | EventType>('all');

  const [prophecy, setProphecy] = useState(PROPHECIES[0]);
  const [showProphecyToast, setShowProphecyToast] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [sidebarOpen]);

  const prevMonth = () => {
    setCurrentMonthIdx(prev => (prev === 0 ? DEFAULT_MONTHS.length - 1 : prev - 1));
    setSelectedDay(1);
  };

  const nextMonth = () => {
    setCurrentMonthIdx(prev => (prev === DEFAULT_MONTHS.length - 1 ? 0 : prev + 1));
    setSelectedDay(1);
  };

  const triggerProphecy = () => {
    const random = PROPHECIES[Math.floor(Math.random() * PROPHECIES.length)];
    setProphecy(random);
    setShowProphecyToast(true);
    setTimeout(() => setShowProphecyToast(false), 6000);
  };

  const getDayEvents = (dayNum: number, monthName: string) => {
    return events.filter(e => {
      if (e.month !== monthName || e.day !== dayNum) return false;
      if (activeFilter === 'all') return true;
      return e.type === activeFilter;
    });
  };

  const getAllDayEvents = (dayNum: number, monthName: string) => {
    return events.filter(e => e.month === monthName && e.day === dayNum);
  };

  const isDayHighlightedByFilter = (dayNum: number, monthName: string) => {
    if (activeFilter === 'all') return true;
    const dayEvents = events.filter(e => e.month === monthName && e.day === dayNum);
    if (dayEvents.length === 0) return false;
    return dayEvents.some(e => e.type === activeFilter);
  };

  const selectedDayEvents = getDayEvents(selectedDay, currentMonth.name);

  const currentMonthEvents = useMemo(
    () => events.filter(e => e.month === currentMonth.name),
    [events, currentMonth.name]
  );

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: currentMonthEvents.length };
    for (const et of eventTypes) {
      counts[et.key] = currentMonthEvents.filter(e => e.type === et.key).length;
    }
    return counts;
  }, [currentMonthEvents, eventTypes]);

  const daysInGrid: { dayNum: number; isCurrent: boolean; isPrev?: boolean; isNext?: boolean }[] = [];
  currentMonth.prevMonthDays.forEach(d => {
    daysInGrid.push({ dayNum: d, isCurrent: false, isPrev: true });
  });
  for (let i = 1; i <= currentMonth.daysCount; i++) {
    daysInGrid.push({ dayNum: i, isCurrent: true, isPrev: false });
  }
  const totalInGrid = daysInGrid.length;
  const targetCells = totalInGrid <= 35 ? 35 : 42;
  const nextMonthPadding = targetCells - totalInGrid;
  for (let i = 1; i <= nextMonthPadding; i++) {
    daysInGrid.push({ dayNum: i, isCurrent: false, isNext: true });
  }

  // --- Admin route ---
  if (route === 'admin') {
    if (auth.loading) {
      return (
        <div className="min-h-screen bg-[#fcf9f0] flex items-center justify-center text-[#73777f] text-sm">
          Carregando…
        </div>
      );
    }
    if (!auth.user) {
      return <LoginGate onLogin={(u, p) => auth.login(u, p)} />;
    }
    return <AdminPanel user={auth.user} onLogout={() => auth.logout()} />;
  }

  // --- Public calendar route ---
  return (
    <div className="bg-[#FAF6ED] text-[#3E4A56] font-sans min-h-screen flex flex-col selection:bg-[#D4AF37] selection:text-[#124949] overflow-x-hidden antialiased" style={{ overscrollBehavior: 'none' }}>

      {/* Skip to content */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* Prophecy Toast */}
      <div aria-live="polite" aria-atomic="true" className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <AnimatePresence>
          {showProphecyToast && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-[#124949] text-[#E8F4F4] border-2 border-[#1D6A6A] shadow-2xl py-3 px-6 rounded-2xl max-w-lg flex items-center gap-3 crystal-glow pointer-events-auto"
              role="status"
            >
              <Sparkles className="w-6 h-6 text-[#D4AF37] shrink-0 animate-pulse" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-caps uppercase tracking-widest text-[#D4AF37]">Pergaminho de Notificação Mística</p>
                <p className="text-sm font-medium text-white">{prophecy}</p>
              </div>
              <button
                onClick={() => setShowProphecyToast(false)}
                className="text-[#E8F4F4] hover:text-white ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile sidebar overlay */}
      <div
        className="sidebar-overlay lg:hidden"
        data-open={sidebarOpen}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <main className="flex-1 flex flex-col lg:flex-row h-auto lg:h-screen overflow-hidden">

        {/* Left Sidebar */}
        <aside
          ref={sidebarRef}
          className="mobile-sidebar lg:relative lg:transform-none lg:translate-x-0 w-full lg:w-56 xl:w-64 bg-[#F6F3EA] border-b lg:border-b-0 lg:border-r border-[rgba(29,106,106,0.1)] py-4 lg:py-6 flex flex-col gap-4 lg:gap-6 shrink-0 overflow-y-auto"
          data-open={sidebarOpen}
          aria-label="Barra lateral de navegação"
        >
          <div className="px-6">
            <div className="flex items-center gap-3 mb-6 bg-[#FAF6ED] p-3 rounded-2xl border border-[#D4AF37]/10 parchment-texture">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center border border-[#124949] shrink-0">
                <BookOpen className="w-5 h-5 text-[#124949]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-caps text-[#735C00] uppercase tracking-wider">Archmage Calendar</p>
                <p className="text-sm font-bold text-[#124949] truncate">Novice Ledger</p>
              </div>
            </div>

            <a
              href="#/admin"
              className="w-full bg-[#1D6A6A] py-3 rounded-xl text-white font-caps text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-[#E8F4F4]/20 no-underline"
              onClick={() => setSidebarOpen(false)}
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" aria-hidden="true" />
              Painel Admin
            </a>
          </div>

          {/* Filters */}
          <nav className="flex-1 px-3 space-y-1" aria-label="Filtros de disciplina">
            <p className="text-[9px] font-caps uppercase tracking-widest text-[#6B7A8A] px-3 mb-2">Filtros de Disciplina</p>

            <button
              onClick={() => { setActiveFilter('all'); setSidebarOpen(false); }}
              aria-pressed={activeFilter === 'all'}
              className={`filter-btn w-full text-left rounded-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${activeFilter === 'all'
                ? 'bg-[#D4AF37] text-[#124949] font-bold shadow-sm'
                : 'text-[#6B7A8A] hover:bg-[#E8F4F4]'
                }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm">Todos Registros</span>
              </div>
              <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full font-mono text-[10px]" aria-label={`${filterCounts.all} eventos`}>
                {filterCounts.all}
              </span>
            </button>

            {eventTypes.map(et => {
              const IconComp = resolveIcon(et.icon);
              return (
                <button
                  key={et.key}
                  onClick={() => { setActiveFilter(et.key); setSidebarOpen(false); }}
                  aria-pressed={activeFilter === et.key}
                  className={`filter-btn w-full text-left rounded-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${activeFilter === et.key
                    ? 'bg-[#D4AF37] text-[#124949] font-bold shadow-sm'
                    : 'text-[#6B7A8A] hover:bg-[#E8F4F4]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-4 h-4" style={{ color: et.color }} aria-hidden="true" />
                    <span className="text-sm">{et.label}</span>
                  </div>
                  <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full font-mono text-[10px]" aria-label={`${filterCounts[et.key] || 0} eventos`}>
                    {filterCounts[et.key] || 0}
                  </span>
                </button>
              );
            })}
          </nav>

          {activeFilter !== 'all' && (
            <div className="mx-4 p-3 bg-[#E8F4F4] rounded-xl border border-[#1D6A6A]/10 text-xs parchment-texture" role="status">
              <span className="font-caps text-[10px] text-[#735C00] block uppercase mb-1">Filtro Ativo</span>
              <p className="text-[#3E4A56]">O calendário agora destaca apenas eventos da disciplina <strong className="capitalize text-[#124949]">{eventTypes.find(e => e.key === activeFilter)?.label || activeFilter}</strong>.</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-2 text-[#735C00] hover:underline font-semibold flex items-center gap-1 cursor-pointer text-[11px]"
                aria-label="Limpar filtro ativo"
              >
                Limpar filtro ×
              </button>
            </div>
          )}

          <div className="mt-auto px-3 space-y-1 pt-4 border-t border-[rgba(29,106,106,0.1)]/30">
            <button
              onClick={triggerProphecy}
              className="w-full text-left text-[#6B7A8A] hover:bg-[#E8F4F4] rounded-full px-4 py-2 flex items-center gap-3 cursor-pointer text-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#735C00]" aria-hidden="true" />
              Profecia do Dia
            </button>
            <button
              disabled
              className="w-full text-left text-[#6B7A8A]/50 rounded-full px-4 py-2 flex items-center gap-3 text-xs cursor-not-allowed"
              title="Em breve"
            >
              <Settings className="w-4 h-4 text-[#6B7A8A]/50" aria-hidden="true" />
              Configurações
            </button>
            <button
              disabled
              className="w-full text-left text-[#6B7A8A]/50 rounded-full px-4 py-2 flex items-center gap-3 text-xs cursor-not-allowed"
              title="Em breve"
            >
              <HelpCircle className="w-4 h-4 text-[#6B7A8A]/50" aria-hidden="true" />
              Ajuda
            </button>
          </div>
        </aside>

        {/* Calendar Panel */}
        <section
          id="main-content"
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 xl:p-8 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(252, 249, 240, 0.82), rgba(252, 249, 240, 0.82)), url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll'
          }}
        >
          {/* Mobile header bar */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="hamburger"
              aria-label="Abrir menu de navegação"
              aria-expanded={sidebarOpen}
              aria-controls="sidebar-nav"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <img src={logoImage} alt="Logo HoN EX" className="h-8 w-auto shrink-0 drop-shadow" loading="lazy" />
              <h1 className="text-lg font-cinzel text-[#1D6A6A] font-bold tracking-tight truncate">Calendário</h1>
            </div>
          </div>

          <div className="mb-4 md:mb-6 flex flex-wrap gap-3 justify-between items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <img src={logoImage} alt="Logo HoN EX" className="h-10 sm:h-12 md:h-14 w-auto shrink-0 drop-shadow hidden lg:block" loading="lazy" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-cinzel text-[#1D6A6A] font-bold tracking-tight">Calendario Hall of the Novice EX</h2>
                {activeFilter !== 'all' && (
                  <span className="bg-[#D4AF37] text-[#124949] text-[10px] font-caps px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider animate-pulse border border-[#735C00]/20" role="status">
                    Filtro: {eventTypes.find(e => e.key === activeFilter)?.label || activeFilter}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B7A8A] font-sans mt-1">
                <span className="font-semibold text-[#735C00]">{currentMonth.name} {currentMonth.cycle}</span>
                {' — '}Selecione um dia para ver os eventos.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0" role="group" aria-label="Navegação entre meses">
              <button onClick={prevMonth} title="Mês Anterior" aria-label="Mês anterior" className="p-2 border border-[rgba(29,106,106,0.15)] rounded-lg hover:bg-[#E8F4F4] transition-colors cursor-pointer text-[#6B7A8A]">
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <span className="text-sm font-serif text-[#735C00] font-semibold hidden sm:block min-w-[100px] text-center" aria-live="polite">
                {currentMonth.name}
              </span>
              <button onClick={nextMonth} title="Próximo Mês" aria-label="Próximo mês" className="p-2 border border-[rgba(29,106,106,0.15)] rounded-lg hover:bg-[#E8F4F4] transition-colors cursor-pointer text-[#6B7A8A]">
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {eventsError && (
            <div className="mb-4 text-xs text-[#ba1a1a] bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg px-4 py-3">
              {eventsError}
              <button onClick={() => void fetchEvents()} className="ml-2 underline">tentar novamente</button>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 xl:gap-4 select-none" role="grid" aria-label="Calendário de eventos">
            {['Do', 'Se', 'Te', 'Qa', 'Qi', 'Sa', 'Su'].map((day, i) => (
              <div key={i} className="text-center font-caps text-[9px] sm:text-[11px] md:text-xs text-[#6B7A8A] pb-1 md:pb-2 uppercase tracking-widest font-semibold border-b border-[rgba(29,106,106,0.1)]/30" role="columnheader" aria-label={['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][i]}>
                <span className="hidden sm:inline">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i]}</span>
                <span className="sm:hidden">{day}</span>
              </div>
            ))}

            {daysInGrid.map((cell, idx) => {
              const { dayNum, isCurrent, isPrev, isNext } = cell;
              const dayEvents = getDayEvents(dayNum, currentMonth.name);
              const hasEvents = dayEvents.length > 0;
              const hasCrystal = dayEvents.some(e => e.crystal);
              const firstEventImage = dayEvents.find(e => e.image)?.image;
              const isSelected = isCurrent && selectedDay === dayNum;

              if (!isCurrent) {
                return (
                  <div
                  key={`p-${idx}`}
                  className="h-20 sm:h-28 md:h-32 xl:h-36 rounded-lg md:rounded-xl bg-[#F6F3EA]/40 opacity-40 border border-[rgba(29,106,106,0.1)]/30 p-1 sm:p-2 relative flex flex-col justify-between"
                  aria-hidden="true"
                >
                    <span className="font-serif text-sm sm:text-lg text-[#6B7A8A]">{dayNum}</span>
                    <span className="text-[7px] sm:text-[8px] font-caps text-[#6B7A8A]/60 text-right hidden sm:block">
                      {isPrev ? 'anterior' : 'próximo'}
                    </span>
                  </div>
                );
              }

              const allDayEventsForIndicators = getAllDayEvents(dayNum, currentMonth.name);
              const matchesFilter = isDayHighlightedByFilter(dayNum, currentMonth.name);

              return (
                <div
                  key={`c-${dayNum}`}
                  onClick={() => setSelectedDay(dayNum)}
                  role="gridcell"
                  tabIndex={0}
                  aria-label={`${dayNum} de ${currentMonth.name}${hasEvents ? `, ${dayEvents.length} evento${dayEvents.length > 1 ? 's' : ''}` : ''}${isSelected ? ', selecionado' : ''}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDay(dayNum); } }}
                  className={`calendar-cell h-20 sm:h-28 md:h-32 xl:h-36 rounded-lg md:rounded-xl relative filigree-corner parchment-texture transition-all cursor-pointer flex flex-col justify-between p-1.5 sm:p-2 md:p-3 overflow-hidden group border ${isSelected
                    ? 'bg-[#D4AF37] border-2 border-[#124949] shadow-inner today-pulse scale-[1.01]'
                    : 'bg-[#FAF6ED] border-[#1D6A6A]/20 hover:-translate-y-1 hover:border-[#1D6A6A]/60 hover:shadow-md'
                    } ${!matchesFilter && activeFilter !== 'all' ? 'opacity-30' : 'opacity-100'
                    }`}
                >
                  <div className="absolute inset-0 bg-transparent pointer-events-none rounded-xl" />

                  <div className="flex justify-between items-start z-10">
                    <span className={`font-serif text-base sm:text-xl md:text-2xl font-bold ${isSelected ? 'text-[#124949]' : 'text-[#735C00]'}`}>
                      {dayNum < 10 ? `0${dayNum}` : dayNum}
                    </span>

                    {dayNum === TODAY.getDate() && currentMonthIdx === 0 && (
                      <span className={`text-[7px] sm:text-[8px] font-caps px-1 sm:px-1.5 py-0.5 rounded border leading-none uppercase font-bold tracking-widest ${isSelected
                        ? 'bg-[#124949] text-[#D4AF37] border-[#D4AF37]/20'
                        : 'bg-[#735C00] text-white border-transparent'
                        }`}>
                        Hoje
                      </span>
                    )}

                    {hasCrystal && matchesFilter && (
                      <div className="floating-crystal transform scale-90 md:scale-100">
                        <svg fill="none" height="20" viewBox="0 0 16 24" width="14" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 0L16 12L8 24L0 12L8 0Z" fill="#abc8f5" fillOpacity="0.8"></path>
                          <path d="M8 4L12 12L8 20L4 12L8 4Z" fill="white" fillOpacity="0.4"></path>
                        </svg>
                      </div>
                    )}
                  </div>

                  {allDayEventsForIndicators.length > 0 && (
                    <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 flex gap-1 z-10">
                      {allDayEventsForIndicators.map((e, index) => {
                        const typeDef = eventTypes.find(t => t.key === e.type);
                        const dotBg = typeDef ? typeDef.color : '#1a3a5f';
                        return (
                          <div
                            key={e.id || index}
                            className="w-1.5 h-1.5 rounded-full crystal-glow animate-pulse"
                            style={{ backgroundColor: dotBg }}
                          />
                        );
                      })}
                    </div>
                  )}

                  {firstEventImage && matchesFilter ? (
                    <div className="mt-1 sm:mt-2 w-full h-10 sm:h-14 md:h-16 rounded-md md:rounded-lg overflow-hidden border border-[rgba(29,106,106,0.15)]/50 relative z-10 group-hover:scale-[1.03] transition-transform">
                      <img className="w-full h-full object-cover" src={safeImageUrl(firstEventImage)} alt={`Imagem do evento: ${dayEvents[0]?.title || ''}`} referrerPolicy="no-referrer" loading="lazy" />
                    </div>
                  ) : (
                    <div className="mt-2 sm:mt-4 flex flex-col justify-end text-right">
                      {hasEvents ? (
                        <span className="text-[8px] sm:text-[9px] font-semibold font-sans italic text-[#735C00] opacity-80 truncate">
                          {dayEvents.length} {dayEvents.length === 1 ? 'Ativ.' : 'Ativ.'}
                        </span>
                      ) : (
                        <span className="text-[7px] sm:text-[8px] font-caps text-[#6B7A8A]/40 uppercase tracking-widest group-hover:text-[#735C00]/50 transition-colors hidden sm:block">
                          Livre
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center gap-3 p-4 bg-[#E8F4F4]/50 rounded-2xl border border-[#1D6A6A]/10 text-xs text-[#3E4A56] parchment-texture" role="note">
            <AlertCircle className="w-5 h-5 text-[#735C00] shrink-0" aria-hidden="true" />
            <p><strong>Segredo Rúnico:</strong> Acesse o <a href="#/admin" className="text-[#1D6A6A] font-semibold hover:underline">Painel Admin</a> para gerenciar as atividades acadêmicas publicadas no calendário.</p>
          </div>
        </section>

        {/* Right Side: Arcane Ledger */}
        <aside className="w-full lg:w-80 xl:w-96 bg-[#F6F3EA] shadow-inner border-t lg:border-t-0 lg:border-l border-[rgba(29,106,106,0.1)] p-4 lg:p-6 overflow-y-auto parchment-texture flex flex-col justify-between relative" aria-label="Painel de eventos do dia">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[rgba(29,106,106,0.1)]/40 pb-4">
              <div>
                <h3 className="text-2xl font-serif text-[#735C00] font-bold">Arcane Ledger</h3>
                <p className="text-[10px] font-caps text-[#6B7A8A] uppercase tracking-wider">Diário de Atividades Místicas</p>
              </div>
              <div className="bg-[#1D6A6A] text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-[#E8F4F4]/20 shrink-0" aria-live="polite">
                Dia {selectedDay < 10 ? `0${selectedDay}` : selectedDay}
              </div>
            </div>

            {eventsLoading ? (
              <div className="text-center py-10 text-[#6B7A8A] text-xs">Carregando eventos…</div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#FAF6ED] border border-[#1D6A6A]/10 rounded-2xl parchment-texture space-y-4">
                <div className="w-12 h-12 bg-[#E8F4F4] rounded-full flex items-center justify-center mx-auto text-[#6B7A8A]">
                  <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-serif text-[#124949] font-semibold text-lg">Tempo de Estudo Livre</h4>
                  <p className="text-xs text-[#6B7A8A] mt-1">Sem rituais oficiais agendados para este dia. Aproveite para praticar na Ala de Duelos ou estudar na Biblioteca.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative timeline-connector" role="list" aria-label={`Eventos do dia ${selectedDay}`}>
                {selectedDayEvents.map((event) => {
                  const typeDef = eventTypes.find(t => t.key === event.type);
                  const EventIcon = resolveIcon(typeDef?.icon || 'Wand2');
                  const typeColor = typeDef ? typeDef.color : '#1D6A6A';

                  return (
                    <div key={event.id} className="relative pl-8 group" role="listitem">
                      <div
                        className="absolute left-0 top-1 w-7 h-7 rounded-full border-2 border-[#1D6A6A] bg-[#FAF6ED] flex items-center z-10 hover:bg-[#D4AF37] transition-colors shadow-sm"
                        style={{ color: typeColor }}
                        aria-hidden="true"
                      >
                        <EventIcon className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center gap-2 pr-6 relative">
                          <span className="text-[10px] font-caps text-[#735C00] font-semibold tracking-widest uppercase flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {event.time}
                          </span>
                          <span
                            className="text-[9px] font-caps px-2 py-0.5 rounded-full border uppercase font-semibold whitespace-nowrap"
                            style={{ color: typeColor, borderColor: typeColor + '40', backgroundColor: typeColor + '15' }}
                          >
                            {typeDef?.label || event.type}
                          </span>
                        </div>

                        <h4 className="text-lg font-serif text-[#124949] leading-snug font-bold">
                          {event.title}
                        </h4>

                        <p className="text-xs text-[#3E4A56] leading-relaxed">
                          {event.description}
                        </p>

                        {event.image && (
                          <div className="rounded-xl overflow-hidden border border-[rgba(29,106,106,0.15)] h-32 relative shadow-sm my-1 group-hover:shadow transition-shadow">
                            <img className="w-full h-full object-cover" src={safeImageUrl(event.image)} alt={event.title} referrerPolicy="no-referrer" loading="lazy" />
                            {event.instructor && (
                              <div className="absolute bottom-0 inset-x-0 bg-[#124949]/75 backdrop-blur-sm px-3 py-1.5 text-[9px] text-white font-caps uppercase tracking-widest flex justify-between">
                                <span>Instrutor: {event.instructor}</span>
                                <span className="text-[#D4AF37]">M MBA</span>
                              </div>
                            )}
                          </div>
                        )}

                        {!event.image && event.instructor && (
                          <div className="text-[10px] font-caps text-[#6B7A8A] uppercase bg-[#E8F4F4]/40 p-2 rounded-lg border border-[rgba(29,106,106,0.15)]/20">
                            <strong>Orientador:</strong> {event.instructor}
                          </div>
                        )}

                        {event.manaProgress && event.manaProgress > 0 && (
                          <div className="mt-1 space-y-1">
                            <div className="flex justify-between text-[9px] font-caps text-[#6B7A8A]">
                              <span>Requisitos de Mana do Estudante</span>
                              <span className="font-mono">{event.manaProgress}% Média</span>
                            </div>
                            <div className="h-2 w-full bg-[#E8F4F4] rounded-full overflow-hidden relative border border-[rgba(29,106,106,0.15)]/30">
                              <div
                                className="h-full bg-[#1D6A6A] rounded-full transition-all duration-1000"
                                style={{ width: `${event.manaProgress}%`, boxShadow: '0 0 8px #1D6A6A' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
