import { getSupabaseAdmin, getSupabaseAnon } from './lib/supabase.js';
import { requireAdmin } from './lib/auth.js';

export default async function handler(req, res) {
  try {
    // GET — leitura pública
    if (req.method === 'GET') {
      const { data, error } = await getSupabaseAnon()
        .from('event_types')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return res.json(data || []);
    }

    // POST — criar tipo (admin)
    if (req.method === 'POST') {
      const claims = requireAdmin(req);
      if (!claims) return res.status(401).json({ error: 'unauthenticated' });
      const { key, label, color, icon, sort_order } = req.body || {};
      if (!key || !label) {
        return res.status(400).json({ error: 'key_and_label_required' });
      }
      const slug = String(key).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
      const { data, error } = await getSupabaseAdmin()
        .from('event_types')
        .insert({
          key: slug,
          label: String(label),
          color: color || '#1a3a5f',
          icon: icon || 'Wand2',
          sort_order: sort_order ?? 0,
        })
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    }

    // PATCH / DELETE — operações em tipo específico via query ?id=...
    if (req.method === 'PATCH' || req.method === 'DELETE') {
      const claims = requireAdmin(req);
      if (!claims) return res.status(401).json({ error: 'unauthenticated' });
      const id = req.query.id || req.body?.id;
      if (!id) return res.status(400).json({ error: 'id_required' });

      if (req.method === 'PATCH') {
        const payload = { ...req.body };
        if (payload.key) {
          payload.key = String(payload.key).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
        }
        const { data, error } = await getSupabaseAdmin()
          .from('event_types')
          .update(payload)
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.json(data);
      }

      if (req.method === 'DELETE') {
        const { error } = await getSupabaseAdmin().from('event_types').delete().eq('id', id);
        if (error) throw error;
        return res.json({ ok: true });
      }
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[event-types] error', err);
    return res.status(500).json({ error: 'event_type_operation_failed', detail: err.message });
  }
}
