export const RECIPE_CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  breakfast:    { bg: 'bg-[var(--color-cat-breakfast)]/10', text: 'text-[var(--color-cat-breakfast)]', dot: 'var(--color-cat-breakfast)' },
  appetizers:   { bg: 'bg-[var(--color-cat-appetizers)]/10', text: 'text-[var(--color-cat-appetizers)]', dot: 'var(--color-cat-appetizers)' },
  breads:       { bg: 'bg-[var(--color-cat-breads)]/10', text: 'text-[var(--color-cat-breads)]', dot: 'var(--color-cat-breads)' },
  soups_stews:  { bg: 'bg-[var(--color-cat-soups)]/10', text: 'text-[var(--color-cat-soups)]', dot: 'var(--color-cat-soups)' },
  main_dishes:  { bg: 'bg-[var(--color-cat-main)]/10', text: 'text-[var(--color-cat-main)]', dot: 'var(--color-cat-main)' },
  sides:        { bg: 'bg-[var(--color-cat-sides)]/10', text: 'text-[var(--color-cat-sides)]', dot: 'var(--color-cat-sides)' },
  desserts:     { bg: 'bg-[var(--color-cat-desserts)]/10', text: 'text-[var(--color-cat-desserts)]', dot: 'var(--color-cat-desserts)' },
  drinks:       { bg: 'bg-[var(--color-cat-drinks)]/10', text: 'text-[var(--color-cat-drinks)]', dot: 'var(--color-cat-drinks)' },
};

export const POST_CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  codice:   { bg: 'bg-[var(--color-secondary)]/10', text: 'text-[var(--color-secondary)]', dot: 'var(--color-secondary)' },
  guias:    { bg: 'bg-[var(--color-crimson)]/10', text: 'text-[var(--color-crimson)]', dot: 'var(--color-crimson)' },
  crafting: { bg: 'bg-[var(--color-cat-sides)]/10', text: 'text-[var(--color-cat-sides)]', dot: 'var(--color-cat-sides)' },
  noticias: { bg: 'bg-[var(--color-tertiary)]/10', text: 'text-[var(--color-tertiary)]', dot: 'var(--color-tertiary)' },
};

export function getRecipeCategoryColor(category: string | null | undefined) {
  return RECIPE_CATEGORY_COLORS[category || ''] || { bg: 'bg-[var(--color-primary)]/10', text: 'text-[var(--color-primary)]', dot: 'var(--color-primary)' };
}

export function getPostCategoryColor(category: string | null | undefined) {
  return POST_CATEGORY_COLORS[category || ''] || { bg: 'bg-[var(--color-primary)]/10', text: 'text-[var(--color-primary)]', dot: 'var(--color-primary)' };
}
