import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  BookOpen, 
  Sparkles, 
  User, 
  PlusCircle, 
  Layers, 
  Wand2, 
  Swords, 
  FlaskConical, 
  Settings, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Gem, 
  Compass, 
  Map, 
  Star, 
  Clock,
  AlertCircle,
  Eye
} from 'lucide-react';
import { MagicalEvent, MonthData, EventType } from './types';

// Predefined magic imagery URLs matching the original design
const IMAGE_PRESETS = [
  {
    id: 'tomo_mana',
    name: 'Estudo de Tomos',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvnLps7sbd0iDk9pmEdea7jgzB3rOZPX-R2A_t4YChYqg3e8-EPusUhRKdas8hPiKB0CQ1qbq-5pTR8WFXM3aQhOm24fTjOP4fk0sb90ZtKs5NiRv2mVN7qBVcQtiQn7le9sY2lwKfLEDWwFsMR2ek58kW00qnNb2NE1ew5RrxxezpqcfrWLkJYSky1ezbihsyLGBTbmYmCGq3ZKxS7QOdIAZBmnsstB1P2i6-AD2sZcTUbsvd5E0J'
  },
  {
    id: 'citadela',
    name: 'Cidadela da Academia',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnY5IXC2xfoiO8g3rkbO-AzQz_rDAHMxAmREWuHqRVlgVdQxPs37y1Z6yynhSCClv04gLs3YFRwbK9v3LaKlAzL4ulfW2o-5XG7cmvPur7gZiJeTZJYwE-gTwwdH7r--o7z2E5yqnHn_bgnarT3MUp7pGuZh-efeWx_5x2zFcmDhsfgwbJqs6q84js8lgMhoJ05iCK9V4bZWaXozRflt7P1Ybc1JC_t74hWN9m4lzZsVv68s3UqZLg'
  },
  {
    id: 'diagrama_tatico',
    name: 'Formação de Mana',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAheS6lxFYOrofOOY1F95IEsJO3zDuR_3DWs7bb3uxgW5yDFXkM12qYjkFXGodvOsQ7WoiukGsJTk4Hd5N7bYNqx8gVxrV79Gcqpf3DIqE2PJHkuuS2QI7bWP_15VeNW8s_Jt3bbBeRGUOVcYJ_2TRpcuwre053n6FINxidBOtUz_lPPTtvA2OhJdOWVnpp0kxUnRc_rtBRW4FIz9FejgGgprw3ccSQIbW9WNauzuQoUwJT6itcQG3X'
  },
  {
    id: 'patrulha',
    name: 'Vigília Noturna',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOp26158hZh0yri8svOM7U9bu-TfeCCEOFI2sylTZz_VvbjKZYZStwWTTn91DFl7TETCsrHoES0q-RUqk4oqLSAKP430R6rAoc510iHC0zngAGPHULtaaYnP1K20B2r8Uk6dZKIKJcCBSN7avQjbAkphIsBoWaR6BZ7SqffO9wrJozPz-GuaVRacp3G0IAgNoJ0SZSFnZW5eyfvjir9qx8BDEM8jhoR3hTg86nPI0TLdUJlpgW7ZMN'
  },
  {
    id: 'jardim',
    name: 'Herborologia Jardim',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqYLIlGYkEDPKux1Ac1HbSSOazw-RXPpc7dC2udaqhYQB6luHevWBAO3Pl6ghWY9fCO6YxRZMd1f61tlYfUX4Y0DMF_LJrxOxyKJbivCZthff_c1cKAJDnCdU7_OwE2SJ_nWUTNdcwRPifKzB6Wm94DaruuWgEjyMgT2K2-U6Udm5zXvG0AEGD_srsx7tbFmlDgrg7csbpRJTx6WAFYVqLNm9SeiBHNNqJkgvISiC9gpareaqanAPE'
  },
  {
    id: 'sala_aula',
    name: 'Sala de Aula Arcana',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEGdE74nVQCdZnrmKM_JAx9adPp-8RmT3s088G4hFCmSrSL6fmsW1YA4RWxg1Rj4wZLVSVt1HOd9a87h-6vej8DzXtDHDqSvvIyb5i90XUdesRFECRKRU3qRpUAfc-ScZ7k74snWfBqMrrtN2lPQiuYlyTLdWwkvE28W-FTFXVqY9KIfl_JK8sgsCwPh-x3rMOCAHj5rRbLAEIesohSqRnp0IsmBDuEnJ8NlKhun4q8x0jOi7ICMqt'
  }
];

const DEFAULT_MONTHS: MonthData[] = [
  {
    name: "Mês das Plêiades",
    cycle: "Ciclo de Cristalização do 4º Ano",
    daysCount: 30,
    offset: 2, // Tuesday start
    prevMonthDays: [30, 31]
  },
  {
    name: "Mês das Dríades",
    cycle: "Ciclo de Florescimento do 4º Ano",
    daysCount: 31,
    offset: 4, // Thursday start
    prevMonthDays: [28, 29, 30, 31]
  },
  {
    name: "Mês do Éter",
    cycle: "Ciclo de Transcendência do 4º Ano",
    daysCount: 30,
    offset: 0, // Sunday start
    prevMonthDays: []
  }
];

