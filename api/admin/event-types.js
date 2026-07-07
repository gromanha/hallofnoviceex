import { supabaseAdmin } from '../lib/supabase.js';
import { requireAdmin } from '../lib/auth.js';

export default async function handler(req, res) {
  const claims = requireAdmin(req);
  if (!claims) {
    return res.status(401).json({ error: 'unauthenticated' });
  }

  try {
    if (req.method === 'POST') {
      const { key, label, color, icon, sort_order } = req.body || {};
      if (!key || !label) {
        return res.status(400).json({ error: 'key_and_label_required' });
      }
      const slug = String(key).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
      const { data, error } = await supabaseAdmin
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

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('[event-types] insert error', err);
    return res.status(500).json({ error: 'event_type_create_failed', detail: err.message });
  }
}
