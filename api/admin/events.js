import { supabaseAdmin } from '../lib/supabase.js';
import { requireAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  const claims = requireAdmin(req);
  if (!claims) {
    return res.status(401).json({ error: 'unauthenticated' });
  }

  try {
    if (req.method === 'POST') {
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

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[events] insert error', err);
    return res.status(500).json({ error: 'event_create_failed', detail: err.message });
  }
}