const INITIAL_EVENTS: MagicalEvent[] = [
  {
    id: 'evt-1',
    month: "Mês das Plêiades",
    day: 1,
    time: "08:00 — 10:30",
    title: "Iniciação Hermética: Estudo de Tomos de Mana",
    description: "Reunião de recepção dos novatos para desvendar os mistérios dos antigos tomos flutuantes na Grande Biblioteca Central.",
    instructor: "Arquimago Valerius",
    image: IMAGE_PRESETS[0].url,
    type: "spells",
    manaProgress: 35,
    spots: "18/40",
    rank: "A-Class",
    crystal: true,
    indicators: ['primary']
  },
  {
    id: 'evt-2',
    month: "Mês das Plêiades",
    day: 3,
    time: "09:00 — 11:30",
    title: "Tática de Batalha: Formações de Mana",
    description: "Estudo das linhas de fluxo em combate e posicionamento avançado de barreiras rúnicas de contenção.",
    instructor: "Archmage Valerius",
    image: IMAGE_PRESETS[2].url,
    type: "tactics",
    manaProgress: 70,
    spots: "12/40",
    rank: "S-Class",
    crystal: true,
    stars: true,
    indicators: ['primary', 'secondary']
  },
  {
    id: 'evt-3',
    month: "Mês das Plêiades",
    day: 3,
    time: "14:00 — 16:00",
    title: "Ritual de Cristais: Focalização Elemental",
    description: "Traga seu prisma pessoal de nível 3 para o Salão Sul. Foco em alinhamento de canais de energia elemental pura.",
    instructor: "Mestra Seraphina",
    type: "ritual",
    manaProgress: 70,
    spots: "12/40",
    rank: "S-Class",
    indicators: ['secondary']
  },
  {
    id: 'evt-4',
    month: "Mês das Plêiades",
    day: 3,
    time: "20:00 — 22:00",
    title: "Vigília nos Portões: Patrulha Noturna",
    description: "Ronda de vigilância mística ao redor dos portões principais da academia sob a luz das estrelas e escudos translúcidos.",
    instructor: "Guarda Rúnico Alistair",
    image: IMAGE_PRESETS[3].url,
    type: "tactics",
    manaProgress: 70,
    spots: "12/40",
    rank: "S-Class",
    indicators: ['error']
  },
  {
    id: 'evt-5',
    month: "Mês das Plêiades",
    day: 5,
    time: "11:00 — 13:00",
    title: "Mistura de Elixires e Essências de Fogo",
    description: "Destilação experimental de lágrimas de fênix e pó de enxofre em ambiente alquímico controlado de nível 2.",
    instructor: "Alquimista Ignis",
    type: "alchemy",
    manaProgress: 50,
    spots: "8/25",
    rank: "B-Class",
    crystal: false,
    indicators: ['secondary', 'error']
  },
  {
    id: 'evt-6',
    month: "Mês das Plêiades",
    day: 8,
    time: "10:00 — 12:30",
    title: "Análise Avançada de Diagramas Táticos",
    description: "Discussão aprofundada de táticas defensivas contra hordas elementais e conjuração síncrona com os generais de prata.",
    instructor: "Arquimago Valerius",
    image: IMAGE_PRESETS[5].url,
    type: "tactics",
    manaProgress: 80,
    spots: "24/40",
    rank: "S-Class",
    crystal: true,
    indicators: ['primary']
  },
  {
    id: 'evt-7',
    month: "Mês das Plêiades",
    day: 16,
    time: "09:00 — 12:00",
    title: "Herborologia e Botânica Arcana: Cultivo de Lavanda Mística",
    description: "Excursão prática aos jardins sagrados para colheita de lavanda mística sob o orvalho da manhã e rituais de crescimento rápido.",
    instructor: "Mestra Flora",
    image: IMAGE_PRESETS[4].url,
    type: "alchemy",
    manaProgress: 60,
    spots: "15/30",
    rank: "A-Class",
    crystal: true,
    indicators: ['primary', 'secondary']
  }
];

const PROPHECIES = [
  "Os ventos de mana estão altamente favoráveis para poções hoje. +15% de eficiência na destilação elemental de fogo.",
  "Alerta do Sanctum: Um duende de mana fugitivo foi avistado perto dos jardins de Lavanda Mística. Mantenham os grimórios fechados.",
  "Amanhã as estrelas se alinharão com o Cristal Primordial. Período recomendado para meditação mística silenciosa.",
  "Estudantes de Alquimia: Favor não misturar lágrimas de fênix com essência de sombra na ausência de supervisão oficial.",
  "A barreira do Hall of the Novice EX passará por recalibração rúnica às 18:00. Pequenas oscilações gravitacionais são normais."
];

