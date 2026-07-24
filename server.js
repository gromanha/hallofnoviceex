import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { createServer } from 'node:http';
import { createClient } from '@supabase/supabase-js';

// ── Env validation ─────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const SETUP_TOKEN = process.env.SETUP_TOKEN;
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('[server] FATAL: JWT_SECRET must be set and at least 32 chars');
  process.exit(1);
}
if (!SETUP_TOKEN) {
  console.error('[server] FATAL: SETUP_TOKEN is not set');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[server] FATAL: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

// ── Supabase clients ──────────────────────────────────────────
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Constants ──────────────────────────────────────────────────
const COOKIE_NAME = 'hon_admin';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 8;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];
const DAYS_IN_MONTH = [31,29,31,30,31,30,31,31,30,31,30,31];
const TYPE_KEY_RE = /^[a-z0-9][a-z0-9_-]{0,30}$/;
const COLOR_RE = /^#[0-9a-f]{6}$/i;
const MAX_STR_LEN = 500;
const MAX_DESC_LEN = 2000;

// ── Helpers ────────────────────────────────────────────────────
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function isUUID(v) {
  return typeof v === 'string' && UUID_RE.test(v);
}

function clampStr(v, max = MAX_STR_LEN) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

function isValidMonth(m) {
  return typeof m === 'string' && MONTHS.includes(m);
}

function isValidDay(day, month) {
  const idx = MONTHS.indexOf(month);
  if (idx === -1) return false;
  const n = Number(day);
  return Number.isInteger(n) && n >= 1 && n <= DAYS_IN_MONTH[idx];
}

function isValidHexColor(c) {
  return typeof c === 'string' && COLOR_RE.test(c);
}

function isSafeUrl(url) {
  if (typeof url !== 'string') return false;
  const t = url.trim();
  if (!t) return true; // empty is ok
  if (t.startsWith('javascript:') || t.startsWith('data:') || t.startsWith('vbscript:')) return false;
  try {
    const u = new URL(t);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── In-memory rate limiter (per-IP) ────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 20; // max requests per window

function rateLimit(req, res) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    res.status(429).json({ error: 'too_many_requests' });
    return false;
  }
  return true;
}

// Evict stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW;
  for (const [ip, entry] of rateLimitMap) {
    if (entry.start < cutoff) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

// ── Security headers ───────────────────────────────────────────
function securityHeaders(_req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https:; connect-src 'self'");
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }
  next();
}

// ── App setup ──────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '512kb' }));
app.use(cookieParser());
app.use(securityHeaders);

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ── Auth helpers ───────────────────────────────────────────────
function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, username: admin.username, name: admin.display_name || admin.username },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '8h' }
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
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    res.status(401).json({ error: 'invalid_token' });
    return null;
  }
}

function getAdminFromReq(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}

function safeError(err) {
  if (NODE_ENV === 'production') return 'internal_error';
  return err?.message || 'internal_error';
}

// ── Health ─────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// ── Auth ───────────────────────────────────────────────────────

app.get('/api/auth', (req, res) => {
  const op = String(req.query.op || 'me');
  if (op === 'me') {
    const claims = requireAdmin(req, res);
    if (!claims) return;
    return res.json({ username: claims.username, display_name: claims.name });
  }
  res.status(400).json({ error: 'unknown_operation' });
});

app.post('/api/auth', async (req, res) => {
  if (!rateLimit(req, res)) return;

  const op = String(req.query.op || 'login');

  if (op === 'setup') {
    try {
      const token = req.headers['x-setup-token'];
      if (!timingSafeEqual(String(token || ''), String(SETUP_TOKEN))) {
        return res.status(401).json({ error: 'invalid_setup_token' });
      }
      const username = clampStr(req.body?.username, 50);
      const password = clampStr(req.body?.password, 128);
      const display_name = clampStr(req.body?.display_name, 100);
      if (!username || !password) {
        return res.status(400).json({ error: 'username_and_password_required' });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: 'password_too_short' });
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({ error: 'invalid_username_format' });
      }
      const { count, error: countErr } = await supabaseAdmin
        .from('admins')
        .select('*', { count: 'exact', head: true });
      if (countErr) throw countErr;
      if (count && count > 0) {
        return res.status(409).json({ error: 'admin_already_exists' });
      }
      const password_hash = await bcrypt.hash(password, 12);
      const { data, error } = await supabaseAdmin
        .from('admins')
        .insert({ username, password_hash, display_name: display_name || null })
        .select('id, username, display_name')
        .single();
      if (error) throw error;
      return res.json({ ok: true, admin: data });
    } catch (err) {
      console.error('[setup] error', err);
      return res.status(500).json({ error: safeError(err) });
    }
  }

  if (op === 'login') {
    try {
      const username = clampStr(req.body?.username, 50);
      const password = clampStr(req.body?.password, 128);
      if (!username || !password) {
        return res.status(400).json({ error: 'username_and_password_required' });
      }
      const { data, error } = await supabaseAdmin
        .from('admins')
        .select('id, username, display_name, password_hash')
        .eq('username', username)
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(401).json({ error: 'invalid_credentials' });
      const ok = await bcrypt.compare(password, data.password_hash);
      if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
      const token = signAdminToken(data);
      setAuthCookie(res, token);
      return res.json({ ok: true, admin: { username: data.username, display_name: data.display_name } });
    } catch (err) {
      console.error('[login] error', err);
      return res.status(500).json({ error: safeError(err) });
    }
  }

  if (op === 'logout') {
    clearAuthCookie(res);
    return res.json({ ok: true });
  }

  res.status(400).json({ error: 'unknown_operation' });
});

