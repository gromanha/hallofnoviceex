import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createServer } from 'node:http';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const app = express();

const {
  JWT_SECRET,
  SETUP_TOKEN,
  PORT = 3001,
  NODE_ENV = 'development',
} = process.env;

if (!JWT_SECRET) {
  console.error('[server] FATAL: JWT_SECRET is not set in .env');
  process.exit(1);
}
if (!SETUP_TOKEN) {
  console.error('[server] FATAL: SETUP_TOKEN is not set in .env');
  process.exit(1);
}
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[server] FATAL: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const COOKIE_NAME = 'hon_admin';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 8;

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, username: admin.username, name: admin.display_name || admin.username },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

function requireAdmin(req, res) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: 'unauthenticated' });
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    res.status(401).json({ error: 'invalid_token' });
    return null;
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.post('/api/auth/setup', async (req, res) => {
  try {
    const token = req.headers['x-setup-token'];
    if (token !== SETUP_TOKEN) {
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
});

app.post('/api/auth/login', async (req, res) => {
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

    const ok = await bcrypt.compare(String(password), data.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });

    const token = signAdminToken(data);
    setAuthCookie(res, token);
    return res.json({ ok: true, admin: { username: data.username, display_name: data.display_name } });
  } catch (err) {
    console.error('[login] error', err);
    return res.status(500).json({ error: 'login_failed', detail: err.message });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  res.json({
    username: claims.username,
    display_name: claims.name,
  });
});

app.get('/api/events', async (_req, res) => {
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
});

app.post('/api/admin/events', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
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
    res.json(data);
  } catch (err) {
    console.error('[events] insert error', err);
    res.status(500).json({ error: 'event_create_failed', detail: err.message });
  }
});

app.patch('/api/admin/events/:id', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('events')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[events] update error', err);
    res.status(500).json({ error: 'event_update_failed', detail: err.message });
  }
});

app.delete('/api/admin/events/:id', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('[events] delete error', err);
    res.status(500).json({ error: 'event_delete_failed', detail: err.message });
  }
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'not_found', path: req.path });
  }
  next();
});

app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: 'internal_error', detail: err.message });
});

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`[server] Hall of the Novice EX API listening on http://localhost:${PORT}`);
});
