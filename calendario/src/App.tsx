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
import WelcomeBanner from './components/WelcomeBanner';
import FilterHint from './components/FilterHint';
import EmptyCalendarState from './components/EmptyCalendarState';
import { isFirstVisit, isWelcomeDismissed, isFilterHintDismissed } from './lib/onboarding';
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
    if (u.protocol !== 'https:') return '';
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

const DAY_NAMES_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES_MOBILE = ['Do', 'Se', 'Te', 'Qa', 'Qi', 'Sa', 'Su'];

// Default event type color palette based on design system
const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  spells: { bg: '#E8F4F4', text: '#1D6A6A', border: '#1D6A6A', dot: '#1D6A6A' },
  tactics: { bg: '#F5E6B8', text: '#735C00', border: '#D4AF37', dot: '#D4AF37' },
  alchemy: { bg: '#EDE8F3', text: '#9B8BB4', border: '#9B8BB4', dot: '#9B8BB4' },
  ritual: { bg: '#FFDAD6', text: '#BA1A1A', border: '#BA1A1A', dot: '#BA1A1A' },
  default: { bg: '#E8F4F4', text: '#1D6A6A', border: '#1D6A6A', dot: '#1D6A6A' },
};

function getEventTypeColors(type: string) {
  return EVENT_TYPE_COLORS[type] || EVENT_TYPE_COLORS.default;
}