// ── Events CRUD ────────────────────────────────────────────────

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
    res.status(500).json({ error: 'events_list_failed' });
  }
});

app.post('/api/events', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const b = req.body || {};
    const month = clampStr(b.month, 20);
    const day = Number(b.day);
    const time = clampStr(b.time, 30);
    const title = clampStr(b.title, 200);
    const description = clampStr(b.description, MAX_DESC_LEN);
    const instructor = clampStr(b.instructor, 100);
    const type = clampStr(b.type, 30);
    const image = clampStr(b.image, 500);
    const crystal = Boolean(b.crystal);
    const stars = Boolean(b.stars);

    if (!month || !day || !time || !title || !type) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }
    if (!isValidMonth(month)) {
      return res.status(400).json({ error: 'invalid_month' });
    }
    if (!isValidDay(day, month)) {
      return res.status(400).json({ error: 'invalid_day' });
    }
    if (!TYPE_KEY_RE.test(type)) {
      return res.status(400).json({ error: 'invalid_type' });
    }
    if (!isSafeUrl(image)) {
      return res.status(400).json({ error: 'invalid_image_url' });
    }

    const payload = {
      month, day, time, title, description, instructor, type, image,
      crystal, stars, created_by: claims.sub,
    };
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[events] insert error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.patch('/api/events', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id, ...raw } = req.body;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });

    const fields = {};
    if (raw.month !== undefined) {
      if (!isValidMonth(clampStr(raw.month, 20))) return res.status(400).json({ error: 'invalid_month' });
      fields.month = clampStr(raw.month, 20);
    }
    if (raw.day !== undefined) {
      fields.day = Number(raw.day);
    }
    if (raw.time !== undefined) fields.time = clampStr(raw.time, 30);
    if (raw.title !== undefined) fields.title = clampStr(raw.title, 200);
    if (raw.description !== undefined) fields.description = clampStr(raw.description, MAX_DESC_LEN);
    if (raw.instructor !== undefined) fields.instructor = clampStr(raw.instructor, 100);
    if (raw.type !== undefined) {
      if (!TYPE_KEY_RE.test(clampStr(raw.type, 30))) return res.status(400).json({ error: 'invalid_type' });
      fields.type = clampStr(raw.type, 30);
    }
    if (raw.image !== undefined) {
      if (!isSafeUrl(clampStr(raw.image, 500))) return res.status(400).json({ error: 'invalid_image_url' });
      fields.image = clampStr(raw.image, 500);
    }
    if (raw.crystal !== undefined) fields.crystal = Boolean(raw.crystal);
    if (raw.stars !== undefined) fields.stars = Boolean(raw.stars);
    if (raw.mana_progress !== undefined) fields.mana_progress = Math.min(100, Math.max(0, Number(raw.mana_progress) || 0));
    if (raw.spots !== undefined) fields.spots = Number(raw.spots) || null;
    if (raw.rank !== undefined) fields.rank = clampStr(raw.rank, 20);
    if (raw.indicators !== undefined) fields.indicators = Array.isArray(raw.indicators) ? raw.indicators.slice(0, 5) : [];

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'no_fields_to_update' });
    }

    fields.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('events')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[events] update error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.delete('/api/events', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id } = req.body;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });
    const { error } = await supabaseAdmin.from('events').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('[events] delete error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Event Types CRUD ───────────────────────────────────────────

app.get('/api/event-types', async (_req, res) => {
  try {
    const { data, error } = await supabaseAnon
      .from('event_types')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[event-types] list error', err);
    res.status(500).json({ error: 'event_types_list_failed' });
  }
});

app.post('/api/event-types', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const b = req.body || {};
    const key = clampStr(b.key, 30);
    const label = clampStr(b.label, 100);
    const color = clampStr(b.color, 7);
    const icon = clampStr(b.icon, 30);
    const sort_order = Number(b.sort_order) || 0;

    if (!key || !label) {
      return res.status(400).json({ error: 'key_and_label_required' });
    }
    const slug = key.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    if (!TYPE_KEY_RE.test(slug)) {
      return res.status(400).json({ error: 'invalid_key_format' });
    }
    if (color && !isValidHexColor(color)) {
      return res.status(400).json({ error: 'invalid_color' });
    }

    const { data, error } = await supabaseAdmin
      .from('event_types')
      .insert({
        key: slug,
        label,
        color: isValidHexColor(color) ? color : '#1a3a5f',
        icon: icon || 'Wand2',
        sort_order: Math.max(0, Math.min(999, sort_order)),
      })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[event-types] insert error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.patch('/api/event-types', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id, ...raw } = req.body;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });

    const fields = {};
    if (raw.key !== undefined) {
      const slug = clampStr(raw.key, 30).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
      if (!TYPE_KEY_RE.test(slug)) return res.status(400).json({ error: 'invalid_key_format' });
      fields.key = slug;
    }
    if (raw.label !== undefined) fields.label = clampStr(raw.label, 100);
    if (raw.color !== undefined) {
      if (!isValidHexColor(clampStr(raw.color, 7))) return res.status(400).json({ error: 'invalid_color' });
      fields.color = clampStr(raw.color, 7);
    }
    if (raw.icon !== undefined) fields.icon = clampStr(raw.icon, 30);
    if (raw.sort_order !== undefined) fields.sort_order = Math.max(0, Math.min(999, Number(raw.sort_order) || 0));

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'no_fields_to_update' });
    }

    const { data, error } = await supabaseAdmin
      .from('event_types')
      .update(fields)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[event-types] update error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.delete('/api/event-types', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id } = req.body;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });
    const { error } = await supabaseAdmin.from('event_types').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('[event-types] delete error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Posts CRUD ─────────────────────────────────────────────────

app.get('/api/posts', async (req, res) => {
  try {
    const claims = getAdminFromReq(req);
    const isAdmin = !!claims;
    const { slug, id, category, status, search } = req.query;

    if (slug) {
      let query = (isAdmin ? supabaseAdmin : supabaseAnon).from('posts').select('*').eq('slug', String(slug));
      if (!isAdmin) query = query.eq('status', 'published');
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'post_not_found' });
      return res.json(data);
    }

    if (id) {
      let query = (isAdmin ? supabaseAdmin : supabaseAnon).from('posts').select('*').eq('id', String(id));
      if (!isAdmin) query = query.eq('status', 'published');
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'post_not_found' });
      return res.json(data);
    }

    let query = (isAdmin ? supabaseAdmin : supabaseAnon)
      .from('posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('published_at', { ascending: false });

    if (!isAdmin || status !== 'all') {
      if (status && isAdmin) {
        query = query.eq('status', String(status));
      } else {
        query = query.eq('status', 'published');
      }
    }

    if (category && category !== 'all') {
      query = query.eq('category', String(category));
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[posts] list error', err);
    res.status(500).json({ error: 'posts_list_failed' });
  }
});

