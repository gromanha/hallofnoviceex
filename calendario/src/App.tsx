import React, { useState, useEffect, useCallback } from 'react';
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
    <div className="bg-[#fcf9f0] text-[#1c1c17] font-sans min-h-screen flex flex-col selection:bg-[#fed65b] selection:text-[#241a00] overflow-x-hidden antialiased" style={{ overscrollBehavior: 'none' }}>

      <AnimatePresence>
        {showProphecyToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1a3a5f] text-[#abc8f5] border-2 border-[#abc8f5] shadow-2xl py-3 px-6 rounded-2xl max-w-lg flex items-center gap-3 crystal-glow"
          >
            <Sparkles className="w-6 h-6 text-[#fed65b] shrink-0 animate-pulse" />
            <div>
              <p className="text-[10px] font-caps uppercase tracking-widest text-[#fed65b]">Pergaminho de Notificação Mística</p>
              <p className="text-sm font-medium text-white">{prophecy}</p>
            </div>
            <button onClick={() => setShowProphecyToast(false)} className="text-[#abc8f5] hover:text-white ml-2">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col lg:flex-row h-auto lg:h-screen overflow-hidden">

        {/* Left Sidebar */}
        <aside className="w-full lg:w-56 xl:w-64 bg-[#f6f3ea] border-b lg:border-b-0 lg:border-r border-[#c3c6cf] py-4 lg:py-6 flex flex-col gap-4 lg:gap-6 shrink-0 overflow-y-auto">
          <div className="px-6">
            <div className="flex items-center gap-3 mb-6 bg-[#fcf9f0] p-3 rounded-2xl border border-[#735c00]/10 parchment-texture">
              <div className="w-10 h-10 rounded-full bg-[#fed65b] flex items-center justify-center border border-[#735c00] shrink-0">
                <BookOpen className="w-5 h-5 text-[#241a00]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-caps text-[#735c00] uppercase tracking-wider">Archmage Calendar</p>
                <p className="text-sm font-bold text-[#002446] truncate">Novice Ledger</p>
              </div>
            </div>

            <a
              href="#/admin"
              className="w-full bg-[#002446] py-3 rounded-xl text-white font-caps text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-[#abc8f5]/20 no-underline"
            >
              <ShieldCheck className="w-4 h-4 text-[#fed65b]" />
              Painel Admin
            </a>
          </div>

          {/* Filters */}
          <nav className="flex-1 px-3 space-y-1">
            <p className="text-[9px] font-caps uppercase tracking-widest text-[#73777f] px-3 mb-2">Filtros de Disciplina</p>

            <button
              onClick={() => setActiveFilter('all')}
              className={`w-full text-left rounded-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${activeFilter === 'all'
                ? 'bg-[#fed65b] text-[#241a00] font-bold shadow-sm'
                : 'text-[#43474e] hover:bg-[#e5e2da] hover:translate-x-1'
                }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span className="text-sm">Todos Registros</span>
              </div>
              <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full font-mono text-[10px]">
                {events.filter(e => e.month === currentMonth.name).length}
              </span>
            </button>

            {eventTypes.map(et => {
              const IconComp = resolveIcon(et.icon);
              return (
                <button
                  key={et.key}
                  onClick={() => setActiveFilter(et.key)}
                  className={`w-full text-left rounded-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${activeFilter === et.key
                    ? 'bg-[#fed65b] text-[#241a00] font-bold shadow-sm'
                    : 'text-[#43474e] hover:bg-[#e5e2da] hover:translate-x-1'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className="w-4 h-4" style={{ color: et.color }} />
                    <span className="text-sm">{et.label}</span>
                  </div>
                  <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full font-mono text-[10px]">
                    {events.filter(e => e.month === currentMonth.name && e.type === et.key).length}
                  </span>
                </button>
              );
            })}
          </nav>

          {activeFilter !== 'all' && (
            <div className="mx-4 p-3 bg-[#f1eee5] rounded-xl border border-[#735c00]/10 text-xs parchment-texture">
              <span className="font-caps text-[10px] text-[#735c00] block uppercase mb-1">Filtro Ativo</span>
              <p className="text-[#43474e]">O calendário agora destaca apenas eventos da disciplina <strong className="capitalize text-[#002446]">{eventTypes.find(e => e.key === activeFilter)?.label || activeFilter}</strong>.</p>
              <button
                onClick={() => setActiveFilter('all')}
                className="mt-2 text-[#735c00] hover:underline font-semibold flex items-center gap-1 cursor-pointer text-[11px]"
              >
                Limpar filtro ×
              </button>
            </div>
          )}

          <div className="mt-auto px-3 space-y-1 pt-4 border-t border-[#c3c6cf]/30">
            <button
              onClick={triggerProphecy}
              className="w-full text-left text-[#43474e] hover:bg-[#e5e2da] rounded-full px-4 py-2 flex items-center gap-3 cursor-pointer text-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#735c00]" />
              Profecia do Dia
            </button>
            <div className="text-[#43474e] hover:bg-[#e5e2da] rounded-full px-4 py-2 flex items-center gap-3 cursor-pointer text-xs transition-colors">
              <Settings className="w-4 h-4 text-[#73777f]" />
              Settings
            </div>
            <div className="text-[#43474e] hover:bg-[#e5e2da] rounded-full px-4 py-2 flex items-center gap-3 cursor-pointer text-xs transition-colors">
              <HelpCircle className="w-4 h-4 text-[#73777f]" />
              Support
            </div>
          </div>
        </aside>

        {/* Calendar Panel */}
        <section
          id="calendar-section"
          className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 xl:p-8 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(252, 249, 240, 0.82), rgba(252, 249, 240, 0.82)), url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'scroll'
          }}
        >
          <div className="mb-4 md:mb-6 flex flex-wrap gap-3 justify-between items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <img src={logoImage} alt="Logo HoN EX" className="h-10 sm:h-12 md:h-14 w-auto shrink-0 drop-shadow" />
                <h2 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-cinzel text-[#1a3a5f] font-bold tracking-tight">Calendario Hall of the Novice EX</h2>
                {activeFilter !== 'all' && (
                  <span className="bg-[#fed65b] text-[#241a00] text-[10px] font-caps px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider animate-pulse border border-[#735c00]/20">
                    Filtro: {activeFilter}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#73777f] font-sans mt-1">
                <span className="font-semibold text-[#735c00]">{currentMonth.name} {currentMonth.cycle}</span>
                {' — '}Selecione um dia para ver os eventos.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={prevMonth} title="Mês Anterior" className="p-2 border border-[#c3c6cf] rounded-lg hover:bg-[#ebe8df] transition-colors cursor-pointer text-[#43474e]">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-serif text-[#735c00] font-semibold hidden sm:block min-w-[100px] text-center">
                {currentMonth.name}
              </span>
              <button onClick={nextMonth} title="Próximo Mês" className="p-2 border border-[#c3c6cf] rounded-lg hover:bg-[#ebe8df] transition-colors cursor-pointer text-[#43474e]">
                <ChevronRight className="w-5 h-5" />
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
          <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 xl:gap-4 select-none">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
              <div key={i} className="text-center font-caps text-[9px] sm:text-[11px] md:text-xs text-[#43474e] pb-1 md:pb-2 uppercase tracking-widest font-semibold border-b border-[#c3c6cf]/30">
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
                  <div key={`p-${idx}`} className="h-20 sm:h-28 md:h-32 xl:h-36 rounded-lg md:rounded-xl bg-[#f1eee5]/40 opacity-40 border border-[#c3c6cf]/30 p-1 sm:p-2 relative flex flex-col justify-between">
                    <span className="font-serif text-sm sm:text-lg text-[#73777f]">{dayNum}</span>
                    <span className="text-[7px] sm:text-[8px] font-caps text-[#73777f]/60 text-right hidden sm:block">
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
                  className={`h-20 sm:h-28 md:h-32 xl:h-36 rounded-lg md:rounded-xl relative filigree-corner parchment-texture hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between p-1.5 sm:p-2 md:p-3 overflow-hidden group border ${isSelected
                    ? 'bg-[#fed65b] border-2 border-[#735c00] shadow-inner today-pulse scale-[1.01]'
                    : 'bg-[#fcf9f0] border-[#735c00]/20 hover:-translate-y-1 hover:border-[#735c00]/60'
                    } ${!matchesFilter && activeFilter !== 'all' ? 'opacity-30' : 'opacity-100'
                    }`}
                >
                  <div className="absolute inset-0 bg-transparent pointer-events-none rounded-xl" />

                  <div className="flex justify-between items-start z-10">
                    <span className={`font-serif text-base sm:text-xl md:text-2xl font-bold ${isSelected ? 'text-[#241a00]' : 'text-[#735c00]'}`}>
                      {dayNum < 10 ? `0${dayNum}` : dayNum}
                    </span>

                    {dayNum === TODAY.getDate() && currentMonthIdx === 0 && (
                      <span className={`text-[7px] sm:text-[8px] font-caps px-1 sm:px-1.5 py-0.5 rounded border leading-none uppercase font-bold tracking-widest ${isSelected
                        ? 'bg-[#241a00] text-[#fed65b] border-[#fed65b]/20'
                        : 'bg-[#735c00] text-white border-transparent'
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
                    <div className="mt-1 sm:mt-2 w-full h-10 sm:h-14 md:h-16 rounded-md md:rounded-lg overflow-hidden border border-[#c3c6cf]/50 relative z-10 group-hover:scale-[1.03] transition-transform">
                      <img className="w-full h-full object-cover" src={firstEventImage} alt="Miniatura de evento" referrerPolicy="no-referrer" />
                    </div>
                  ) : (
                    <div className="mt-2 sm:mt-4 flex flex-col justify-end text-right">
                      {hasEvents ? (
                        <span className="text-[8px] sm:text-[9px] font-semibold font-sans italic text-[#735c00] opacity-80 truncate">
                          {dayEvents.length} {dayEvents.length === 1 ? 'Ativ.' : 'Ativ.'}
                        </span>
                      ) : (
                        <span className="text-[7px] sm:text-[8px] font-caps text-[#73777f]/40 uppercase tracking-widest group-hover:text-[#735c00]/50 transition-colors hidden sm:block">
                          Livre
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center gap-3 p-4 bg-[#f1eee5]/50 rounded-2xl border border-[#735c00]/10 text-xs text-[#43474e] parchment-texture">
            <AlertCircle className="w-5 h-5 text-[#735c00]" />
            <p><strong>Segredo Rúnico:</strong> Acesse o <a href="#/admin" className="text-[#002446] font-semibold hover:underline">Painel Admin</a> para gerenciar as atividades acadêmicas publicadas no calendário.</p>
          </div>
        </section>

        {/* Right Side: Arcane Ledger */}
        <aside className="w-full lg:w-80 xl:w-96 bg-[#f1eee5] shadow-inner border-t lg:border-t-0 lg:border-l border-[#c3c6cf] p-4 lg:p-6 overflow-y-auto parchment-texture flex flex-col justify-between relative">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#c3c6cf]/40 pb-4">
              <div>
                <h3 className="text-2xl font-serif text-[#735c00] font-bold">Arcane Ledger</h3>
                <p className="text-[10px] font-caps text-[#73777f] uppercase tracking-wider">Diário de Atividades Místicas</p>
              </div>
              <div className="bg-[#002446] text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-[#abc8f5]/20 shrink-0">
                Dia {selectedDay < 10 ? `0${selectedDay}` : selectedDay}
              </div>
            </div>

            {eventsLoading ? (
              <div className="text-center py-10 text-[#73777f] text-xs">Carregando eventos…</div>
            ) : selectedDayEvents.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#fcf9f0] border border-[#735c00]/10 rounded-2xl parchment-texture space-y-4">
                <div className="w-12 h-12 bg-[#ebe8df] rounded-full flex items-center justify-center mx-auto text-[#73777f]">
                  <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} />
                </div>
                <div>
                  <h4 className="font-serif text-[#002446] font-semibold text-lg">Tempo de Estudo Livre</h4>
                  <p className="text-xs text-[#73777f] mt-1">Sem rituais oficiais agendados para este dia. Aproveite para praticar na Ala de Duelos ou estudar na Biblioteca.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-[2px] before:bg-dotted before:border-l-2 before:border-dotted before:border-[#c3c6cf]">
                {selectedDayEvents.map((event) => {
                  const typeDef = eventTypes.find(t => t.key === event.type);
                  const EventIcon = resolveIcon(typeDef?.icon || 'Wand2');
                  const typeColor = typeDef ? typeDef.color : '#1a3a5f';

                  return (
                    <div key={event.id} className="relative pl-8 group">
                      <div
                        className="absolute left-0 top-1 w-7 h-7 rounded-full border-2 border-[#735c00] bg-[#fcf9f0] flex items-center z-10 hover:bg-[#fed65b] transition-colors shadow-sm"
                        style={{ color: typeColor }}
                      >
                        <EventIcon className="w-3.5 h-3.5" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center gap-2 pr-6 relative">
                          <span className="text-[10px] font-caps text-[#735c00] font-semibold tracking-widest uppercase flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                          <span
                            className="text-[9px] font-caps px-2 py-0.5 rounded-full border uppercase font-semibold whitespace-nowrap"
                            style={{ color: typeColor, borderColor: typeColor + '40', backgroundColor: typeColor + '15' }}
                          >
                            {event.type}
                          </span>
                        </div>

                        <h4 className="text-lg font-serif text-[#002446] leading-snug font-bold">
                          {event.title}
                        </h4>

                        <p className="text-xs text-[#43474e] leading-relaxed">
                          {event.description}
                        </p>

                        {event.image && (
                          <div className="rounded-xl overflow-hidden border border-[#c3c6cf] h-32 relative shadow-sm my-1 group-hover:shadow transition-shadow">
                            <img className="w-full h-full object-cover" src={event.image} alt={event.title} referrerPolicy="no-referrer" />
                            {event.instructor && (
                              <div className="absolute bottom-0 inset-x-0 bg-[#002446]/75 backdrop-blur-sm px-3 py-1.5 text-[9px] text-white font-caps uppercase tracking-widest flex justify-between">
                                <span>Instrutor: {event.instructor}</span>
                                <span className="text-[#fed65b]">M MBA</span>
                              </div>
                            )}
                          </div>
                        )}

                        {!event.image && event.instructor && (
                          <div className="text-[10px] font-caps text-[#73777f] uppercase bg-[#e5e2da]/40 p-2 rounded-lg border border-[#c3c6cf]/20">
                            <strong>Orientador:</strong> {event.instructor}
                          </div>
                        )}

                        {event.manaProgress && event.manaProgress > 0 && (
                          <div className="mt-1 space-y-1">
                            <div className="flex justify-between text-[9px] font-caps text-[#43474e]">
                              <span>Requisitos de Mana do Estudante</span>
                              <span className="font-mono">{event.manaProgress}% Média</span>
                            </div>
                            <div className="h-2 w-full bg-[#e5e2da] rounded-full overflow-hidden relative border border-[#c3c6cf]/30">
                              <div
                                className="h-full bg-[#002446] rounded-full transition-all duration-1000"
                                style={{ width: `${event.manaProgress}%`, boxShadow: '0 0 8px #abc8f5' }}
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
