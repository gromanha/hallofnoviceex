import { supabaseAdmin, supabaseAnon } from './lib/supabase.js';
import { requireAdmin } from './lib/auth.js';

export default async function handler(req, res) {
  try {
    // GET — leitura pública
    if (req.method === 'GET') {
      const { data, error } = await supabaseAnon
        .from('events')
        .select('*')
        .order('day', { ascending: true });
      if (error) throw error;
      return res.json(data || []);
    }

    // POST — criar evento (admin)
    if (req.method === 'POST') {
      const claims = requireAdmin(req);
      if (!claims) return res.status(401).json({ error: 'unauthenticated' });
      const payload = { ...req.body, created_by: claims.sub };
      if (!payload.month || !payload.day || !payload.time || !payload.title || !payload.type) {
        return res.status(400).json({ error: 'missing_required_fields' });
      }
      const { data, error } = await supabaseAdmin
        .from('events')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    }

    // PATCH / DELETE — operações em evento específico via query ?id=...
    if (req.method === 'PATCH' || req.method === 'DELETE') {
      const claims = requireAdmin(req);
      if (!claims) return res.status(401).json({ error: 'unauthenticated' });
      const id = req.query.id || req.body?.id;
      if (!id) return res.status(400).json({ error: 'id_required' });

      if (req.method === 'PATCH') {
        const { data, error } = await supabaseAdmin
          .from('events')
          .update({ ...req.body, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw error;
        return res.json(data);
      }

      if (req.method === 'DELETE') {
        const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
        if (error) throw error;
        return res.json({ ok: true });
      }
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[events] error', err);
    return res.status(500).json({ error: 'event_operation_failed', detail: err.message });
  }
}
