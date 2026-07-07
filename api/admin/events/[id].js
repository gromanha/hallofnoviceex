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

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[events] error', err);
    return res.status(500).json({ error: 'event_operation_failed', detail: err.message });
  }
}