app.post('/api/posts', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { title, subtitle = '', content, category = 'noticias', cover_image = '', tags = [], is_pinned = false, status = 'published', slug } = req.body || {};
    if (!title || !content) return res.status(400).json({ error: 'title_and_content_required' });

    let generatedSlug = slug || title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (!generatedSlug) generatedSlug = `post-${Date.now()}`;

    const { data: existing } = await supabaseAdmin.from('posts').select('id').eq('slug', generatedSlug).maybeSingle();
    if (existing) generatedSlug = `${generatedSlug}-${Date.now().toString(36)}`;

    const payload = {
      title: clampStr(title, 200),
      slug: generatedSlug,
      subtitle: clampStr(subtitle, 500),
      content: String(content),
      category: clampStr(category, 50),
      author_name: claims.name || 'Corpo Docente',
      author_id: claims.sub,
      cover_image: clampStr(cover_image, 500),
      tags: Array.isArray(tags) ? tags : [],
      is_pinned: Boolean(is_pinned),
      status: status === 'draft' ? 'draft' : 'published',
      published_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from('posts').insert(payload).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[posts] insert error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.patch('/api/posts', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id, ...updates } = req.body;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });

    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabaseAdmin.from('posts').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[posts] update error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.delete('/api/posts', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id } = req.body || req.query;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });

    const { error } = await supabaseAdmin.from('posts').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('[posts] delete error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Catch-all ──────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'not_found' });
  }
  next();
});

app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err);
  res.status(500).json({ error: safeError(err) });
});

// ── Start ──────────────────────────────────────────────────────
const server = createServer(app);
server.listen(PORT, () => {
  console.log(`[server] Hall of the Novice EX API listening on http://localhost:${PORT}`);
});
