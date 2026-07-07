import { supabaseAdmin } from '../lib/supabase.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const token = req.headers['x-setup-token'];
    if (token !== process.env.SETUP_TOKEN) {
      return res.status(401).json({ error: 'invalid_setup_token' });
    }
    const { username, password, display_name } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username_and_password_required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'password_too_short' });
    }

    const { count, error: countErr } = await supabaseAdmin
      .from('admins')
      .select('*', { count: 'exact', head: true });
    if (countErr) throw countErr;
    if (count && count > 0) {
      return res.status(409).json({ error: 'admin_already_exists' });
    }

    const password_hash = await bcrypt.hash(String(password), 12);
    const { data, error } = await supabaseAdmin
      .from('admins')
      .insert({ username: String(username), password_hash, display_name: display_name || null })
      .select('id, username, display_name')
      .single();
    if (error) throw error;

    return res.json({ ok: true, admin: data });
  } catch (err) {
    console.error('[setup] error', err);
    return res.status(500).json({ error: 'setup_failed', detail: err.message });
  }
}
