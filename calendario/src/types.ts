export type EventType = string;

export interface EventTypeItem {
  id: string;
  key: string;
  label: string;
  color: string;
  icon: string;
  sort_order: number;
}

export interface MagicalEvent {
  id: string;
  month: string; // e.g. "Mês das Plêiades"
  day: number;
  time: string; // e.g. "09:00 — 11:30"
  title: string;
  description: string;
  instructor?: string;
  image?: string; // Optional image link
  type: EventType;
  crystal?: boolean; // Show floating crystal icon
  stars?: boolean; // Show star over thumbnail
  indicators?: string[]; // Color list e.g. ['primary', 'secondary', 'error']
  mana_progress?: number; // Mana requirement percentage (snake_case from API)
  spots?: number; // Available spots
  rank?: string; // Event rank
}

export interface MonthData {
  name: string;
  cycle: string;
  daysCount: number;
  offset: number; // Offset days for grid alignment (prev month overflow)
  prevMonthDays: number[];
}
