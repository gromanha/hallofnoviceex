import { supabaseAdmin } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';

export default async function handler(req, res) {
  const claims = requireAdmin(req);
  if (!claims) {
    return res.status(401).json({ error: 'unauthenticated' });
  }

  const { id } = req.query;

  try {
    if (req.method === 'PATCH') {
      const payload = { ...req.body };
      if (payload.key) {
        payload.key = String(payload.key).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
      }
      const { data, error } = await supabaseAdmin
        .from('event_types')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.json(data);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabaseAdmin.from('event_types').delete().eq('id', id);
      if (error) throw error;
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[event-types] error', err);
    return res.status(500).json({ error: 'event_type_operation_failed', detail: err.message });
  }
}