export default function App() {
  // Persistence state
  const [events, setEvents] = useState<MagicalEvent[]>(() => {
    const saved = localStorage.getItem('academic_ledger_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  useEffect(() => {
    localStorage.setItem('academic_ledger_events', JSON.stringify(events));
  }, [events]);

  // Calendar parameters
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const currentMonth = DEFAULT_MONTHS[currentMonthIdx];
  const [selectedDay, setSelectedDay] = useState<number>(3); // Default matches Day 3 in screenshot
  const [activeFilter, setActiveFilter] = useState<'all' | 'spells' | 'tactics' | 'alchemy'>('all');

  // Mouse Trail State
  const [trail, setTrail] = useState({ x: 0, y: 0, visible: false });

  // Custom event creation states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDay, setNewEventDay] = useState<number>(3);
  const [newEventTime, setNewEventTime] = useState('09:00 — 11:30');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventInstructor, setNewEventInstructor] = useState('Archmage Valerius');
  const [newEventType, setNewEventType] = useState<EventType>('spells');
  const [newEventMana, setNewEventMana] = useState<number>(60);
  const [newEventSpots, setNewEventSpots] = useState('15/40');
  const [newEventRank, setNewEventRank] = useState('S-Class');
  const [newEventImage, setNewEventImage] = useState(IMAGE_PRESETS[0].url);
  const [newEventCrystal, setNewEventCrystal] = useState(true);

  // Magic announcements & prophecy system
  const [prophecy, setProphecy] = useState(PROPHECIES[0]);
  const [showProphecyToast, setShowProphecyToast] = useState(false);

  // Track coordinates for cursor following in the Calendar section
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTrail({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true
    });
  };

  const handleMouseLeave = () => {
    setTrail(prev => ({ ...prev, visible: false }));
  };

  // Switch months securely
  const prevMonth = () => {
    setCurrentMonthIdx(prev => (prev === 0 ? DEFAULT_MONTHS.length - 1 : prev - 1));
    setSelectedDay(1); // Reset selected day to 1st of the new month
  };

  const nextMonth = () => {
    setCurrentMonthIdx(prev => (prev === DEFAULT_MONTHS.length - 1 ? 0 : prev + 1));
    setSelectedDay(1);
  };

  // Random Prophecy trigger
  const triggerProphecy = () => {
    const random = PROPHECIES[Math.floor(Math.random() * PROPHECIES.length)];
    setProphecy(random);
    setShowProphecyToast(true);
    setTimeout(() => {
      setShowProphecyToast(false);
    }, 6000);
  };

  // Add event handler
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const added: MagicalEvent = {
      id: `evt-${Date.now()}`,
      month: currentMonth.name,
      day: Number(newEventDay),
      time: newEventTime,
      title: newEventTitle,
      description: newEventDesc,
      instructor: newEventInstructor,
      image: newEventImage,
      type: newEventType,
      manaProgress: Number(newEventMana),
      spots: newEventSpots,
      rank: newEventRank,
      crystal: newEventCrystal,
      stars: newEventType === 'tactics',
      indicators: [
        newEventType === 'spells' ? 'primary' : 
        newEventType === 'tactics' ? 'secondary' : 'error'
      ]
    };

    setEvents(prev => [...prev, added]);
    setIsModalOpen(false);

    // Reset fields
    setNewEventTitle('');
    setNewEventDesc('');
    // Trigger toast notification
    setProphecy(`Mágico! Nova atividade "${newEventTitle}" inscrita no Registro de Atividades.`);
    setShowProphecyToast(true);
    setTimeout(() => setShowProphecyToast(false), 4000);
  };

  // Delete event handler
  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  // Filter day events based on selected categories
  const getDayEvents = (dayNum: number, monthName: string) => {
    return events.filter(e => {
      if (e.month !== monthName || e.day !== dayNum) return false;
      if (activeFilter === 'all') return true;
      return e.type === activeFilter;
    });
  };

  // Find all events on a specific day regardless of filter for indicators
  const getAllDayEvents = (dayNum: number, monthName: string) => {
    return events.filter(e => e.month === monthName && e.day === dayNum);
  };

  // Check if active filter highlights a day
  const isDayHighlightedByFilter = (dayNum: number, monthName: string) => {
    if (activeFilter === 'all') return true;
    const dayEvents = events.filter(e => e.month === monthName && e.day === dayNum);
    if (dayEvents.length === 0) return false;
    return dayEvents.some(e => e.type === activeFilter);
  };

  // Current selected day's filtered list of events
  const selectedDayEvents = getDayEvents(selectedDay, currentMonth.name);

  // Generate list of days for grid
  const daysInGrid = [];
  // 1. Add prev month days padding
  currentMonth.prevMonthDays.forEach(d => {
    daysInGrid.push({ dayNum: d, isCurrent: false, isPrev: true });
  });
  // 2. Add current month days
  for (let i = 1; i <= currentMonth.daysCount; i++) {
    daysInGrid.push({ dayNum: i, isCurrent: true, isPrev: false });
  }
  // 3. Add next month days to complete 35 or 42 grid cells
  const totalInGrid = daysInGrid.length;
  const targetCells = totalInGrid <= 35 ? 35 : 42;
  const nextMonthPadding = targetCells - totalInGrid;
  for (let i = 1; i <= nextMonthPadding; i++) {
    daysInGrid.push({ dayNum: i, isCurrent: false, isNext: true });
  }

  // Pre-fill fields when selecting day to create event
  const openCreateModalForDay = (day: number) => {
    setNewEventDay(day);
    setIsModalOpen(true);
  };

  // Dynamic values based on selected day's events
  const selectedDaySpots = selectedDayEvents.length > 0 
    ? selectedDayEvents[0].spots 
    : "12/40"; // fallback default
  const selectedDayRank = selectedDayEvents.length > 0 
    ? selectedDayEvents[0].rank 
    : "S-Class"; // fallback default
  const maxManaRequired = selectedDayEvents.length > 0
    ? Math.max(...selectedDayEvents.map(e => e.manaProgress))
    : 0;

  return (
    <div className="bg-[#fcf9f0] text-[#1c1c17] font-sans min-h-screen flex flex-col selection:bg-[#fed65b] selection:text-[#241a00] overflow-x-hidden antialiased">
      
      {/* Toast Notification for Daily Prophecy or Magical actions */}
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

      {/* Main Header */}
      <header className="bg-[#e5e2da] shadow-md flex flex-wrap gap-4 justify-between items-center w-full px-6 md:px-10 py-3 border-b-2 border-[#ffe088] z-30">
        <div className="flex items-center gap-4">
          <img 
            id="academy-seal"
            alt="Academy Seal" 
            className="h-14 w-14 object-contain animate-[spin_60s_linear_infinite]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhz7kxZZNUGzTQkqh4ZvbMx8K65LBKuR22FKXovUYV49qlY1ZKVcZtPYqQujFbUKCdrMfOZGaf7yTOi834Tqyw1yH6hmf9fu_ViIfpEVixlcss2gsYGU_OJ-RA4mOLYU1x971YrNsSz_ZlLbZodVEZSTmPaj6eEZvqMlrJLREwLAc5Jqa2ITwXe0D65lQLMcJLTB8iDrIry1wGRk-KAp7cHFOSIh4LkxakGnq0jAP28SBxx-0mMhLVk7DsL9810UTOkQ"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#735c00] tracking-tight">Majestic Battle Academy</h1>
            <p className="text-[10px] md:text-xs font-caps text-[#43474e] uppercase tracking-widest font-semibold">Hall of the Novice EX</p>
          </div>
        </div>
        
        {/* Current Period Badge */}
        <div className="flex flex-col items-center md:items-end bg-[#f1eee5]/70 border border-[#735c00]/20 rounded-xl px-4 py-1.5 parchment-texture">
          <span className="text-lg md:text-xl font-serif text-[#002446] font-semibold">{currentMonth.name}</span>
          <span className="text-[9px] md:text-[11px] font-caps text-[#735c00] uppercase tracking-wider">{currentMonth.cycle}</span>
        </div>

        {/* Header Navigation */}
        <nav className="flex items-center gap-6">
          <div className="hidden md:flex gap-6">
            <a href="#" className="text-[#735c00] border-b-2 border-[#735c00] pb-0.5 font-caps text-xs uppercase tracking-wider font-semibold">Chronicle</a>
            <a href="#" className="text-[#43474e] hover:text-[#735c00] transition-colors font-caps text-xs uppercase tracking-wider font-semibold">Sanctum</a>
            <a href="#" className="text-[#43474e] hover:text-[#735c00] transition-colors font-caps text-xs uppercase tracking-wider font-semibold">Arsenal</a>
          </div>
          <div className="flex items-center gap-2">
            <button 
              id="sparkle-prophecy"
              onClick={triggerProphecy}
              title="Obter Profecia Diária"
              className="p-2 hover:bg-[#1a3a5f] hover:text-[#abc8f5] rounded-full transition-all active:scale-90 text-[#1c1c17] relative group"
            >
              <Sparkles className="w-5 h-5 text-[#735c00] group-hover:text-white" />
              <span className="absolute -bottom-8 right-0 bg-[#002446] text-white text-[9px] px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Profecia</span>
            </button>
            <button className="p-2 hover:bg-[#1a3a5f] hover:text-[#abc8f5] rounded-full transition-all active:scale-90 text-[#1c1c17]">
              <User className="w-5 h-5 text-[#43474e]" />
            </button>
          </div>
        </nav>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Side Navigation Bar */}
        <aside className="w-full lg:w-64 bg-[#f6f3ea] border-b lg:border-b-0 lg:border-r border-[#c3c6cf] py-6 flex flex-col gap-6 shrink-0">
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
            
            {/* Create Event Trigger */}
            <button 
              id="new-event-btn"
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#002446] py-3 rounded-xl text-white font-caps text-xs tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer border border-[#abc8f5]/20"
            >
              <PlusCircle className="w-4 h-4 text-[#fed65b]" />
              New Event
            </button>
          </div>

          {/* Interactive Navigation Filter Categories */}
          <nav className="flex-1 px-3 space-y-1">
            <p className="text-[9px] font-caps uppercase tracking-widest text-[#73777f] px-3 mb-2">Filtros de Disciplina</p>
            
            <button 
              onClick={() => setActiveFilter('all')}
              className={`w-full text-left rounded-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${
                activeFilter === 'all' 
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

            <button 
              onClick={() => setActiveFilter('spells')}
              className={`w-full text-left rounded-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${
                activeFilter === 'spells' 
                  ? 'bg-[#fed65b] text-[#241a00] font-bold shadow-sm' 
                  : 'text-[#43474e] hover:bg-[#e5e2da] hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wand2 className="w-4 h-4 text-[#002446]" />
                <span className="text-sm">Spells (Magias)</span>
              </div>
              <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full font-mono text-[10px]">
                {events.filter(e => e.month === currentMonth.name && e.type === 'spells').length}
              </span>
            </button>

            <button 
              onClick={() => setActiveFilter('tactics')}
              className={`w-full text-left rounded-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${
                activeFilter === 'tactics' 
                  ? 'bg-[#fed65b] text-[#241a00] font-bold shadow-sm' 
                  : 'text-[#43474e] hover:bg-[#e5e2da] hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-3">
                <Swords className="w-4 h-4 text-[#735c00]" />
                <span className="text-sm">Tactics (Táticas)</span>
              </div>
              <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full font-mono text-[10px]">
                {events.filter(e => e.month === currentMonth.name && e.type === 'tactics').length}
              </span>
            </button>

            <button 
              onClick={() => setActiveFilter('alchemy')}
              className={`w-full text-left rounded-full px-4 py-2.5 flex items-center justify-between transition-all cursor-pointer ${
                activeFilter === 'alchemy' 
                  ? 'bg-[#fed65b] text-[#241a00] font-bold shadow-sm' 
                  : 'text-[#43474e] hover:bg-[#e5e2da] hover:translate-x-1'
              }`}
            >
              <div className="flex items-center gap-3">
                <FlaskConical className="w-4 h-4 text-emerald-700" />
                <span className="text-sm">Alchemy (Alquimia)</span>
              </div>
              <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full font-mono text-[10px]">
                {events.filter(e => e.month === currentMonth.name && e.type === 'alchemy').length}
              </span>
            </button>
          </nav>

          {/* Quick Stats of Filter */}
          {activeFilter !== 'all' && (
            <div className="mx-4 p-3 bg-[#f1eee5] rounded-xl border border-[#735c00]/10 text-xs parchment-texture">
              <span className="font-caps text-[10px] text-[#735c00] block uppercase mb-1">Filtro Ativo</span>
              <p className="text-[#43474e]">O calendário agora destaca apenas eventos da disciplina <strong className="capitalize text-[#002446]">{activeFilter}</strong>.</p>
              <button 
                onClick={() => setActiveFilter('all')} 
                className="mt-2 text-[#735c00] hover:underline font-semibold flex items-center gap-1 cursor-pointer text-[11px]"
              >
                Limpar filtro ×
              </button>
            </div>
          )}

          {/* Settings / Support at bottom */}
          <div className="mt-auto px-3 space-y-1 pt-4 border-t border-[#c3c6cf]/30">
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

        {/* Central Calendar Panel */}
        <section 
          id="calendar-section"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="flex-1 overflow-y-auto p-6 md:p-8 relative"
          style={{
            backgroundImage: "linear-gradient(rgba(252, 249, 240, 0.88), rgba(252, 249, 240, 0.88)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBcUngGM23uoeLyCKmgB0JNzlCssJXQDwZSnU2vzEMOwP8Pe5mCvwaoiM5vS_hX0o2DfV4jNMZJT0Uezm6eAVV60SIIzJhvMcgZcHS23wiEUjR6MxEZ3DrCr38eosiEEXw5d-x5D8TVfnxWqfkAUr6o7LvTrtA_JnS0H8MMqrOtBGMe6Hl5Weov51NfsRC2zrZMOPzxlEO4GSyg2tN9SMtFeDxfH9sALcZ8l4w91Lxv0MbALuXEqKeu4S7v-EIr0q77Rw')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'local'
          }}
        >
          {/* Custom coordinate tracker glow: Mouse Trail */}
          {trail.visible && (
            <div
              className="absolute pointer-events-none z-50 rounded-full w-[160px] h-[160px] transition-opacity duration-300"
              style={{
                left: trail.x,
                top: trail.y,
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(circle, rgba(171, 200, 245, 0.3) 0%, rgba(171, 200, 245, 0) 70%)',
              }}
            />
          )}

          <div className="mb-6 flex flex-wrap gap-4 justify-between items-end">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl md:text-5xl font-serif text-[#1a3a5f] font-bold tracking-tight">Calendário Acadêmico</h2>
                {activeFilter !== 'all' && (
                  <span className="bg-[#fed65b] text-[#241a00] text-[10px] font-caps px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider animate-pulse border border-[#735c00]/20">
                    Filtro: {activeFilter}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#73777f] font-sans mt-1">Selecione qualquer dia para detalhar no Diário Arcano (Arcane Ledger). Duplo clique adiciona um evento.</p>
            </div>
            
            {/* Nav arrows to cycle months */}
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={prevMonth}
                title="Mês Anterior"
                className="p-2 border border-[#c3c6cf] rounded-lg hover:bg-[#ebe8df] transition-colors cursor-pointer text-[#43474e]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextMonth}
                title="Próximo Mês"
                className="p-2 border border-[#c3c6cf] rounded-lg hover:bg-[#ebe8df] transition-colors cursor-pointer text-[#43474e]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Container */}
          <div className="grid grid-cols-7 gap-3 md:gap-4 select-none">
            {/* Days of Week Headers */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center font-caps text-[11px] md:text-xs text-[#43474e] pb-2 uppercase tracking-widest font-semibold border-b border-[#c3c6cf]/30">
                {day}
              </div>
            ))}

            {/* Calendar Cells */}
            {daysInGrid.map((cell, idx) => {
              const { dayNum, isCurrent, isPrev, isNext } = cell;
              
              // Find events on this day
              const dayEvents = getDayEvents(dayNum, currentMonth.name);
              const hasEvents = dayEvents.length > 0;
              const hasCrystal = dayEvents.some(e => e.crystal);
              const firstEventImage = dayEvents.find(e => e.image)?.image;
              const isSelected = isCurrent && selectedDay === dayNum;
              
              // Non-current month styles
              if (!isCurrent) {
                return (
                  <div 
                    key={`p-${idx}`} 
                    className="h-28 md:h-36 rounded-xl bg-[#f1eee5]/40 opacity-40 border border-[#c3c6cf]/30 p-2 relative flex flex-col justify-between"
                  >
                    <span className="font-serif text-lg text-[#73777f]">{dayNum}</span>
                    <span className="text-[8px] font-caps text-[#73777f]/60 text-right">
                      {isPrev ? 'anterior' : 'próximo'}
                    </span>
                  </div>
                );
              }

              // Highlight matching indicator dots for all events on that day
              const allDayEventsForIndicators = getAllDayEvents(dayNum, currentMonth.name);

              // Is highlighted by current category filter?
              const matchesFilter = isDayHighlightedByFilter(dayNum, currentMonth.name);

              return (
                <div
                  key={`c-${dayNum}`}
                  onClick={() => setSelectedDay(dayNum)}
                  onDoubleClick={() => openCreateModalForDay(dayNum)}
                  className={`h-36 md:h-40 rounded-xl relative filigree-corner parchment-texture hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between p-3 overflow-hidden group border ${
                    isSelected
                      ? 'bg-[#fed65b] border-2 border-[#735c00] shadow-inner today-pulse scale-[1.01]'
                      : 'bg-[#fcf9f0] border-[#735c00]/20 hover:-translate-y-1 hover:border-[#735c00]/60'
                  } ${
                    !matchesFilter && activeFilter !== 'all' ? 'opacity-30' : 'opacity-100'
                  }`}
                >
                  {/* Filigree aesthetic & glowing highlights */}
                  <div className="absolute inset-0 bg-transparent pointer-events-none rounded-xl" />

                  {/* Top Row: Number, Crystals, indicator dots */}
                  <div className="flex justify-between items-start z-10">
                    <span className={`font-serif text-xl md:text-2xl font-bold ${
                      isSelected ? 'text-[#241a00]' : 'text-[#735c00]'
                    }`}>
                      {dayNum < 10 ? `0${dayNum}` : dayNum}
                    </span>

                    {/* Today indicator label */}
                    {dayNum === 3 && currentMonthIdx === 0 && (
                      <span className={`text-[8px] font-caps px-1.5 py-0.5 rounded border leading-none uppercase font-bold tracking-widest ${
                        isSelected 
                          ? 'bg-[#241a00] text-[#fed65b] border-[#fed65b]/20' 
                          : 'bg-[#735c00] text-white border-transparent'
                      }`}>
                        Hoje
                      </span>
                    )}

                    {/* Floating místico crystal */}
                    {hasCrystal && matchesFilter && (
                      <div className="floating-crystal transform scale-90 md:scale-100">
                        <svg fill="none" height="20" viewBox="0 0 16 24" width="14" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 0L16 12L8 24L0 12L8 0Z" fill="#abc8f5" fillOpacity="0.8"></path>
                          <path d="M8 4L12 12L8 20L4 12L8 4Z" fill="white" fillOpacity="0.4"></path>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Indicator dots for multiple events */}
                  {allDayEventsForIndicators.length > 0 && (
                    <div className="absolute top-2 right-12 flex gap-1 z-10">
                      {allDayEventsForIndicators.map((e, index) => {
                        let dotColor = 'bg-[#1a3a5f]'; // spells
                        if (e.type === 'tactics') dotColor = 'bg-[#735c00]';
                        if (e.type === 'alchemy') dotColor = 'bg-emerald-700';
                        if (e.type === 'ritual') dotColor = 'bg-purple-700';
                        
                        return (
                          <div 
                            key={e.id || index} 
                            className={`w-1.5 h-1.5 rounded-full ${dotColor} crystal-glow animate-pulse`} 
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Thumbnail display if any event has an image */}
                  {firstEventImage && matchesFilter ? (
                    <div className="mt-2 w-full h-14 md:h-16 rounded-lg overflow-hidden border border-[#c3c6cf]/50 relative z-10 group-hover:scale-[1.03] transition-transform">
                      <img 
                        className="w-full h-full object-cover" 
                        src={firstEventImage} 
                        alt="Miniatura de evento" 
                        referrerPolicy="no-referrer"
                      />
                      {dayEvents.some(e => e.stars) && (
                        <div className="absolute inset-0 bg-[#735c00]/10 flex items-center justify-center">
                          <Star className="w-4 h-4 text-[#fed65b] fill-[#fed65b] drop-shadow" />
                        </div>
                      )}
                    </div>
                  ) : (
                    // Free day text
                    <div className="mt-4 flex flex-col justify-end text-right">
                      {hasEvents ? (
                        <span className="text-[9px] font-semibold font-sans italic text-[#735c00] opacity-80 truncate">
                          {dayEvents.length} {dayEvents.length === 1 ? 'Atividade' : 'Atividades'}
                        </span>
                      ) : (
                        <span className="text-[8px] font-caps text-[#73777f]/40 uppercase tracking-widest group-hover:text-[#735c00]/50 transition-colors">
                          Livre
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick interactive note below calendar */}
          <div className="mt-8 flex items-center gap-3 p-4 bg-[#f1eee5]/50 rounded-2xl border border-[#735c00]/10 text-xs text-[#43474e] parchment-texture">
            <AlertCircle className="w-5 h-5 text-[#735c00]" />
            <p><strong>Segredo Rúnico:</strong> Você sabia que é possível gerenciar as atividades acadêmicas? Dê um duplo clique sobre qualquer dia do calendário para invocar o painel de criação de eventos imediatos.</p>
          </div>
        </section>

        {/* Right Side: Arcane Ledger Activities Panel */}
        <aside className="w-full lg:w-96 bg-[#f1eee5] shadow-inner border-t lg:border-t-0 lg:border-l border-[#c3c6cf] p-6 overflow-y-auto parchment-texture flex flex-col justify-between relative">
          
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

            {/* Selected Day events listing */}
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#fcf9f0] border border-[#735c00]/10 rounded-2xl parchment-texture space-y-4">
                <div className="w-12 h-12 bg-[#ebe8df] rounded-full flex items-center justify-center mx-auto text-[#73777f]">
                  <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} />
                </div>
                <div>
                  <h4 className="font-serif text-[#002446] font-semibold text-lg">Tempo de Estudo Livre</h4>
                  <p className="text-xs text-[#73777f] mt-1">Sem rituais oficiais agendados para este dia. Aproveite para praticar na Ala de Duelos ou estudar na Biblioteca.</p>
                </div>
                <button 
                  onClick={() => openCreateModalForDay(selectedDay)}
                  className="bg-[#f1eee5] border border-[#735c00]/30 hover:bg-[#fed65b] text-[#241a00] hover:border-[#735c00] text-xs font-caps uppercase tracking-wider py-2 px-4 rounded-xl transition-all flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Registrar Ritual
                </button>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-[2px] before:bg-dotted before:border-l-2 before:border-dotted before:border-[#c3c6cf]">
                
                {selectedDayEvents.map((event) => {
                  // Determine icon and theme for visual rhythm
                  let EventIcon = Wand2;
                  let typeColor = 'text-[#002446]';
                  let typeBg = 'bg-[#d3e3ff]/60 border-[#abc8f5]';

                  if (event.type === 'tactics') {
                    EventIcon = Swords;
                    typeColor = 'text-[#735c00]';
                    typeBg = 'bg-[#ffe088]/40 border-[#fed65b]';
                  } else if (event.type === 'alchemy') {
                    EventIcon = FlaskConical;
                    typeColor = 'text-emerald-800';
                    typeBg = 'bg-emerald-50 border-emerald-300';
                  }

                  return (
                    <div key={event.id} className="relative pl-8 group">
                      {/* Interactive indicator pin node */}
                      <div className="absolute left-0 top-1 w-7 h-7 rounded-full border-2 border-[#735c00] bg-[#fcf9f0] flex items-center justify-center text-[#735c00] z-10 hover:bg-[#fed65b] transition-colors shadow-sm">
                        <EventIcon className="w-3.5 h-3.5" />
                      </div>

                      {/* Delete activity trigger */}
                      <button 
                        onClick={() => handleDeleteEvent(event.id)}
                        title="Deletar Atividade"
                        className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-[#ba1a1a] hover:bg-[#ffdad6] p-1 rounded transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex flex-col gap-2">
                        {/* Time & type indicator */}
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-caps text-[#735c00] font-semibold tracking-widest uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </span>
                          <span className={`text-[9px] font-caps px-2 py-0.5 rounded-full border ${typeBg} ${typeColor} uppercase font-semibold`}>
                            {event.type}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="text-lg font-serif text-[#002446] leading-snug font-bold">
                          {event.title}
                        </h4>

                        {/* Event description */}
                        <p className="text-xs text-[#43474e] leading-relaxed">
                          {event.description}
                        </p>

                        {/* Image banner with blurry instructor tag */}
                        {event.image && (
                          <div className="rounded-xl overflow-hidden border border-[#c3c6cf] h-32 relative shadow-sm my-1 group-hover:shadow transition-shadow">
                            <img 
                              className="w-full h-full object-cover" 
                              src={event.image} 
                              alt={event.title}
                              referrerPolicy="no-referrer"
                            />
                            {event.instructor && (
                              <div className="absolute bottom-0 inset-x-0 bg-[#002446]/75 backdrop-blur-sm px-3 py-1.5 text-[9px] text-white font-caps uppercase tracking-widest flex justify-between">
                                <span>Instrutor: {event.instructor}</span>
                                <span className="text-[#fed65b]">M MBA</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Instructor fallback without image */}
                        {!event.image && event.instructor && (
                          <div className="text-[10px] font-caps text-[#73777f] uppercase bg-[#e5e2da]/40 p-2 rounded-lg border border-[#c3c6cf]/20">
                            <strong>Orientador:</strong> {event.instructor}
                          </div>
                        )}

                        {/* Interactive mana requirements stats */}
                        {event.manaProgress > 0 && (
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

          {/* Dynamic Footer stats panel card */}
          <div className="mt-8 pt-6 border-t border-[#c3c6cf] space-y-4 bg-[#fcf9f0]/40 p-4 rounded-xl border border-[#735c00]/10 parchment-texture">
            <div>
              <span className="text-[10px] font-caps text-[#735c00] uppercase tracking-wider block">Consid. do Archmage</span>
              <p className="text-xs text-[#73777f]">Média de fluxo de mana exigido no período letivo do dia: {maxManaRequired > 0 ? `${maxManaRequired}% Mestre` : 'Nenhum'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#e5e2da]/70 p-3 rounded-xl border border-[#c3c6cf]/40 text-center">
                <p className="text-[10px] font-caps text-[#43474e] uppercase font-semibold">Vagas Totais</p>
                <p className="text-xl font-bold text-[#002446] mt-0.5">{selectedDaySpots}</p>
              </div>
              <div className="bg-[#e5e2da]/70 p-3 rounded-xl border border-[#c3c6cf]/40 text-center">
                <p className="text-[10px] font-caps text-[#43474e] uppercase font-semibold">Rank Período</p>
                <p className="text-xl font-bold text-[#735c00] mt-0.5">{selectedDayRank}</p>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Creation Modal (Invocação de Atividades) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#002446]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-[#fcf9f0] border-2 border-[#735c00] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden relative parchment-texture"
            >
              {/* Gold borders */}
              <div className="h-1.5 bg-[#735c00] w-full" />
              
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-center border-b border-[#c3c6cf]/40 pb-4">
                  <div>
                    <h3 className="text-2xl font-serif text-[#735c00] font-bold flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-[#fed65b] fill-[#fed65b]" />
                      Novo Ritual de Aprendizado
                    </h3>
                    <p className="text-xs text-[#73777f]">Inscreva uma aula mística no calendário da Majestic Battle Academy.</p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 rounded-full hover:bg-[#e5e2da] text-[#43474e] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Day Selector */}
                    <div>
                      <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                        Dia do Mês
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max={currentMonth.daysCount}
                        required
                        value={newEventDay}
                        onChange={(e) => setNewEventDay(Number(e.target.value))}
                        className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                      />
                    </div>

                    {/* Time Input */}
                    <div>
                      <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                        Horário (Período)
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: 09:00 — 11:30"
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                      Nome da Disciplina / Atividade
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Tática de Combate Avançado contra Seres de Trevas"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Instructor */}
                    <div>
                      <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                        Instrutor Responsável
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex: Mestre Valerius"
                        value={newEventInstructor}
                        onChange={(e) => setNewEventInstructor(e.target.value)}
                        className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                      />
                    </div>

                    {/* Type Selector */}
                    <div>
                      <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                        Tipo de Disciplina
                      </label>
                      <select 
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value as EventType)}
                        className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30"
                      >
                        <option value="spells">Magia (Spells)</option>
                        <option value="tactics">Tática de Batalha (Tactics)</option>
                        <option value="alchemy">Alquimia (Alchemy)</option>
                        <option value="ritual">Ritual Sagrado (Ritual)</option>
                        <option value="other">Outros Saberes</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                      Descrição Detalhada do Saber
                    </label>
                    <textarea 
                      rows={3}
                      placeholder="Indique as orientações e materiais misticos exigidos aos estudantes..."
                      value={newEventDesc}
                      onChange={(e) => setNewEventDesc(e.target.value)}
                      className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#735c00]/30 resize-none"
                    />
                  </div>

                  {/* Illustration Image Preset Picker Grid */}
                  <div>
                    <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                      Presetação Visual Ilustrativa
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {IMAGE_PRESETS.map((p) => {
                        const isSelected = newEventImage === p.url;
                        return (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => setNewEventImage(p.url)}
                            className={`h-12 rounded-lg overflow-hidden relative border-2 cursor-pointer transition-all ${
                              isSelected ? 'border-[#735c00] scale-105 shadow' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                            title={p.name}
                          >
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#735c00]/20 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white drop-shadow font-bold" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {/* Manual URL input fallback */}
                    <input 
                      type="text"
                      placeholder="Ou cole uma URL customizada de imagem"
                      value={newEventImage}
                      onChange={(e) => setNewEventImage(e.target.value)}
                      className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-3 py-1.5 text-xs focus:outline-none mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Mana progress requirement slider */}
                    <div>
                      <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                        Requisito de Mana: {newEventMana}%
                      </label>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={newEventMana}
                        onChange={(e) => setNewEventMana(Number(e.target.value))}
                        className="w-full accent-[#735c00]"
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                          Vagas
                        </label>
                        <input 
                          type="text"
                          value={newEventSpots}
                          onChange={(e) => setNewEventSpots(e.target.value)}
                          placeholder="12/40"
                          className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-2 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-caps uppercase tracking-wider text-[#735c00] mb-1 font-semibold">
                          Rank
                        </label>
                        <select 
                          value={newEventRank}
                          onChange={(e) => setNewEventRank(e.target.value)}
                          className="w-full bg-[#f1eee5] border border-[#c3c6cf] rounded-xl px-2 py-1.5 text-xs focus:outline-none"
                        >
                          <option value="S-Class">S-Class</option>
                          <option value="A-Class">A-Class</option>
                          <option value="B-Class">B-Class</option>
                          <option value="C-Class">C-Class</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Checkbox options */}
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 text-xs text-[#43474e] cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newEventCrystal}
                        onChange={(e) => setNewEventCrystal(e.target.checked)}
                        className="accent-[#735c00] cursor-pointer rounded"
                      />
                      Mostrar Cristal Flutuante
                    </label>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-[#c3c6cf]/40">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="bg-[#ebe8df] hover:bg-[#e5e2da] text-[#43474e] text-xs font-caps uppercase tracking-wider px-5 py-3 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="bg-[#002446] hover:brightness-110 text-white text-xs font-caps uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow cursor-pointer border border-[#abc8f5]/20"
                    >
                      Inscrever Registro
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
