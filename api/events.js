import { supabaseAnon } from './lib/supabase.js';

export default async function handler(_req, res) {
  try {
    const { data, error } = await supabaseAnon
      .from('events')
      .select('*')
      .order('day', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[events] list error', err);
    res.status(500).json({ error: 'events_list_failed', detail: err.message });
  }
}
