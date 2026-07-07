export type EventType = 'spells' | 'tactics' | 'alchemy' | 'ritual' | 'other';

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
  manaProgress: number; // Percentage (e.g. 70)
  spots: string; // e.g. "12/40"
  rank: string; // e.g. "S-Class", "A-Class"
  crystal?: boolean; // Show floating crystal icon
  stars?: boolean; // Show star over thumbnail
  indicators?: string[]; // Color list e.g. ['primary', 'secondary', 'error']
}

export interface MonthData {
  name: string;
  cycle: string;
  daysCount: number;
  offset: number; // Offset days for grid alignment (prev month overflow)
  prevMonthDays: number[];
}
