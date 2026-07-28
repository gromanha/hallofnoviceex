import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Trash2, ChefHat, Plus, Minus, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe, RecipeIngredientSection, RecipeIngredientItem, RecipeInstructionSection, RecipeLoreQuote } from '../types';
import { useEscapeKey } from '../lib/useEscapeKey';
import { ConfirmDialog } from './ConfirmDialog';

interface RecipeModalProps {
  recipe: Partial<Recipe> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Recipe>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const EMPTY_INGREDIENT_ITEM: RecipeIngredientItem = { quantity: '', unit: '', name: '' };
const EMPTY_INGREDIENT_SECTION: RecipeIngredientSection = { section_name: '', items: [{ ...EMPTY_INGREDIENT_ITEM }] };
const EMPTY_INSTRUCTION_SECTION: RecipeInstructionSection = { section_name: '', steps: [''] };
const EMPTY_LORE_QUOTE: RecipeLoreQuote = { speaker: '', text: '', icon: '' };

export const RecipeModal: React.FC<RecipeModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('main_dishes');
  const [regionalCuisine, setRegionalCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [loreQuotes, setLoreQuotes] = useState<RecipeLoreQuote[]>([]);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [prepTime, setPrepTime] = useState('');
  const [inactiveTime, setInactiveTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [yieldText, setYieldText] = useState('');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [equipment, setEquipment] = useState('');
  const [ingredientSections, setIngredientSections] = useState<RecipeIngredientSection[]>([{ ...EMPTY_INGREDIENT_SECTION }]);
  const [instructionSections, setInstructionSections] = useState<RecipeInstructionSection[]>([{ ...EMPTY_INSTRUCTION_SECTION }]);
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title || '');
      setCategory(recipe.category || 'main_dishes');
      setRegionalCuisine(recipe.regional_cuisine || '');
      setDescription(recipe.description || '');
      setLoreQuotes(recipe.lore_quotes?.length ? recipe.lore_quotes : []);
      setDifficulty(recipe.difficulty || 'Easy');
      setPrepTime(recipe.prep_time || '');
      setInactiveTime(recipe.inactive_time || '');
      setCookTime(recipe.cook_time || '');
      setYieldText(recipe.yield_text || '');
      setDietaryNotes(recipe.dietary_notes || '');
      setEquipment(recipe.equipment || '');
      setIngredientSections(recipe.ingredient_sections?.length ? recipe.ingredient_sections : [{ ...EMPTY_INGREDIENT_SECTION }]);
      setInstructionSections(recipe.instruction_sections?.length ? recipe.instruction_sections : [{ ...EMPTY_INSTRUCTION_SECTION }]);
      setCoverImage(recipe.cover_image || '');
      setStatus(recipe.status === 'draft' ? 'draft' : 'published');
    } else {
      setTitle('');
      setCategory('main_dishes');
      setRegionalCuisine('');
      setDescription('');
      setLoreQuotes([]);
      setDifficulty('Easy');
      setPrepTime('');
      setInactiveTime('');
      setCookTime('');
      setYieldText('');
      setDietaryNotes('');
      setEquipment('');
      setIngredientSections([{ ...EMPTY_INGREDIENT_SECTION }]);
      setInstructionSections([{ ...EMPTY_INSTRUCTION_SECTION }]);
      setCoverImage('');
      setStatus('published');
    }
    setErrorMsg('');
  }, [recipe, isOpen]);

  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEscapeKey(onClose, isOpen);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Titulo e obrigatorio.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      await onSave({
        id: recipe?.id,
        title: title.trim(),
        category,
        regional_cuisine: regionalCuisine.trim(),
        description: description.trim(),
        lore_quotes: loreQuotes.filter(q => q.text.trim()),
        difficulty,
        prep_time: prepTime.trim(),
        inactive_time: inactiveTime.trim(),
        cook_time: cookTime.trim(),
        yield_text: yieldText.trim(),
        dietary_notes: dietaryNotes.trim(),
        equipment: equipment.trim(),
        ingredient_sections: ingredientSections.filter(s => s.items.some(i => i.name.trim())),
        instruction_sections: instructionSections.filter(s => s.steps.some(st => st.trim())),
        cover_image: coverImage.trim(),
        status,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Nao foi possivel salvar a receita.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!recipe?.id || !onDelete) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!recipe?.id || !onDelete) return;
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      await onDelete(recipe.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Nao foi possivel excluir a receita.');
    } finally {
      setDeleting(false);
    }
  };

  // Lore Quotes helpers
  const addLoreQuote = () => setLoreQuotes(prev => [...prev, { ...EMPTY_LORE_QUOTE }]);
  const removeLoreQuote = (i: number) => setLoreQuotes(prev => prev.filter((_, idx) => idx !== i));
  const updateLoreQuote = (i: number, field: keyof RecipeLoreQuote, val: string) =>
    setLoreQuotes(prev => prev.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  // Ingredient Section helpers
  const addIngredientSection = () => setIngredientSections(prev => [...prev, { ...EMPTY_INGREDIENT_SECTION, section_name: '', items: [{ ...EMPTY_INGREDIENT_ITEM }] }]);
  const removeIngredientSection = (si: number) => setIngredientSections(prev => prev.filter((_, idx) => idx !== si));
  const updateSectionName = (si: number, val: string) =>
    setIngredientSections(prev => prev.map((s, idx) => idx === si ? { ...s, section_name: val } : s));
  const addIngredientItem = (si: number) =>
    setIngredientSections(prev => prev.map((s, idx) => idx === si ? { ...s, items: [...s.items, { ...EMPTY_INGREDIENT_ITEM }] } : s));
  const removeIngredientItem = (si: number, ii: number) =>
    setIngredientSections(prev => prev.map((s, idx) => idx === si ? { ...s, items: s.items.filter((_, i) => i !== ii) } : s));
  const updateIngredientItem = (si: number, ii: number, field: keyof RecipeIngredientItem, val: string) =>
    setIngredientSections(prev => prev.map((s, idx) => idx === si ? { ...s, items: s.items.map((item, i) => i === ii ? { ...item, [field]: val } : item) } : s));

  // Instruction Section helpers
  const addInstructionSection = () => setInstructionSections(prev => [...prev, { ...EMPTY_INSTRUCTION_SECTION, section_name: '', steps: [''] }]);
  const removeInstructionSection = (si: number) => setInstructionSections(prev => prev.filter((_, idx) => idx !== si));
  const updateInstructionSectionName = (si: number, val: string) =>
    setInstructionSections(prev => prev.map((s, idx) => idx === si ? { ...s, section_name: val } : s));
  const addStep = (si: number) =>
    setInstructionSections(prev => prev.map((s, idx) => idx === si ? { ...s, steps: [...s.steps, ''] } : s));
  const removeStep = (si: number, sti: number) =>
    setInstructionSections(prev => prev.map((s, idx) => idx === si ? { ...s, steps: s.steps.filter((_, i) => i !== sti) } : s));
  const updateStep = (si: number, sti: number, val: string) =>
    setInstructionSections(prev => prev.map((s, idx) => idx === si ? { ...s, steps: s.steps.map((st, i) => i === sti ? val : st) } : s));

  const CATEGORY_OPTIONS = [
    { value: 'breakfast', label: 'Cafe da Manha' },
    { value: 'appetizers', label: 'Aperitivos' },
    { value: 'breads', label: 'Paes' },
    { value: 'soups_stews', label: 'Sopas e Ensopados' },
    { value: 'main_dishes', label: 'Pratos Principais' },
    { value: 'sides', label: 'Acompanhamentos' },
    { value: 'desserts', label: 'Sobremesas' },
    { value: 'drinks', label: 'Bebidas' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="recipe-modal"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={recipe?.id ? 'Editar receita' : 'Nova receita'}
          onClick={onClose}
        >
          <div className="bg-[var(--color-surface)] border border-[var(--color-secondary)]/50 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-accent)] text-[var(--color-on-secondary)] flex items-center justify-between border-b border-[var(--color-primary)]/30">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                <h2 className="font-serif font-bold text-lg">
                  {recipe?.id ? 'Editar Receita' : 'Nova Receita'}
                </h2>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors" aria-label="Fechar modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              {errorMsg && (
                <div className="mx-6 mt-4 p-3 bg-[var(--color-crimson)]/10 border border-[var(--color-crimson)]/30 text-[var(--color-crimson)] rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="p-6 overflow-y-auto space-y-5 flex-1">

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Titulo da Receita *</label>
                  <input ref={titleInputRef} type="text" required value={title} onChange={e => setTitle(e.target.value)} maxLength={200} className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" />
                </div>

                {/* Category, Regional Cuisine, Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Categoria</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none font-medium">
                      {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Regional Cuisine</label>
                    <input type="text" value={regionalCuisine} onChange={e => setRegionalCuisine(e.target.value)} placeholder="ex: La Noscea" className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Dificuldade</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none font-medium">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Descricao / Lore</label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-none" />
                </div>

                {/* Lore Quotes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider">Lore Quotes</label>
                    <button type="button" onClick={addLoreQuote} className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:underline">
                      <Plus className="w-3 h-3" /> Nova Quote
                    </button>
                  </div>
                  {loreQuotes.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <input type="text" value={q.speaker} onChange={e => updateLoreQuote(i, 'speaker', e.target.value)} placeholder="Personagem" className="w-1/4 px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-xs focus:outline-none" />
                      <input type="text" value={q.text} onChange={e => updateLoreQuote(i, 'text', e.target.value)} placeholder="Fala do personagem..." className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-xs focus:outline-none" />
                      <input type="text" value={q.icon || ''} onChange={e => updateLoreQuote(i, 'icon', e.target.value)} placeholder="Icone" className="w-16 px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-xs focus:outline-none" />
                      <button type="button" onClick={() => removeLoreQuote(i)} className="p-1.5 rounded-lg hover:bg-[var(--color-crimson)]/10 text-[var(--color-crimson)]"><Minus className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Prep Time</label>
                    <input type="text" value={prepTime} onChange={e => setPrepTime(e.target.value)} placeholder="30 min" className="w-full px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-xs focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Inactive Time</label>
                    <input type="text" value={inactiveTime} onChange={e => setInactiveTime(e.target.value)} placeholder="1 hr" className="w-full px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-xs focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Cook Time</label>
                    <input type="text" value={cookTime} onChange={e => setCookTime(e.target.value)} placeholder="25 min" className="w-full px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-xs focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Yield</label>
                    <input type="text" value={yieldText} onChange={e => setYieldText(e.target.value)} placeholder="6 servings" className="w-full px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-xs focus:outline-none" />
                  </div>
                </div>

                {/* Dietary + Equipment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Dietary Notes</label>
                    <input type="text" value={dietaryNotes} onChange={e => setDietaryNotes(e.target.value)} placeholder="Vegetarian, Gluten-free..." className="w-full px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-xs focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">Equipment</label>
                    <input type="text" value={equipment} onChange={e => setEquipment(e.target.value)} placeholder="Saucepan, cutting board..." className="w-full px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-xs focus:outline-none" />
                  </div>
                </div>

                {/* Ingredient Sections */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider">Ingredientes por Secao</label>
                    <button type="button" onClick={addIngredientSection} className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:underline">
                      <Plus className="w-3 h-3" /> Nova Secao
                    </button>
                  </div>
                  {ingredientSections.map((section, si) => (
                    <div key={si} className="mb-4 p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)]">
                      <div className="flex items-center gap-2 mb-2">
                        <input type="text" value={section.section_name} onChange={e => updateSectionName(si, e.target.value)} placeholder="Nome da secao (ex: Milk Mixture)" className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-xs font-bold focus:outline-none" />
                        {ingredientSections.length > 1 && (
                          <button type="button" onClick={() => removeIngredientSection(si)} className="p-1 rounded hover:bg-[var(--color-crimson)]/10 text-[var(--color-crimson)]"><Minus className="w-4 h-4" /></button>
                        )}
                      </div>
                      {section.items.map((item, ii) => (
                        <div key={ii} className="flex items-center gap-2 mb-1">
                          <input type="text" value={item.quantity} onChange={e => updateIngredientItem(si, ii, 'quantity', e.target.value)} placeholder="Qtd" className="w-16 px-2 py-1.5 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-xs focus:outline-none" />
                          <input type="text" value={item.unit} onChange={e => updateIngredientItem(si, ii, 'unit', e.target.value)} placeholder="Unidade" className="w-20 px-2 py-1.5 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-xs focus:outline-none" />
                          <input type="text" value={item.name} onChange={e => updateIngredientItem(si, ii, 'name', e.target.value)} placeholder="Ingrediente" className="flex-1 px-2 py-1.5 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-xs focus:outline-none" />
                          {section.items.length > 1 && (
                            <button type="button" onClick={() => removeIngredientItem(si, ii)} className="p-1 rounded hover:bg-slate-200 text-slate-400"><X className="w-3 h-3" /></button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addIngredientItem(si)} className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:underline mt-1">
                        <Plus className="w-3 h-3" /> Ingrediente
                      </button>
                    </div>
                  ))}
                </div>

                {/* Instruction Sections */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider">Instrucoes por Secao</label>
                    <button type="button" onClick={addInstructionSection} className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:underline">
                      <Plus className="w-3 h-3" /> Nova Secao
                    </button>
                  </div>
                  {instructionSections.map((section, si) => (
                    <div key={si} className="mb-4 p-3 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)]">
                      <div className="flex items-center gap-2 mb-2">
                        <input type="text" value={section.section_name} onChange={e => updateInstructionSectionName(si, e.target.value)} placeholder="Nome da secao (ex: Milk Mixture)" className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-xs font-bold focus:outline-none" />
                        {instructionSections.length > 1 && (
                          <button type="button" onClick={() => removeInstructionSection(si)} className="p-1 rounded hover:bg-[var(--color-crimson)]/10 text-[var(--color-crimson)]"><Minus className="w-4 h-4" /></button>
                        )}
                      </div>
                      {section.steps.map((step, sti) => (
                        <div key={sti} className="flex items-center gap-2 mb-1">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold flex items-center justify-center">{sti + 1}</span>
                          <input type="text" value={step} onChange={e => updateStep(si, sti, e.target.value)} placeholder="Passo da instrucao..." className="flex-1 px-2 py-1.5 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-xs focus:outline-none" />
                          {section.steps.length > 1 && (
                            <button type="button" onClick={() => removeStep(si, sti)} className="p-1 rounded hover:bg-slate-200 text-slate-400"><X className="w-3 h-3" /></button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addStep(si)} className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-primary)] hover:underline mt-1">
                        <Plus className="w-3 h-3" /> Passo
                      </button>
                    </div>
                  ))}
                </div>

                {/* Cover Image + Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">URL da Imagem de Capa</label>
                    <input type="url" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none" />
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-xs font-bold uppercase text-[var(--color-on-surface)]">Status:</span>
                    <button type="button" onClick={() => setStatus('published')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${status === 'published' ? 'bg-[var(--color-sage)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)]'}`}>Publicado</button>
                    <button type="button" onClick={() => setStatus('draft')} className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${status === 'draft' ? 'bg-[var(--color-amber)] text-white' : 'bg-[var(--color-surface-alt)] text-[var(--color-on-surface-variant)]'}`}>Rascunho</button>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[var(--color-surface-alt)] border-t border-[var(--color-outline-variant)] flex items-center justify-between">
                {recipe?.id && onDelete ? (
                  <button type="button" onClick={handleDelete} disabled={deleting || saving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[var(--color-crimson)] border border-[var(--color-crimson)]/30 hover:bg-[var(--color-crimson)]/10 text-xs font-bold transition-all disabled:opacity-50">
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Excluindo...' : 'Excluir Receita'}
                  </button>
                ) : <div />}
                <div className="flex items-center gap-3">
                  <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-xs font-bold hover:bg-[var(--color-surface-alt)] transition-all">Cancelar</button>
                  <button type="submit" disabled={saving || deleting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50">
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar Receita'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <ConfirmDialog
            open={showDeleteConfirm}
            title="Excluir receita"
            message={`Excluir a receita "${title}"? Esta acao nao pode ser desfeita.`}
            onConfirm={confirmDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
