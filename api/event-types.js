import { supabaseAnon } from './lib/supabase.js';

export default async function handler(_req, res) {
  try {
    const { data, error } = await supabaseAnon
      .from('event_types')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[event-types] list error', err);
    res.status(500).json({ error: 'event_types_list_failed', detail: err.message });
  }
}
