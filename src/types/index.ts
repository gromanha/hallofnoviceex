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
  month: string;
  day: number;
  time: string;
  title: string;
  description: string;
  instructor?: string;
  image?: string;
  type: EventType;
  crystal?: boolean;
  stars?: boolean;
  indicators?: string[];
  mana_progress?: number;
  spots?: number;
  rank?: string;
}

export interface MonthData {
  name: string;
  cycle: string;
  daysCount: number;
  offset: number;
  prevMonthDays: number[];
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  category: 'noticias' | 'codice' | 'guias' | 'anuncios' | 'crafting' | string;
  author_name: string;
  author_id?: string;
  cover_image: string;
  tags: string[];
  is_pinned: boolean;
  status: 'published' | 'draft' | 'archived';
  published_at: string;
  created_at: string;
  updated_at?: string;
}

export interface AdminUser {
  username: string;
  display_name: string;
}
