import { supabaseAdmin } from '../lib/supabase.js';
import { signAdminToken, setAuthCookie } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username_and_password_required' });
    }
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('id, username, display_name, password_hash')
      .eq('username', String(username))
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(401).json({ error: 'invalid_credentials' });

    const bcrypt = (await import('bcryptjs')).default;
    const ok = await bcrypt.compare(String(password), data.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    const token = signAdminToken(data);
    setAuthCookie(res, token);
    return res.json({ ok: true, admin: { username: data.username, display_name: data.display_name } });
  } catch (err) {
    console.error('[login] error', err);
    return res.status(500).json({ error: 'login_failed', detail: err.message });
  }
}
