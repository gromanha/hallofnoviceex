import { getSupabaseAdmin, getSupabaseAnon } from './lib/supabase.js';
import { requireAdmin } from './lib/auth.js';

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const id = url.searchParams.get('id') || req.body?.id;
    const slug = url.searchParams.get('slug');
    const category = url.searchParams.get('category');
    const statusParam = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // ── GET /api/posts — Leitura Pública / Admin ──
    if (req.method === 'GET') {
      const claims = requireAdmin(req);
      const isAdmin = !!claims;

      // Se for busca por slug individual
      if (slug) {
        let query = (isAdmin ? getSupabaseAdmin() : getSupabaseAnon())
          .from('posts')
          .select('*')
          .eq('slug', slug);

        if (!isAdmin) {
          query = query.eq('status', 'published');
        }

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'post_not_found' });
        return res.json(data);
      }

      // Se for busca por ID individual
      if (id) {
        let query = (isAdmin ? getSupabaseAdmin() : getSupabaseAnon())
          .from('posts')
          .select('*')
          .eq('id', id);

        if (!isAdmin) {
          query = query.eq('status', 'published');
        }

        const { data, error } = await query.maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'post_not_found' });
        return res.json(data);
      }

      // Lista geral com filtros
      let query = (isAdmin ? getSupabaseAdmin() : getSupabaseAnon())
        .from('posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });

      if (!isAdmin || statusParam !== 'all') {
        if (statusParam && isAdmin) {
          query = query.eq('status', statusParam);
        } else {
          query = query.eq('status', 'published');
        }
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json(data || []);
    }

    // ── POST /api/posts — Criar postagem (Admin) ──
    if (req.method === 'POST') {
      const claims = requireAdmin(req);
      if (!claims) return res.status(401).json({ error: 'unauthenticated' });

      const {
        title,
        subtitle = '',
        content,
        category = 'noticias',
        author_name = claims.name || 'Corpo Docente',
        cover_image = '',
        tags = [],
        is_pinned = false,
        status = 'published',
        slug: userSlug,
      } = req.body || {};

      if (!title || !content) {
        return res.status(400).json({ error: 'title_and_content_required' });
      }

      // Gerar ou sanitizar slug
      let generatedSlug = userSlug || title.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      if (!generatedSlug) generatedSlug = `post-${Date.now()}`;

      // Garantir slug único se houver colisão
      const { data: existing } = await getSupabaseAdmin()
        .from('posts')
        .select('id')
        .eq('slug', generatedSlug)
        .maybeSingle();

      if (existing) {
        generatedSlug = `${generatedSlug}-${Date.now().toString(36)}`;
      }

      const payload = {
        title: String(title).trim(),
        slug: generatedSlug,
        subtitle: String(subtitle).trim(),
        content: String(content),
        category: String(category).toLowerCase(),
        author_name: String(author_name),
        author_id: claims.sub,
        cover_image: String(cover_image),
        tags: Array.isArray(tags) ? tags : [],
        is_pinned: Boolean(is_pinned),
        status: status === 'draft' ? 'draft' : 'published',
        published_at: new Date().toISOString(),
      };

      const { data, error } = await getSupabaseAdmin()
        .from('posts')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    // ── PATCH /api/posts?id=... — Atualizar postagem (Admin) ──
    if (req.method === 'PATCH') {
      const claims = requireAdmin(req);
      if (!claims) return res.status(401).json({ error: 'unauthenticated' });
      if (!id) return res.status(400).json({ error: 'id_required' });

      const updates = { ...req.body, updated_at: new Date().toISOString() };
      delete updates.id;

      const { data, error } = await getSupabaseAdmin()
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.json(data);
    }

    // ── DELETE /api/posts?id=... — Excluir postagem (Admin) ──
    if (req.method === 'DELETE') {
      const claims = requireAdmin(req);
      if (!claims) return res.status(401).json({ error: 'unauthenticated' });
      if (!id) return res.status(400).json({ error: 'id_required' });

      const { error } = await getSupabaseAdmin().from('posts').delete().eq('id', id);
      if (error) throw error;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[posts] error', err);
    return res.status(500).json({ error: 'post_operation_failed', detail: err.message });
  }
}
