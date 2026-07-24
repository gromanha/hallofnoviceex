import React, { useState, useEffect } from 'react';
import {
  Calendar, BookOpen, Plus, Edit3, Trash2, Pin, Search, Filter, ShieldCheck, Sparkles, LogOut, Check, Eye
} from 'lucide-react';
import { Post, MagicalEvent, EventTypeItem, AdminUser } from '../types';
import { apiGet, apiPost, apiPatch, apiDel } from '../lib/api';
import { PostModal } from '../components/PostModal';

interface AdminPageProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ admin, onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts');
  
  // States for Posts Manager
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsSearch, setPostsSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedPost, setSelectedPost] = useState<Partial<Post> | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // States for Calendar Events Manager
  const [events, setEvents] = useState<MagicalEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Load Posts
  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      let url = '/api/posts?status=all';
      if (postsSearch) url += `&search=${encodeURIComponent(postsSearch)}`;
      const data = await apiGet<Post[]>(url);
      setPosts(data || []);
    } catch (err) {
      console.error('Erro ao carregar postagens no admin:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Load Events
  const loadEvents = async () => {
    setLoadingEvents(true);
    try {
      const [evs, types] = await Promise.all([
        apiGet<MagicalEvent[]>('/api/events'),
        apiGet<EventTypeItem[]>('/api/event-types'),
      ]);
      setEvents(evs || []);
      setEventTypes(types || []);
    } catch (err) {
      console.error('Erro ao carregar eventos no admin:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'posts') {
      loadPosts();
    } else {
      loadEvents();
    }
  }, [activeTab, postsSearch]);

  // Post Actions
  const handleSavePost = async (postData: Partial<Post>) => {
    if (postData.id) {
      await apiPatch('/api/posts', postData);
    } else {
      await apiPost('/api/posts', postData);
    }
    await loadPosts();
  };

  const handleDeletePost = async (id: string) => {
    await apiDel('/api/posts', { id });
    await loadPosts();
  };

  const handleTogglePin = async (post: Post) => {
    try {
      await apiPatch('/api/posts', { id: post.id, is_pinned: !post.is_pinned });
      await loadPosts();
    } catch (err) {
      console.error('Erro ao alternar destaque:', err);
    }
  };

  const handleToggleStatus = async (post: Post) => {
    try {
      const nextStatus = post.status === 'published' ? 'draft' : 'published';
      await apiPatch('/api/posts', { id: post.id, status: nextStatus });
      await loadPosts();
    } catch (err) {
      console.error('Erro ao alternar status:', err);
    }
  };

  const filteredPosts = posts.filter(p => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header do Painel Admin */}
      <div className="bg-gradient-to-r from-[#1D6A6A] via-[#124949] to-[#121921] rounded-3xl p-8 text-white border-2 border-[#D4AF37] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6B8] text-xs font-bold uppercase">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            Área de Administração Reitoral
          </div>
          <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#F5E6B8]">
            Painel Administrativo Unificado
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90">
            Conectado como <strong className="text-white">{admin.display_name}</strong> (@{admin.username})
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0"
        >
          <LogOut className="w-4 h-4" /> Sair do Painel
        </button>
      </div>

      {/* Abas de Gerenciamento */}
      <div className="flex items-center gap-2 border-b border-[var(--color-outline-variant)] pb-3">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-serif font-bold text-sm transition-all ${
            activeTab === 'posts'
              ? 'bg-[#1D6A6A] text-white shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#D4AF37]" />
          Postagens & Códices ({posts.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-serif font-bold text-sm transition-all ${
            activeTab === 'events'
              ? 'bg-[#1D6A6A] text-white shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          Eventos do Calendário ({events.length})
        </button>
      </div>

      {/* ABA 1: POSTAGENS DO SITE */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          
          {/* Controles: Criar Postagem, Busca, Filtros */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-outline-variant)] shadow-xs">
            
            <button
              onClick={() => {
                setSelectedPost(null);
                setIsPostModalOpen(true);
              }}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#1D6A6A] hover:bg-[#2A8A8A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" /> Nova Postagem / Guia
            </button>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              
              {/* Filtro de Status */}
              <div className="flex items-center gap-1 bg-[var(--color-background)] p-1 rounded-xl border border-[var(--color-outline-variant)]">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === 'all' ? 'bg-[#1D6A6A] text-white' : 'text-slate-500'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setStatusFilter('published')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === 'published' ? 'bg-emerald-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Publicadas
                </button>
                <button
                  onClick={() => setStatusFilter('draft')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === 'draft' ? 'bg-amber-600 text-white' : 'text-slate-500'
                  }`}
                >
                  Rascunhos
                </button>
              </div>

              {/* Busca */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={postsSearch}
                  onChange={e => setPostsSearch(e.target.value)}
                  placeholder="Buscar postagem..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-xs text-[var(--color-on-surface)] focus:ring-2 focus:ring-[#1D6A6A] focus:outline-none"
                />
              </div>

            </div>

          </div>

          {/* Tabela de Postagens */}
          {loadingPosts ? (
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-outline-variant)] rounded-2xl p-8">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">Nenhuma postagem cadastrada.</p>
              <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">Clique em "Nova Postagem / Guia" para criar a primeira publicação.</p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[var(--color-on-surface)]">
                  <thead className="bg-[var(--color-background)] border-b border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Título</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Destaque</th>
                      <th className="p-4">Autor</th>
                      <th className="p-4">Data</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-outline-variant)] font-medium">
                    {filteredPosts.map(post => (
                      <tr key={post.id} className="hover:bg-[var(--color-primary-light)]/40 transition-colors">
                        <td className="p-4 font-bold text-sm max-w-xs truncate">
                          {post.title}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md bg-[#1D6A6A]/10 text-[#1D6A6A] dark:text-[#4ECDC4] font-bold uppercase text-[10px]">
                            {post.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleStatus(post)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                              post.status === 'published'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                          </button>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleTogglePin(post)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              post.is_pinned
                                ? 'bg-[#D4AF37] text-slate-950 border-[#D4AF37]'
                                : 'text-slate-400 border-slate-300 dark:border-slate-700 hover:text-[#D4AF37]'
                            }`}
                            title={post.is_pinned ? 'Remover dos Destaques' : 'Fixar em Destaque'}
                          >
                            <Pin className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                        <td className="p-4 text-slate-500">{post.author_name}</td>
                        <td className="p-4 text-slate-500">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString('pt-BR') : '-'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => onNavigate(`/post/${post.slug}`)}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                            title="Ver Publicação"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPost(post);
                              setIsPostModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-[#1D6A6A] dark:text-[#4ECDC4]"
                            title="Editar Postagem"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                            title="Excluir Postagem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ABA 2: EVENTOS DO CALENDÁRIO */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-outline-variant)] space-y-4">
            <h2 className="font-serif font-bold text-lg text-[var(--color-on-surface)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1D6A6A]" />
              Eventos Cadastrados no Calendário
            </h2>

            {loadingEvents ? (
              <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : events.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhum evento registrado.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(ev => (
                  <div key={ev.id} className="p-4 rounded-xl bg-[var(--color-background)] border border-[var(--color-outline-variant)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#1D6A6A] text-white">
                        {ev.month} • Dia {ev.day}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{ev.time}</span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-[var(--color-on-surface)]">{ev.title}</h3>
                    {ev.instructor && <p className="text-xs text-slate-500">Prof: {ev.instructor}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Criação / Edição de Postagem */}
      <PostModal
        isOpen={isPostModalOpen}
        post={selectedPost}
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleSavePost}
        onDelete={handleDeletePost}
      />

    </div>
  );
};
