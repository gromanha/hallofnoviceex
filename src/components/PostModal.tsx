import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Eye, Edit3, Pin, Sparkles, Image, Tag as TagIcon } from 'lucide-react';
import { Post } from '../types';

interface PostModalProps {
  post: Partial<Post> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Post>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const PostModal: React.FC<PostModalProps> = ({
  post,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('noticias');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [slug, setSlug] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setSubtitle(post.subtitle || '');
      setCategory(post.category || 'noticias');
      setContent(post.content || '');
      setCoverImage(post.cover_image || '');
      setTagsStr(post.tags ? post.tags.join(', ') : '');
      setIsPinned(Boolean(post.is_pinned));
      setStatus(post.status === 'draft' ? 'draft' : 'published');
      setSlug(post.slug || '');
    } else {
      setTitle('');
      setSubtitle('');
      setCategory('noticias');
      setContent('');
      setCoverImage('');
      setTagsStr('');
      setIsPinned(false);
      setStatus('published');
      setSlug('');
    }
    setErrorMsg('');
    setActiveTab('editor');
  }, [post, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('Título e Conteúdo são obrigatórios.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const tags = tagsStr
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await onSave({
        id: post?.id,
        title: title.trim(),
        subtitle: subtitle.trim(),
        category,
        content,
        cover_image: coverImage.trim(),
        tags,
        is_pinned: isPinned,
        status,
        slug: slug.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao salvar postagem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!post?.id || !onDelete) return;
    if (!confirm(`Certeza que deseja excluir a postagem "${title}"?`)) return;

    setDeleting(true);
    try {
      await onDelete(post.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha ao excluir postagem.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--color-surface)] border border-[#D4AF37]/50 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#1D6A6A] to-[#124949] text-white flex items-center justify-between border-b border-[#D4AF37]/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif font-bold text-lg text-[#F5E6B8]">
              {post?.id ? 'Editar Postagem' : 'Nova Postagem / Guia'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch & Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            
            {/* Linha 1: Título e Slug */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">
                  Título da Postagem *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="ex: Tratado Completo da Zodiac Weapon"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[#1D6A6A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[#1D6A6A] focus:outline-none font-medium"
                >
                  <option value="noticias">Notícias</option>
                  <option value="codice">Códice</option>
                  <option value="guias">Guias de Combate</option>
                  <option value="crafting">Crafting & Gathering</option>
                  <option value="anuncios">Anúncios</option>
                </select>
              </div>
            </div>

            {/* Subtítulo */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5">
                Subtítulo / Resumo Curto
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                placeholder="Breve resumo da postagem exibido no card de listagem"
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[#1D6A6A] focus:outline-none"
              />
            </div>

            {/* Imagem de Capa e Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Image className="w-3.5 h-3.5" />
                  URL da Imagem de Capa
                </label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpeg"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[#1D6A6A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <TagIcon className="w-3.5 h-3.5" />
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={e => setTagsStr(e.target.value)}
                  placeholder="ex: ffxiv, extreme, sharlayan"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[#1D6A6A] focus:outline-none"
                />
              </div>
            </div>

            {/* Opções de Publicação (Status e Pinned) */}
            <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold uppercase text-[var(--color-on-surface)]">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1D6A6A] focus:ring-[#1D6A6A]"
                />
                <Pin className="w-3.5 h-3.5 text-[#D4AF37]" />
                Fixar em Destaque na Home
              </label>

              <div className="flex items-center gap-3 ml-auto">
                <span className="text-xs font-bold uppercase text-[var(--color-on-surface)]">Status:</span>
                <button
                  type="button"
                  onClick={() => setStatus('published')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    status === 'published'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Publicado
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('draft')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    status === 'draft'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Rascunho
                </button>
              </div>
            </div>

            {/* Editor de Conteúdo com Abas Editor / Pré-visualização */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[var(--color-on-surface)] uppercase tracking-wider">
                  Conteúdo da Postagem (Formatação Markdown / HTML) *
                </label>

                <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                      activeTab === 'editor' ? 'bg-white dark:bg-slate-700 text-[#1D6A6A] font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                      activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-[#1D6A6A] font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Pré-visualização
                  </button>
                </div>
              </div>

              {activeTab === 'editor' ? (
                <textarea
                  required
                  rows={12}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Escreva seu artigo em Markdown... ex: &#10;## Título da Seção &#10;Texto explicativo aqui...&#10;- Item 1&#10;- Item 2"
                  className="w-full px-4 py-3 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] text-[var(--color-on-surface)] font-mono text-sm focus:ring-2 focus:ring-[#1D6A6A] focus:outline-none leading-relaxed"
                />
              ) : (
                <div className="min-h-[300px] p-6 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-background)] prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
                </div>
              )}
            </div>

          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 bg-slate-100 dark:bg-slate-900 border-t border-[var(--color-outline-variant)] flex items-center justify-between">
            {post?.id && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Excluindo...' : 'Excluir Postagem'}
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1D6A6A] hover:bg-[#2A8A8A] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Postagem'}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
