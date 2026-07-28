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

export interface RecipeIngredientItem {
  quantity: string;
  unit: string;
  name: string;
}

export interface RecipeIngredientSection {
  section_name: string;
  items: RecipeIngredientItem[];
}

export interface RecipeInstructionSection {
  section_name: string;
  steps: string[];
}

export interface RecipeLoreQuote {
  speaker: string;
  text: string;
  icon?: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  category: string;
  regional_cuisine: string;
  description: string;
  lore_quotes: RecipeLoreQuote[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prep_time: string;
  inactive_time: string;
  cook_time: string;
  yield_text: string;
  dietary_notes: string;
  equipment: string;
  ingredient_sections: RecipeIngredientSection[];
  instruction_sections: RecipeInstructionSection[];
  cover_image: string;
  status: 'published' | 'draft';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeCategory {
  id: string;
  key: string;
  label: string;
  icon: string;
  sort_order: number;
}