export default function App() {
  const [route, navigate] = useHashRoute();
  const auth = useAuth();

  const [events, setEvents] = useState<MagicalEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const fetchEvents = useCallback(async (signal?: AbortSignal) => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const data = await apiGet<MagicalEvent[]>('/api/events');
      if (!signal?.aborted) {
        setEvents(data);
      }
    } catch (err: any) {
      if (!signal?.aborted) {
        setEventsError(err?.message || 'Falha ao carregar eventos.');
      }
    } finally {
      if (!signal?.aborted) {
        setEventsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchEvents(controller.signal);
    return () => controller.abort();
  }, [fetchEvents]);

  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);

  const fetchEventTypes = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await apiGet<EventTypeItem[]>('/api/event-types');
      if (!signal?.aborted) {
        setEventTypes(data);
      }
    } catch {
      // mantem vazio se falhar
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchEventTypes(controller.signal);
    return () => controller.abort();
  }, [fetchEventTypes]);

  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const currentMonth = DEFAULT_MONTHS[currentMonthIdx];
  const [selectedDay, setSelectedDay] = useState<number>(TODAY.getDate());
  const [activeFilter, setActiveFilter] = useState<'all' | EventType>('all');

  const [prophecy, setProphecy] = useState(PROPHECIES[0]);
  const [showProphecyToast, setShowProphecyToast] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const calendarSectionRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Onboarding state
  const [showWelcome, setShowWelcome] = useState(() => !isWelcomeDismissed());
  const [showFilterHint, setShowFilterHint] = useState(() => !isFilterHintDismissed());

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on Escape and manage focus trap
  useEffect(() => {
    if (!sidebarOpen) return;
    
    // Store the element that opened the sidebar for focus restoration
    previousFocusRef.current = document.activeElement as HTMLElement;
    
    // Focus the sidebar
    if (sidebarRef.current) {
      sidebarRef.current.focus();
    }
    
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        return;
      }
      
      // Focus trap
      if (e.key === 'Tab' && sidebarRef.current) {
        const focusableElements = sidebarRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      // Restore focus when sidebar closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [sidebarOpen]);

  const prevMonth = () => {
    setCurrentMonthIdx(prev => (prev === 0 ? DEFAULT_MONTHS.length - 1 : prev - 1));
    setSelectedDay(1);
    // Scroll to top of calendar section
    if (calendarSectionRef.current) {
      calendarSectionRef.current.scrollTop = 0;
    }
  };

  const nextMonth = () => {
    setCurrentMonthIdx(prev => (prev === DEFAULT_MONTHS.length - 1 ? 0 : prev + 1));
    setSelectedDay(1);
    // Scroll to top of calendar section
    if (calendarSectionRef.current) {
      calendarSectionRef.current.scrollTop = 0;
    }
  };

  const triggerProphecy = () => {
    const random = PROPHECIES[Math.floor(Math.random() * PROPHECIES.length)];
    setProphecy(random);
    setShowProphecyToast(true);
  };

  // Auto-dismiss prophecy toast
  useEffect(() => {
    if (!showProphecyToast) return;
    const timer = setTimeout(() => setShowProphecyToast(false), 6000);
    return () => clearTimeout(timer);
  }, [showProphecyToast]);

  // Memoized event lookup map for performance
  const eventsByDay = useMemo(() => {
    const map = new Map<string, MagicalEvent[]>();
    for (const event of events) {
      const key = `${event.month}-${event.day}`;
      const existing = map.get(key) || [];
      existing.push(event);
      map.set(key, existing);
    }
    return map;
  }, [events]);

  const getDayEvents = useCallback((dayNum: number, monthName: string) => {
    const key = `${monthName}-${dayNum}`;
    const dayEvents = eventsByDay.get(key) || [];
    if (activeFilter === 'all') return dayEvents;
    return dayEvents.filter(e => e.type === activeFilter);
  }, [eventsByDay, activeFilter]);

  const getAllDayEvents = useCallback((dayNum: number, monthName: string) => {
    const key = `${monthName}-${dayNum}`;
    return eventsByDay.get(key) || [];
  }, [eventsByDay]);

  const isDayHighlightedByFilter = useCallback((dayNum: number, monthName: string) => {
    if (activeFilter === 'all') return true;
    const key = `${monthName}-${dayNum}`;
    const dayEvents = eventsByDay.get(key) || [];
    if (dayEvents.length === 0) return false;
    return dayEvents.some(e => e.type === activeFilter);
  }, [eventsByDay, activeFilter]);

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

  // Memoized event type lookup
  const eventTypeMap = useMemo(() => {
    const map = new Map<string, EventTypeItem>();
    for (const et of eventTypes) {
      map.set(et.key, et);
    }
    return map;
  }, [eventTypes]);

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

  // Group days into weeks for proper ARIA grid structure
  const weeksInGrid = useMemo(() => {
    const weeks: { dayNum: number; isCurrent: boolean; isPrev?: boolean; isNext?: boolean }[][] = [];
    for (let i = 0; i < daysInGrid.length; i += 7) {
      weeks.push(daysInGrid.slice(i, i + 7));
    }
    return weeks;
  }, [currentMonth]);

  // --- Admin route ---
  if (route === 'admin') {
    if (auth.loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center text-on-surface-variant text-sm">
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
    <div className="bg-background text-on-background font-sans min-h-screen flex flex-col selection:bg-secondary selection:text-on-secondary overflow-x-hidden antialiased" style={{ overscrollBehavior: 'none' }}>

      {/* Skip to content */}
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo principal
      </a>

      {/* Prophecy Toast */}
      {showProphecyToast && (
        <div aria-live="assertive" aria-atomic="true" className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-primary-deep text-primary-light border-2 border-primary shadow-2xl py-3 px-6 rounded-2xl max-w-lg flex items-center gap-3 crystal-glow pointer-events-auto"
              role="alert"
            >
              <Sparkles className="w-6 h-6 text-secondary shrink-0 animate-pulse" aria-hidden="true" />
              <div>
                <p className="text-[10px] font-caps uppercase tracking-widest text-secondary">Pergaminho de Notificação Mística</p>
                <p className="text-sm font-medium text-white">{prophecy}</p>
              </div>
              <button
                onClick={() => setShowProphecyToast(false)}
                className="text-primary-light hover:text-white ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Fechar notificação"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      <div
        className="sidebar-overlay lg:hidden"
        data-open={sidebarOpen}
        onClick={() => setSidebarOpen(false)}
        onKeyDown={(e) => { if (e.key === 'Escape') setSidebarOpen(false); }}
        role="button"
        tabIndex={-1}
        aria-label="Fechar menu"
      />

      <main className="flex-1 flex flex-col lg:flex-row h-auto lg:h-screen overflow-hidden">

        {/* Left Sidebar */}
        <aside
          ref={sidebarRef}
          id="sidebar-nav"
          className="mobile-sidebar lg:relative lg:transform-none lg:translate-x-0 w-full lg:w-60 xl:w-72 bg-surface-alt border-b lg:border-b-0 lg:border-r border-outline-variant/30 py-5 lg:py-6 flex flex-col gap-4 lg:gap-6 shrink-0 overflow-y-auto"
          data-open={sidebarOpen}
          aria-label="Barra lateral de navegação"
          tabIndex={-1}
        >
          <div className="px-5">
            <div className="flex items-center gap-3 mb-6 bg-background p-4 rounded-xl border border-outline-variant/30 parchment-texture shadow-sm">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border-2 border-primary-deep shrink-0 shadow-sm">
                <BookOpen className="w-6 h-6 text-primary-deep" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-caps text-focus-ring uppercase tracking-widest">Archmage Calendar</p>
                <p className="text-base font-bold text-primary-deep truncate">Novice Ledger</p>
              </div>
            </div>

            {showWelcome && (
              <div className="lg:hidden mb-4">
                <WelcomeBanner onDismiss={() => setShowWelcome(false)} />
              </div>
            )}

            <a
              href="#/admin"
              className="w-full bg-primary py-2.5 rounded-xl text-white font-caps text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer border border-primary-light/20 no-underline"
              onClick={() => setSidebarOpen(false)}
            >
              <ShieldCheck className="w-4 h-4 text-secondary" aria-hidden="true" />
              Painel Admin
            </a>
          </div>

          {/* Filters */}
          <nav className="flex-1 px-2.5 space-y-1 overflow-y-auto min-h-0" aria-label="Filtros de disciplina">
            <p className="text-[10px] font-caps uppercase tracking-widest text-on-surface-variant px-3 mb-2">Filtros de Disciplina</p>

            <button
              onClick={() => { setActiveFilter('all'); setSidebarOpen(false); }}
              aria-pressed={activeFilter === 'all'}
              className={`filter-btn w-full text-left rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all cursor-pointer ${activeFilter === 'all'
                ? 'bg-secondary text-on-secondary font-bold shadow-sm border border-secondary/30'
                : 'text-on-surface-variant hover:bg-primary-light/50 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4" aria-hidden="true" />
                <span className="text-sm">Todos Registros</span>
              </div>
              <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full font-mono" aria-label={`${filterCounts.all} eventos`}>
                {filterCounts.all}
              </span>
            </button>

            {eventTypes.map(et => {
              const IconComp = resolveIcon(et.icon);
              const colors = getEventTypeColors(et.key);
              return (
                <button
                  key={et.key}
                  onClick={() => { setActiveFilter(et.key); setSidebarOpen(false); }}
                  aria-pressed={activeFilter === et.key}
                  className={`filter-btn w-full text-left rounded-xl px-3.5 py-2.5 flex items-center justify-between transition-all cursor-pointer ${activeFilter === et.key
                    ? 'bg-secondary text-on-secondary font-bold shadow-sm border border-secondary/30'
                    : 'text-on-surface-variant hover:bg-primary-light/50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: colors.dot }}
                      aria-hidden="true"
                    />
                    <IconComp className="w-4 h-4" style={{ color: et.color }} aria-hidden="true" />
                    <span className="text-sm">{et.label}</span>
                  </div>
                  <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full font-mono" aria-label={`${filterCounts[et.key] || 0} eventos`}>
                    {filterCounts[et.key] || 0}
                  </span>
                </button>
              );
            })}
          </nav>

          {showFilterHint && activeFilter === 'all' && (
            <div className="px-2.5">
              <FilterHint onDismiss={() => setShowFilterHint(false)} />
            </div>
          )}

          {activeFilter !== 'all' && (
            <div className="mx-3 p-3 bg-primary-light/70 rounded-xl border border-primary/10 text-xs parchment-texture shadow-inner" role="status">
              <span className="font-caps text-[9px] text-focus-ring block uppercase mb-1 tracking-wider">Filtro Ativo</span>
              <p className="text-on-background leading-relaxed">O calendário agora destaca apenas eventos da disciplina <strong className="capitalize text-primary-deep font-semibold">{eventTypes.find(e => e.key === activeFilter)?.label || activeFilter}</strong>.</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-2 text-focus-ring hover:text-secondary transition-colors font-semibold flex items-center gap-1 cursor-pointer text-[11px]"
                aria-label="Limpar filtro ativo"
              >
                Limpar filtro ×
              </button>
            </div>
          )}

          <div className="mt-auto px-2.5 space-y-1 pt-4 border-t border-outline-variant/20">
            <button
              onClick={triggerProphecy}
              className="w-full text-left text-on-surface-variant hover:bg-primary-light/50 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 cursor-pointer text-sm transition-all hover:text-focus-ring"
            >
              <Sparkles className="w-4 h-4 text-focus-ring" aria-hidden="true" />
              Profecia do Dia
            </button>
            <button
              disabled
              className="w-full text-left text-on-surface-variant/40 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-sm cursor-not-allowed"
              title="Em breve"
              aria-disabled="true"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              Configurações
            </button>
            <button
              disabled
              className="w-full text-left text-on-surface-variant/40 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-sm cursor-not-allowed"
              title="Em breve"
              aria-disabled="true"
            >
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
              Ajuda
            </button>
          </div>
        </aside>

        {/* Calendar Panel */}
        <section
          ref={calendarSectionRef}
          id="main-content"
          className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 xl:p-8 relative"
          tabIndex={-1}
          style={{
            backgroundImage: `linear-gradient(rgba(252, 249, 240, 0.85), rgba(252, 249, 240, 0.85)), url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll'
          }}
        >
          {/* Mobile header bar */}
          <div className="lg:hidden flex items-center gap-3 mb-5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="hamburger transition-bounce"
              aria-label="Abrir menu de navegação"
              aria-expanded={sidebarOpen}
              aria-controls="sidebar-nav"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <img src={logoImage} alt="Logo HoN EX" className="h-9 w-auto shrink-0 drop-shadow" loading="lazy" />
              <h1 className="text-xl font-cinzel text-primary font-bold tracking-tight truncate">Calendário</h1>
            </div>
          </div>

          <div className="mb-6 md:mb-8 flex flex-wrap gap-4 justify-between items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <img src={logoImage} alt="Logo HoN EX" className="h-12 sm:h-14 md:h-16 w-auto shrink-0 drop-shadow hidden lg:block" loading="lazy" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-cinzel text-primary font-bold tracking-tight">Calendario Hall of the Novice EX</h2>
                {activeFilter !== 'all' && (
                  <span className="bg-secondary text-on-secondary text-[10px] font-caps px-3 py-1 rounded-full font-semibold uppercase tracking-wider animate-pulse border border-focus-ring/20" role="status">
                    Filtro: {eventTypes.find(e => e.key === activeFilter)?.label || activeFilter}
                  </span>
                )}
              </div>
              <p className="text-sm text-on-surface-variant font-sans mt-2">
                <span className="font-semibold text-focus-ring">{currentMonth.name} {currentMonth.cycle}</span>
                <span className="mx-2 text-outline-variant">·</span>
                <span>Selecione um dia para ver os eventos.</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0" role="group" aria-label="Navegação entre meses">
              <button onClick={prevMonth} title="Mês Anterior" aria-label="Mês anterior" className="p-2.5 border border-outline-variant/50 rounded-xl hover:bg-primary-light hover:border-primary/30 transition-all cursor-pointer text-on-surface-variant active:scale-95">
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <span className="text-sm font-cinzel text-focus-ring font-semibold min-w-[100px] text-center px-3" aria-live="polite" aria-atomic="true">
                {currentMonth.name}
              </span>
              <button onClick={nextMonth} title="Próximo Mês" aria-label="Próximo mês" className="p-2.5 border border-outline-variant/50 rounded-xl hover:bg-primary-light hover:border-primary/30 transition-all cursor-pointer text-on-surface-variant active:scale-95">
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {showWelcome && (
            <div className="hidden lg:block">
              <WelcomeBanner onDismiss={() => setShowWelcome(false)} />
            </div>
          )}

          {eventsError && (
            <div className="mb-4 text-xs text-error bg-error-container border border-error/30 rounded-lg px-4 py-3">
              {eventsError}
              <button onClick={() => void fetchEvents()} className="ml-2 underline">tentar novamente</button>
            </div>
          )}

          {/* Calendar Grid */}
          {!eventsLoading && events.length === 0 ? (
            <EmptyCalendarState />
          ) : (
            <div className="grid grid-cols-7 gap-2 sm:gap-3 md:gap-4 select-none" role="grid" aria-label="Calendário de eventos">
              {/* Day of week headers */}
              {DAY_NAMES_MOBILE.map((day, i) => (
                <div key={i} className="text-center font-caps text-[10px] sm:text-[11px] md:text-xs text-on-surface-variant pb-3 md:pb-4 uppercase tracking-widest font-semibold border-b-2 border-secondary/30" role="columnheader" aria-label={DAY_NAMES_FULL[i]}>
                  <span className="hidden sm:inline">{DAY_NAMES_SHORT[i]}</span>
                  <span className="sm:hidden">{day}</span>
                </div>
              ))}

              {/* Calendar weeks with proper ARIA grid structure */}
              {weeksInGrid.map((week, weekIdx) => (
                <React.Fragment key={weekIdx}>
                  {week.map((cell, dayIdx) => {
                    const { dayNum, isCurrent, isPrev, isNext } = cell;
                    const dayEvents = getDayEvents(dayNum, currentMonth.name);
                    const hasEvents = dayEvents.length > 0;
                    const hasCrystal = dayEvents.some(e => e.crystal);
                    const firstEventImage = dayEvents.find(e => e.image)?.image;
                    const isSelected = isCurrent && selectedDay === dayNum;

                    if (!isCurrent) {
                      return (
                        <div
                          key={`p-${weekIdx}-${dayIdx}`}
                          className="h-24 sm:h-28 md:h-32 xl:h-36 rounded-xl bg-surface-alt/20 opacity-25 border border-outline-variant/10 p-2 sm:p-3 relative flex flex-col justify-between"
                          aria-hidden="true"
                        >
                          <span className="font-cinzel text-xs sm:text-sm md:text-base text-on-surface-variant/40">{dayNum}</span>
                          <span className="text-[7px] sm:text-[8px] font-caps text-on-surface-variant/30 text-right hidden sm:block uppercase tracking-wider">
                            {isPrev ? 'anterior' : 'próximo'}
                          </span>
                        </div>
                      );
                    }

                    const allDayEventsForIndicators = getAllDayEvents(dayNum, currentMonth.name);
                    const matchesFilter = isDayHighlightedByFilter(dayNum, currentMonth.name);
                    const primaryEventType = allDayEventsForIndicators.length > 0 ? allDayEventsForIndicators[0].type : null;
                    const primaryColors = primaryEventType ? getEventTypeColors(primaryEventType) : null;

                    return (
                      <div
                        key={`c-${dayNum}`}
                        onClick={() => setSelectedDay(dayNum)}
                        role="gridcell"
                        tabIndex={0}
                        aria-selected={isSelected}
                        aria-label={`${dayNum} de ${currentMonth.name}${hasEvents ? `, ${dayEvents.length} evento${dayEvents.length > 1 ? 's' : ''}` : ''}${isSelected ? ', selecionado' : ''}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDay(dayNum); } }}
                        className={`calendar-cell h-24 sm:h-28 md:h-32 xl:h-36 rounded-xl relative filigree-corner parchment-texture transition-all cursor-pointer flex flex-col justify-between p-2 sm:p-3 md:p-3.5 overflow-hidden group border ${isSelected
                          ? 'bg-secondary border-2 border-primary-deep shadow-lg today-pulse scale-[1.02]'
                          : 'bg-background border-outline-variant/30 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-md'
                          } ${!matchesFilter && activeFilter !== 'all' ? 'opacity-25 grayscale' : 'opacity-100'
                          }`}
                        style={!isSelected && primaryColors ? { 
                          borderLeftColor: primaryColors.border,
                          borderLeftWidth: '3px'
                        } : undefined}
                      >
                        <div className="absolute inset-0 bg-transparent pointer-events-none rounded-xl" />

                        <div className="flex justify-between items-start z-10">
                          <span className={`font-cinzel text-lg sm:text-xl md:text-2xl font-bold ${isSelected ? 'text-on-secondary' : 'text-focus-ring'}`}>
                            {dayNum < 10 ? `0${dayNum}` : dayNum}
                          </span>

                          {dayNum === TODAY.getDate() && currentMonthIdx === 0 && (
                            <time
                              dateTime={`${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`}
                              className={`text-[8px] sm:text-[9px] font-caps px-1.5 sm:px-2 py-0.5 rounded border leading-none uppercase font-bold tracking-widest ${isSelected
                                ? 'bg-on-secondary text-secondary border-secondary/20'
                                : 'bg-focus-ring text-white border-transparent'
                                }`}
                              aria-label="Dia atual"
                            >
                              Hoje
                            </time>
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
                          <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex gap-1.5 z-10">
                            {allDayEventsForIndicators.map((e, index) => {
                              const typeDef = eventTypeMap.get(e.type);
                              const colors = getEventTypeColors(e.type);
                              const dotBg = typeDef ? typeDef.color : colors.dot;
                              return (
                                <div
                                  key={e.id || index}
                                  className="w-2 h-2 rounded-full crystal-glow animate-pulse"
                                  style={{ backgroundColor: dotBg }}
                                  aria-hidden="true"
                                />
                              );
                            })}
                          </div>
                        )}

                        {firstEventImage && matchesFilter ? (
                          <div className="mt-2 w-full h-10 sm:h-14 md:h-16 rounded-lg overflow-hidden border border-outline-variant/50 relative z-10 group-hover:scale-[1.03] transition-transform">
                            <img className="w-full h-full object-cover" src={safeImageUrl(firstEventImage)} alt={`Imagem do evento: ${dayEvents[0]?.title || ''}`} referrerPolicy="no-referrer" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          </div>
                        ) : (
                          <div className="mt-2 flex flex-col justify-end text-right">
                            {hasEvents ? (
                              <div className="flex items-center justify-end gap-1.5">
                                {primaryColors && (
                                  <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: primaryColors.dot }}
                                    aria-hidden="true"
                                  />
                                )}
                                <span className="text-[9px] sm:text-[10px] font-semibold font-sans italic text-focus-ring opacity-80 truncate">
                                  {dayEvents.length} {dayEvents.length === 1 ? 'Atividade' : 'Atividades'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[8px] sm:text-[9px] font-caps text-on-surface-variant/40 uppercase tracking-widest group-hover:text-focus-ring/50 transition-colors hidden sm:block">
                                Livre
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="mt-10 flex items-center gap-3 p-5 bg-primary-light/50 rounded-2xl border border-primary/10 text-sm text-on-background parchment-texture" role="note">
            <AlertCircle className="w-5 h-5 text-focus-ring shrink-0" aria-hidden="true" />
            <p><strong>Segredo Rúnico:</strong> Acesse o <a href="#/admin" className="text-primary font-semibold hover:underline">Painel Admin</a> para gerenciar as atividades acadêmicas publicadas no calendário.</p>
          </div>
        </section>

        {/* Right Side: Arcane Ledger */}
        <aside className="w-full lg:w-80 xl:w-96 bg-surface-alt shadow-inner border-t lg:border-t-0 lg:border-l border-outline-variant p-4 lg:p-6 overflow-y-auto parchment-texture flex flex-col justify-between relative" aria-label="Painel de eventos do dia">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-secondary/30 pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-cinzel text-focus-ring font-bold">Arcane Ledger</h3>
                <p className="text-[10px] font-caps text-on-surface-variant uppercase tracking-wider mt-1">Diário de Atividades Místicas</p>
              </div>
              <div className="bg-primary text-white text-xs font-mono font-bold px-4 py-2 rounded-xl border border-primary-light/20 shrink-0 shadow-sm" aria-live="polite">
                Dia {selectedDay < 10 ? `0${selectedDay}` : selectedDay}
              </div>
            </div>

            {eventsLoading ? (
              <div className="text-center py-12 text-on-surface-variant text-xs">Carregando eventos…</div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 px-4 bg-background border border-outline-variant/30 rounded-2xl parchment-texture space-y-5">
                <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto text-on-surface-variant shadow-sm">
                  <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: '20s' }} aria-hidden="true" />
                </div>
                <div>
                  <h4 className="font-cinzel text-primary-deep font-semibold text-xl">Tempo de Estudo Livre</h4>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">Sem rituais oficiais agendados para este dia. Aproveite para praticar na Ala de Duelos ou estudar na Biblioteca.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative timeline-connector" role="list" aria-label={`Eventos do dia ${selectedDay}`}>
                {selectedDayEvents.map((event) => {
                  const typeDef = eventTypeMap.get(event.type);
                  const EventIcon = resolveIcon(typeDef?.icon || 'Wand2');
                  const colors = getEventTypeColors(event.type);
                  const typeColor = typeDef ? typeDef.color : colors.dot;

                  return (
                    <div key={event.id} className="relative pl-9 group" role="listitem">
                      <div
                        className="absolute left-0 top-1 w-8 h-8 rounded-full border-2 bg-background flex items-center z-10 hover:bg-secondary transition-all duration-200 shadow-sm hover:shadow-md hover:scale-110"
                        style={{ color: typeColor, borderColor: colors.border }}
                        aria-hidden="true"
                      >
                        <EventIcon className="w-4 h-4" />
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <div className="flex justify-between items-center gap-3 pr-6 relative">
                          <span className="text-[10px] font-caps text-focus-ring font-semibold tracking-widest uppercase flex items-center gap-1.5 shrink-0">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            {event.time}
                          </span>
                          <span
                            className="text-[9px] font-caps px-2.5 py-0.5 rounded-full border uppercase font-semibold whitespace-nowrap"
                            style={{ 
                              color: colors.text, 
                              borderColor: colors.border + '30', 
                              backgroundColor: colors.bg 
                            }}
                          >
                            {typeDef?.label || event.type}
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-cinzel text-primary-deep leading-snug font-bold line-clamp-2" title={event.title}>
                          {event.title}
                        </h4>

                        <p className="text-sm text-on-background leading-relaxed line-clamp-3">
                          {event.description}
                        </p>

                        {event.image && (
                          <div className="rounded-xl overflow-hidden border border-outline-variant h-36 relative shadow-sm my-1 group-hover:shadow transition-shadow">
                            <img className="w-full h-full object-cover" src={safeImageUrl(event.image)} alt={event.title} referrerPolicy="no-referrer" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            {event.instructor && (
                              <div className="absolute bottom-0 inset-x-0 bg-primary-deep/75 backdrop-blur-sm px-3 py-2 text-[10px] text-white font-caps uppercase tracking-widest flex justify-between">
                                <span>Instrutor: {event.instructor}</span>
                                <span className="text-secondary">M MBA</span>
                              </div>
                            )}
                          </div>
                        )}

                        {!event.image && event.instructor && (
                          <div className="text-[11px] font-caps text-on-surface-variant uppercase bg-primary-light/40 p-2.5 rounded-lg border border-outline-variant/20">
                            <strong>Orientador:</strong> {event.instructor}
                          </div>
                        )}

                        {event.mana_progress != null && event.mana_progress > 0 && (
                          <div className="mt-1 space-y-1.5">
                            <div className="flex justify-between text-[10px] font-caps text-on-surface-variant">
                              <span>Requisitos de Mana do Estudante</span>
                              <span className="font-mono">{event.mana_progress}% Média</span>
                            </div>
                            <div 
                              className="h-2.5 w-full bg-primary-light rounded-full overflow-hidden relative border border-outline-variant/30"
                              role="progressbar"
                              aria-valuenow={event.mana_progress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`Progresso de mana: ${event.mana_progress}%`}
                            >
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                style={{ width: `${event.mana_progress}%`, boxShadow: '0 0 8px #1D6A6A' }}
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
