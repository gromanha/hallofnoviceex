import { getSupabaseAdmin } from './lib/supabase.js';
import { signAdminToken, setAuthCookie, clearAuthCookie, requireAdmin } from './lib/auth.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // Roteamento por path: /api/auth?op=login|logout|me|setup
  const url = new URL(req.url, `http://${req.headers.host}`);
  const op = url.searchParams.get('op') || 'me';

  try {
    // ── GET /api/auth?op=me ──
    if (req.method === 'GET' && op === 'me') {
      const claims = requireAdmin(req);
      if (!claims) return res.status(401).json({ error: 'unauthenticated' });
      return res.json({ username: claims.username, display_name: claims.name });
    }

    // ── POST /api/auth?op=setup ──
    if (req.method === 'POST' && op === 'setup') {
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

      const { count, error: countErr } = await getSupabaseAdmin()
        .from('admins')
        .select('*', { count: 'exact', head: true });
      if (countErr) throw countErr;
      if (count && count > 0) {
        return res.status(409).json({ error: 'admin_already_exists' });
      }

      const password_hash = await bcrypt.hash(String(password), 12);
      const { data, error } = await getSupabaseAdmin()
        .from('admins')
        .insert({ username: String(username), password_hash, display_name: display_name || null })
        .select('id, username, display_name')
        .single();
      if (error) throw error;
      return res.json({ ok: true, admin: data });
    }

    // ── POST /api/auth?op=login ──
    if (req.method === 'POST' && op === 'login') {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ error: 'username_and_password_required' });
      }
      const { data, error } = await getSupabaseAdmin()
        .from('admins')
        .select('id, username, display_name, password_hash')
        .eq('username', String(username))
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(401).json({ error: 'invalid_credentials' });

      const ok = await bcrypt.compare(String(password), data.password_hash);
      if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

      const token = signAdminToken(data);
      setAuthCookie(res, token);
      return res.json({ ok: true, admin: { username: data.username, display_name: data.display_name } });
    }

    // ── POST /api/auth?op=logout ──
    if (req.method === 'POST' && op === 'logout') {
      clearAuthCookie(res);
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: 'unknown_operation' });
  } catch (err) {
    console.error('[auth] error', err);
    return res.status(500).json({ error: 'auth_operation_failed', detail: err.message });
  }
}
