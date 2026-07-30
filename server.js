import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Env validation ─────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const SETUP_TOKEN = process.env.SETUP_TOKEN;

// Dev-only allowance so impeccable live mode can load
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? " http://localhost:8400" : "";
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
  res.setHeader("Content-Security-Policy", `default-src 'self'; script-src 'self'${__impeccableLiveDev}; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self' https:; connect-src 'self'${__impeccableLiveDev}`);
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
    const is_recurring = Boolean(b.is_recurring);
    const end_day = b.end_day != null ? Number(b.end_day) : null;
    const end_month = b.end_month ? clampStr(b.end_month, 20) : null;

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
    if (end_month && !isValidMonth(end_month)) {
      return res.status(400).json({ error: 'invalid_end_month' });
    }
    if (end_day && end_month && !isValidDay(end_day, end_month)) {
      return res.status(400).json({ error: 'invalid_end_day' });
    }

    const payload = {
      month, day, time, title, description, instructor, type, image,
      crystal, stars, is_recurring, end_day, end_month, created_by: claims.sub,
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
    if (raw.is_recurring !== undefined) fields.is_recurring = Boolean(raw.is_recurring);
    if (raw.end_day !== undefined) fields.end_day = raw.end_day != null ? Number(raw.end_day) : null;
    if (raw.end_month !== undefined) {
      const em = raw.end_month ? clampStr(raw.end_month, 20) : null;
      if (em && !isValidMonth(em)) return res.status(400).json({ error: 'invalid_end_month' });
      fields.end_month = em;
    }
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
        color: isValidHexColor(color) ? color : '#1B4F7E',
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

// ── Image Upload (Supabase Storage) ───────────────────────────

app.post('/api/upload', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { file, filename, contentType } = req.body || {};
    if (!file || !filename) {
      return res.status(400).json({ error: 'file_and_filename_required' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({ error: 'invalid_content_type' });
    }

    const MAX_SIZE = 10 * 1024 * 1024;
    const fileBuffer = Buffer.from(file, 'base64');
    if (fileBuffer.length > MAX_SIZE) {
      return res.status(400).json({ error: 'file_too_large' });
    }

    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const filePath = `blog-images/${safeName}`;

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('blog-images')
      .upload(filePath, fileBuffer, {
        contentType: contentType || 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      console.error('[upload] storage error', uploadError);
      return res.status(500).json({ error: 'upload_failed' });
    }

    const { data: urlData } = supabaseAdmin
      .storage
      .from('blog-images')
      .getPublicUrl(filePath);

    return res.json({ url: urlData.publicUrl, path: filePath });
  } catch (err) {
    console.error('[upload] error', err);
    return res.status(500).json({ error: safeError(err) });
  }
});

// ── Posts Revisions ───────────────────────────────────────────

app.get('/api/posts/:id/revisions', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id } = req.params;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });

    const { data, error } = await supabaseAdmin
      .from('post_revisions')
      .select('*')
      .eq('post_id', id)
      .order('revision_n', { ascending: false });
    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    console.error('[revisions] list error', err);
    return res.status(500).json({ error: safeError(err) });
  }
});

app.post('/api/posts/:id/revisions', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id } = req.params;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });

    const { title, content } = req.body || {};
    if (!title || !content) return res.status(400).json({ error: 'title_and_content_required' });

    const { data: lastRev } = await supabaseAdmin
      .from('post_revisions')
      .select('revision_n')
      .eq('post_id', id)
      .order('revision_n', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextN = (lastRev?.revision_n || 0) + 1;

    const { data, error } = await supabaseAdmin
      .from('post_revisions')
      .insert({
        post_id: id,
        title: clampStr(title, 200),
        content: String(content),
        revision_n: nextN,
        created_by: claims.sub,
      })
      .select()
      .single();
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    console.error('[revisions] create error', err);
    return res.status(500).json({ error: safeError(err) });
  }
});

app.post('/api/posts/:id/revisions/:revId/restore', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id, revId } = req.params;
    if (!id || !isUUID(id) || !revId || !isUUID(revId)) {
      return res.status(400).json({ error: 'invalid_id' });
    }

    const { data: revision, error: revErr } = await supabaseAdmin
      .from('post_revisions')
      .select('*')
      .eq('id', revId)
      .eq('post_id', id)
      .maybeSingle();
    if (revErr) throw revErr;
    if (!revision) return res.status(404).json({ error: 'revision_not_found' });

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update({
        title: revision.title,
        content: revision.content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return res.json(data);
  } catch (err) {
    console.error('[revisions] restore error', err);
    return res.status(500).json({ error: safeError(err) });
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
    const { title, subtitle = '', content, category = 'noticias', cover_image = '', tags = [], is_pinned = false, status = 'published', slug, reading_time, word_count } = req.body || {};
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
      reading_time: reading_time != null ? Math.max(0, Math.floor(Number(reading_time))) : null,
      word_count: word_count != null ? Math.max(0, Math.floor(Number(word_count))) : null,
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

    if (updates.reading_time !== undefined) {
      updates.reading_time = updates.reading_time != null ? Math.max(0, Math.floor(Number(updates.reading_time))) : null;
    }
    if (updates.word_count !== undefined) {
      updates.word_count = updates.word_count != null ? Math.max(0, Math.floor(Number(updates.word_count))) : null;
    }

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

// ── Recipe Categories CRUD ──────────────────────────────────────

app.get('/api/recipe-categories', async (_req, res) => {
  try {
    const { data, error } = await supabaseAnon
      .from('recipe_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[recipe-categories] list error', err);
    res.status(500).json({ error: 'recipe_categories_list_failed' });
  }
});

app.post('/api/recipe-categories', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const b = req.body || {};
    const key = clampStr(b.key, 30).toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    const label = clampStr(b.label, 100);
    const icon = clampStr(b.icon, 30) || 'UtensilsCrossed';
    const sort_order = Number(b.sort_order) || 0;

    if (!key || !label) return res.status(400).json({ error: 'key_and_label_required' });
    if (!TYPE_KEY_RE.test(key)) return res.status(400).json({ error: 'invalid_key_format' });

    const { data, error } = await supabaseAdmin
      .from('recipe_categories')
      .insert({ key, label, icon, sort_order: Math.max(0, Math.min(999, sort_order)) })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[recipe-categories] insert error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.patch('/api/recipe-categories', async (req, res) => {
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
    if (raw.icon !== undefined) fields.icon = clampStr(raw.icon, 30);
    if (raw.sort_order !== undefined) fields.sort_order = Math.max(0, Math.min(999, Number(raw.sort_order) || 0));
    if (Object.keys(fields).length === 0) return res.status(400).json({ error: 'no_fields_to_update' });
    const { data, error } = await supabaseAdmin.from('recipe_categories').update(fields).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[recipe-categories] update error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.delete('/api/recipe-categories', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id } = req.body;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });
    const { error } = await supabaseAdmin.from('recipe_categories').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('[recipe-categories] delete error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Recipes CRUD ───────────────────────────────────────────────

const VALID_DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const CATEGORY_RE = /^[a-z][a-z0-9_]{0,30}$/;

app.get('/api/recipes', async (req, res) => {
  try {
    const claims = getAdminFromReq(req);
    const isAdmin = !!claims;
    const { slug, id, category, status, search } = req.query;

    if (slug) {
      let query = (isAdmin ? supabaseAdmin : supabaseAnon).from('recipes').select('*').eq('slug', String(slug));
      if (!isAdmin) query = query.eq('status', 'published');
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'recipe_not_found' });
      return res.json(data);
    }

    if (id) {
      let query = (isAdmin ? supabaseAdmin : supabaseAnon).from('recipes').select('*').eq('id', String(id));
      if (!isAdmin) query = query.eq('status', 'published');
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'recipe_not_found' });
      return res.json(data);
    }

    let query = (isAdmin ? supabaseAdmin : supabaseAnon)
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

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
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('[recipes] list error', err);
    res.status(500).json({ error: 'recipes_list_failed' });
  }
});

app.post('/api/recipes', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const b = req.body || {};
    const title = clampStr(b.title, 200);
    if (!title) return res.status(400).json({ error: 'title_required' });

    let generatedSlug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (!generatedSlug) generatedSlug = `recipe-${Date.now()}`;

    const { data: existing } = await supabaseAdmin.from('recipes').select('id').eq('slug', generatedSlug).maybeSingle();
    if (existing) generatedSlug = `${generatedSlug}-${Date.now().toString(36)}`;

    const category = clampStr(b.category, 30);
    if (category && !CATEGORY_RE.test(category)) return res.status(400).json({ error: 'invalid_category' });

    const difficulty = clampStr(b.difficulty, 10);
    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) return res.status(400).json({ error: 'invalid_difficulty' });

    if (b.cover_image && !isSafeUrl(clampStr(b.cover_image, 500))) return res.status(400).json({ error: 'invalid_image_url' });

    const payload = {
      title,
      slug: generatedSlug,
      category: category || null,
      regional_cuisine: clampStr(b.regional_cuisine, 100),
      description: clampStr(b.description, 2000),
      lore_quotes: Array.isArray(b.lore_quotes) ? b.lore_quotes.slice(0, 10) : [],
      difficulty: VALID_DIFFICULTIES.includes(difficulty) ? difficulty : 'Easy',
      prep_time: clampStr(b.prep_time, 50),
      inactive_time: clampStr(b.inactive_time, 50),
      cook_time: clampStr(b.cook_time, 50),
      yield_text: clampStr(b.yield_text, 50),
      dietary_notes: clampStr(b.dietary_notes, 200),
      equipment: clampStr(b.equipment, 500),
      ingredient_sections: Array.isArray(b.ingredient_sections) ? b.ingredient_sections : [],
      instruction_sections: Array.isArray(b.instruction_sections) ? b.instruction_sections : [],
      cover_image: clampStr(b.cover_image, 500),
      status: b.status === 'draft' ? 'draft' : 'published',
      created_by: claims.sub,
    };

    const { data, error } = await supabaseAdmin.from('recipes').insert(payload).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[recipes] insert error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.patch('/api/recipes', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id, ...raw } = req.body;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });

    const fields = {};
    if (raw.title !== undefined) {
      fields.title = clampStr(raw.title, 200);
      if (raw.generate_slug !== false && raw.slug === undefined) {
        let newSlug = fields.title.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        const { data: existing } = await supabaseAdmin.from('recipes').select('id').eq('slug', newSlug).maybeSingle();
        if (existing && existing.id !== id) newSlug = `${newSlug}-${Date.now().toString(36)}`;
        fields.slug = newSlug;
      }
    }
    if (raw.slug !== undefined) fields.slug = clampStr(raw.slug, 200);
    if (raw.category !== undefined) {
      const cat = clampStr(raw.category, 30);
      if (cat && !CATEGORY_RE.test(cat)) return res.status(400).json({ error: 'invalid_category' });
      fields.category = cat || null;
    }
    if (raw.regional_cuisine !== undefined) fields.regional_cuisine = clampStr(raw.regional_cuisine, 100);
    if (raw.description !== undefined) fields.description = clampStr(raw.description, 2000);
    if (raw.lore_quotes !== undefined) fields.lore_quotes = Array.isArray(raw.lore_quotes) ? raw.lore_quotes.slice(0, 10) : [];
    if (raw.difficulty !== undefined) {
      const d = clampStr(raw.difficulty, 10);
      if (d && !VALID_DIFFICULTIES.includes(d)) return res.status(400).json({ error: 'invalid_difficulty' });
      fields.difficulty = VALID_DIFFICULTIES.includes(d) ? d : 'Easy';
    }
    if (raw.prep_time !== undefined) fields.prep_time = clampStr(raw.prep_time, 50);
    if (raw.inactive_time !== undefined) fields.inactive_time = clampStr(raw.inactive_time, 50);
    if (raw.cook_time !== undefined) fields.cook_time = clampStr(raw.cook_time, 50);
    if (raw.yield_text !== undefined) fields.yield_text = clampStr(raw.yield_text, 50);
    if (raw.dietary_notes !== undefined) fields.dietary_notes = clampStr(raw.dietary_notes, 200);
    if (raw.equipment !== undefined) fields.equipment = clampStr(raw.equipment, 500);
    if (raw.ingredient_sections !== undefined) fields.ingredient_sections = Array.isArray(raw.ingredient_sections) ? raw.ingredient_sections : [];
    if (raw.instruction_sections !== undefined) fields.instruction_sections = Array.isArray(raw.instruction_sections) ? raw.instruction_sections : [];
    if (raw.cover_image !== undefined) {
      if (!isSafeUrl(clampStr(raw.cover_image, 500))) return res.status(400).json({ error: 'invalid_image_url' });
      fields.cover_image = clampStr(raw.cover_image, 500);
    }
    if (raw.status !== undefined) fields.status = raw.status === 'draft' ? 'draft' : 'published';

    if (Object.keys(fields).length === 0) return res.status(400).json({ error: 'no_fields_to_update' });
    fields.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin.from('recipes').update(fields).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('[recipes] update error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.delete('/api/recipes', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;
  try {
    const { id } = req.body || req.query;
    if (!id || !isUUID(id)) return res.status(400).json({ error: 'invalid_id' });
    const { error } = await supabaseAdmin.from('recipes').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error('[recipes] delete error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── FFXIV Game Data API ───────────────────────────────────────
import {
  getItemById,
  searchItems,
  getRecipeById,
  searchRecipes,
  getCharacterById,
  searchQuests,
  searchDungeons,
  searchTrials,
  searchRaids,
  getMarketPrices,
  getCacheStats,
  WORLDS,
} from './src/lib/ffxiv-api.js';

// Rate limiting para APIs externas
const externalApiRateLimit = new Map();
const EXTERNAL_RATE_LIMIT = 60; // req/min por IP
const EXTERNAL_RATE_WINDOW = 60 * 1000; // 1 minuto

function checkExternalRateLimit(ip) {
  const now = Date.now();
  const record = externalApiRateLimit.get(ip);

  if (!record || now - record.windowStart > EXTERNAL_RATE_WINDOW) {
    externalApiRateLimit.set(ip, { windowStart: now, count: 1 });
    return true;
  }

  if (record.count >= EXTERNAL_RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Middleware de rate limiting para APIs externas
function externalRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  if (!checkExternalRateLimit(ip)) {
    return res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Too many requests to external APIs. Please try again later.',
    });
  }
  next();
}

// ── Rotas: Itens ───────────────────────────────────────────────
app.get('/api/ffxiv/items', externalRateLimit, async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;

    if (!search || search.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const result = await searchItems(search, Math.min(Number(limit), 50));
    res.json(result);
  } catch (err) {
    console.error('[ffxiv] items search error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.get('/api/ffxiv/items/:id', externalRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    const result = await getItemById(Number(id));
    res.json(result);
  } catch (err) {
    console.error('[ffxiv] item detail error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Rotas: Receitas ────────────────────────────────────────────
app.get('/api/ffxiv/recipes', externalRateLimit, async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;

    if (!search || search.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const result = await searchRecipes(search, Math.min(Number(limit), 50));
    res.json(result);
  } catch (err) {
    console.error('[ffxiv] recipes search error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.get('/api/ffxiv/recipes/:id', externalRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid recipe ID' });
    }

    const result = await getRecipeById(Number(id));
    res.json(result);
  } catch (err) {
    console.error('[ffxiv] recipe detail error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Rotas: Personagens ─────────────────────────────────────────
app.get('/api/ffxiv/characters/:id', externalRateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid character ID' });
    }

    const result = await getCharacterById(Number(id));
    res.json(result);
  } catch (err) {
    console.error('[ffxiv] character error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Rotas: Quests ──────────────────────────────────────────────
app.get('/api/ffxiv/quests', externalRateLimit, async (req, res) => {
  try {
    const { search, limit = 20 } = req.query;

    if (!search || search.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const result = await searchQuests(search, Math.min(Number(limit), 50));
    res.json(result);
  } catch (err) {
    console.error('[ffxiv] quests search error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Rotas: Dungeons/Trials/Raids ──────────────────────────────
app.get('/api/ffxiv/instances', externalRateLimit, async (req, res) => {
  try {
    const { search, type, limit = 20 } = req.query;

    if (!search || search.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    let result;
    switch (type?.toLowerCase()) {
      case 'trial':
        result = await searchTrials(search, Math.min(Number(limit), 50));
        break;
      case 'raid':
        result = await searchRaids(search, Math.min(Number(limit), 50));
        break;
      case 'dungeon':
      default:
        result = await searchDungeons(search, Math.min(Number(limit), 50));
        break;
    }

    res.json(result);
  } catch (err) {
    console.error('[ffxiv] instances search error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Rotas: Market Board ────────────────────────────────────────
app.get('/api/ffxiv/market/:itemId', externalRateLimit, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { world = 'Excalibur' } = req.query;

    if (!itemId || isNaN(Number(itemId))) {
      return res.status(400).json({ error: 'Invalid item ID' });
    }

    if (!WORLDS.includes(world)) {
      return res.status(400).json({
        error: 'Invalid world',
        available_worlds: WORLDS.slice(0, 10),
      });
    }

    const result = await getMarketPrices(world, Number(itemId));
    res.json(result);
  } catch (err) {
    console.error('[ffxiv] market error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

app.get('/api/ffxiv/market', externalRateLimit, async (req, res) => {
  try {
    const { items, world = 'Excalibur' } = req.query;

    if (!items) {
      return res.status(400).json({ error: 'Items parameter required (comma-separated IDs)' });
    }

    const itemIds = items.split(',').map(Number).filter(n => !isNaN(n));
    if (itemIds.length === 0) {
      return res.status(400).json({ error: 'No valid item IDs provided' });
    }

    if (!WORLDS.includes(world)) {
      return res.status(400).json({
        error: 'Invalid world',
        available_worlds: WORLDS.slice(0, 10),
      });
    }

    const result = await getMarketPrices(world, itemIds);
    res.json(result);
  } catch (err) {
    console.error('[ffxiv] market batch error', err);
    res.status(500).json({ error: safeError(err) });
  }
});

// ── Rotas: Utilidades ──────────────────────────────────────────
app.get('/api/ffxiv/worlds', (req, res) => {
  res.json({ worlds: WORLDS });
});

app.get('/api/ffxiv/cache/stats', (req, res) => {
  res.json(getCacheStats());
});

// ── Lodestone Free Company API (local dev only) ────────────────
import { getFCProfile, getFCMembers, getFCAllMembers } from './src/lib/lodestone.js';

const LODESTONE_FC_ID = process.env.LODESTONE_FC_ID || '9234349560946612399';

app.get('/api/lodestone/fc', externalRateLimit, async (_req, res) => {
  try {
    const data = await getFCProfile(LODESTONE_FC_ID);
    res.json(data);
  } catch (err) {
    console.error('[lodestone] fc profile error', err?.message || err);
    res.status(500).json({ error: 'lodestone_fetch_failed' });
  }
});

app.get('/api/lodestone/fc/members', externalRateLimit, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const data = await getFCMembers(LODESTONE_FC_ID, page);
    res.json(data);
  } catch (err) {
    console.error('[lodestone] fc members error', err?.message || err);
    res.status(500).json({ error: 'lodestone_fetch_failed' });
  }
});

app.get('/api/lodestone/fc/members/all', externalRateLimit, async (_req, res) => {
  try {
    const data = await getFCAllMembers(LODESTONE_FC_ID);
    res.json(data);
  } catch (err) {
    console.error('[lodestone] fc all members error', err?.message || err);
    res.status(500).json({ error: 'lodestone_fetch_failed' });
  }
});

// ── Wiki Import API ────────────────────────────────────────────
import * as cheerio from 'cheerio';

const WIKI_BASE_URL = 'https://ffxiv.consolegameswiki.com';
const ALLOWED_WIKI_DOMAINS = ['ffxiv.consolegameswiki.com'];
const WIKI_MAX_HTML_SIZE = 5 * 1024 * 1024;
const WIKI_MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const WIKI_REQUEST_TIMEOUT = 30000;

const wikiRateLimitMap = new Map();

function wikiRateLimit(adminId) {
  const now = Date.now();
  const last = wikiRateLimitMap.get(adminId) || 0;
  if (now - last < 60000) return false;
  wikiRateLimitMap.set(adminId, now);
  return true;
}

function wikiGenerateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function wikiExtractContent($, multilinks) {
  const content = $('div.mw-parser-output');
  if (!content.length) {
    const fallback = $('div.mw-content-ltr');
    if (!fallback.length) return null;
    return wikiExtractFromElement($, fallback, multilinks);
  }
  return wikiExtractFromElement($, content, multilinks);
}

function wikiExtractFromElement($, element, multilinks) {
  const selectorsToRemove = [
    '.toc', '.mw-empty-elt', '.hatnote', '.noprint',
    '.mw-editsection', '.page-actions', '.page-header',
    '.footer', '.catlinks', '.printfooter', '.visualClear',
    'script', 'style', '.ad-slot', '[data-fuse]',
    '.ad', '#siteNotice', '.suggestions', '.mw-portlet',
    'iframe',
  ];

  for (const selector of selectorsToRemove) {
    element.find(selector).remove();
  }

  element.find('img').each((_, img) => {
    const $img = $(img);
    const src = $img.attr('src') || '';
    if (src.includes('primis') || src.includes('doubleclick') ||
        src.includes('googleads') || src.includes('googlesyndication') ||
        src.includes('facebook') || src.includes('analytics') ||
        src.includes('pixel') || src.includes('track')) {
      $img.remove();
    }
  });

  const baseUrl = multilinks ? WIKI_BASE_URL : '';

  element.find('a[href]').each((_, a) => {
    const $a = $(a);
    const href = $a.attr('href');
    if (href && href.startsWith('/') && !href.startsWith('//')) {
      $a.attr('href', baseUrl + href);
    }
  });

  element.find('img[src]').each((_, img) => {
    const $img = $(img);
    const src = $img.attr('src');
    if (src && src.startsWith('/') && !src.startsWith('//')) {
      $img.attr('src', WIKI_BASE_URL + src);
    }
    $img.attr('loading', 'lazy');
    $img.removeAttr('srcset');
    $img.removeAttr('data-file-width');
    $img.removeAttr('data-file-height');
    $img.removeAttr('data-file-type');
    $img.removeAttr('decoding');
  });

  element.find('table').each((_, table) => {
    const $table = $(table);
    if (!$table.hasClass('wiki-table')) {
      $table.addClass('wiki-table');
    }
  });

  const titleEl = $('h1.firstHeading .mw-page-title-main')
    .first()
    .add($('h1.firstHeading').first())
    .add($('#firstHeading').first());
  const title = titleEl.first().text().trim() || 'Untitled';

  let subtitle = '';
  const firstParagraph = element.find('p:not(.mw-empty-elt)').first();
  if (firstParagraph.length) {
    subtitle = firstParagraph.text().trim();
    if (subtitle.length > 300) {
      subtitle = subtitle.substring(0, 297) + '...';
    }
  }

  let coverImage = '';
  const firstFigure = element.find('figure img, .thumb img, .image img').first();
  if (firstFigure.length) {
    coverImage = firstFigure.attr('src') || '';
  }

  const images = [];
  element.find('img').each((_, img) => {
    const $img = $(img);
    images.push({
      originalUrl: $img.attr('src') || '',
      alt: $img.attr('alt') || '',
    });
  });

  const tables = element.find('table').length;

  const internalLinks = [];
  element.find('a[href]').each((_, a) => {
    const href = $(a).attr('href') || '';
    if (href.includes('/wiki/')) {
      internalLinks.push(href);
    }
  });

  const htmlSize = Buffer.byteLength(element.html(), 'utf8');

  return {
    title,
    subtitle,
    coverImage,
    html: element.html(),
    htmlSize,
    images,
    tables,
    internalLinks: internalLinks.length,
  };
}

async function wikiDownloadImage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WIKI_REQUEST_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WikiImporter/1.0)',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (contentType.includes('text/html')) return null;

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > WIKI_MAX_IMAGE_SIZE) return null;

    return { buffer, contentType };
  } catch {
    return null;
  }
}

async function wikiUploadImage(buffer, fileName, contentType) {
  const ext = fileName.split('.').pop() || 'jpg';
  const safeName = `wiki/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from('blog-images')
    .upload(safeName, buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabaseAdmin.storage
    .from('blog-images')
    .getPublicUrl(safeName);

  return urlData.publicUrl;
}

async function wikiTranslateContent(html) {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) throw new Error('GEMINI_API_KEY não configurada');

  const prompt = `Traduza o seguinte conteúdo HTML de uma wiki de Final Fantasy XIV para Português do Brasil (PT-BR).

REGRAS:
- Traduza TODO o texto visível para PT-BR
- NÃO traduza nomes de: itens, habilidades, NPCs, locais, achievements, nomes próprios de FFXIV
- Preservar PERFEITAMENTE todas as tags HTML, classes CSS, e atributos
- Preservar todas as URLs (src, href) inalteradas
- Preservar todos os ícones inline
- Preservar a formatação de tabelas
- Para termos técnicos do jogo, use o formato: "Nome em PT-BR (Nome Original)"
- Seja natural na tradução, não literal

Conteúdo HTML:
${html}

Retorne APENAS o HTML traduzido, sem explicações adicionais.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 65536,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API erro ${response.status}: ${errorData}`);
  }

  const data = await response.json();
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Resposta da API veio vazia');
  }

  const text = data.candidates[0].content.parts[0].text;
  return text
    .replace(/^```html\n?/i, '')
    .replace(/^```\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();
}

// POST /api/wiki-preview
app.post('/api/wiki-preview', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;

  const { url, multilinks = true } = req.body || {};

  if (!url || !ALLOWED_WIKI_DOMAINS.some(d => url.includes(d))) {
    return res.status(400).json({ error: 'invalid_url', message: 'URL deve ser de ffxiv.consolegameswiki.com' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WIKI_REQUEST_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    const $ = cheerio.load(html);
    const content = wikiExtractContent($, multilinks);

    if (!content) {
      return res.status(400).json({ error: 'content_not_found', message: 'Conteúdo da wiki não encontrado' });
    }

    return res.json({
      success: true,
      title: content.title,
      subtitle: content.subtitle,
      coverImage: content.coverImage,
      imagesCount: content.images.length,
      tables: content.tables,
      internalLinks: content.internalLinks,
      htmlSize: content.htmlSize,
      htmlSizeFormatted: `${(content.htmlSize / 1024).toFixed(1)}KB`,
    });

  } catch (error) {
    console.error('[wiki-preview] error:', error);
    return res.status(500).json({ error: 'preview_failed', message: error.message });
  }
});

// POST /api/wiki-import
app.post('/api/wiki-import', async (req, res) => {
  const claims = requireAdmin(req, res);
  if (!claims) return;

  if (!wikiRateLimit(claims.sub)) {
    return res.status(429).json({ error: 'rate_limited', message: 'Aguarde 1 minuto entre importações' });
  }

  const { url, translate = false, multilinks = true, category = 'guias', status = 'draft' } = req.body || {};

  if (!url || !ALLOWED_WIKI_DOMAINS.some(d => url.includes(d))) {
    return res.status(400).json({ error: 'invalid_url', message: 'URL deve ser de ffxiv.consolegameswiki.com' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WIKI_REQUEST_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const html = await response.text();
    if (Buffer.byteLength(html, 'utf8') > WIKI_MAX_HTML_SIZE) {
      return res.status(400).json({ error: 'html_too_large', message: 'HTML excede 5MB' });
    }

    const $ = cheerio.load(html);
    const content = wikiExtractContent($, multilinks);
    if (!content) {
      return res.status(400).json({ error: 'content_not_found', message: 'Conteúdo da wiki não encontrado' });
    }

    const urlMap = new Map();
    let uploaded = 0;
    const totalImages = content.images.length;

    for (const img of content.images) {
      if (!img.originalUrl || img.originalUrl.startsWith('data:')) continue;

      const downloaded = await wikiDownloadImage(img.originalUrl);
      if (!downloaded) continue;

      try {
        const fileName = img.originalUrl.split('/').pop() || `image-${uploaded}.jpg`;
        const supabaseUrl = await wikiUploadImage(
          downloaded.buffer,
          fileName,
          downloaded.contentType
        );
        urlMap.set(img.originalUrl, supabaseUrl);
        uploaded++;
      } catch (err) {
        console.error(`[wiki-import] Falha ao upload imagem: ${img.originalUrl}`, err.message);
      }
    }

    let finalHtml = content.html;
    for (const [original, supabase] of urlMap) {
      finalHtml = finalHtml.replaceAll(original, supabase);
    }

    if (translate) {
      finalHtml = await wikiTranslateContent(finalHtml);
    }

    let generatedSlug = wikiGenerateSlug(content.title);

    const { data: existing } = await supabaseAdmin
      .from('posts')
      .select('id')
      .eq('slug', generatedSlug)
      .maybeSingle();

    if (existing) {
      generatedSlug = `${generatedSlug}-${Date.now().toString(36)}`;
    }

    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .insert({
        title: content.title,
        slug: generatedSlug,
        subtitle: content.subtitle,
        content: finalHtml,
        category: category,
        author_name: claims.name || claims.username || 'Admin',
        author_id: claims.sub,
        cover_image: urlMap.get(content.coverImage) || content.coverImage || '',
        tags: [],
        is_pinned: false,
        status: status === 'published' ? 'published' : 'draft',
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (postError) throw postError;

    return res.json({
      success: true,
      slug: post.slug,
      url: `/post/${post.slug}`,
      imagesCount: uploaded,
      totalImages,
      title: content.title,
      subtitle: content.subtitle,
      tables: content.tables,
      internalLinks: content.internalLinks,
      translated: translate,
    });

  } catch (error) {
    console.error('[wiki-import] error:', error);
    return res.status(500).json({ error: 'import_failed', message: error.message });
  }
});

// ── Static files (SPA) ────────────────────────────────────────
const DIST_DIR = join(__dirname, 'dist');
app.use(express.static(DIST_DIR));

// SPA fallback - serve index.html for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'not_found' });
  }
  res.sendFile(join(DIST_DIR, 'index.html'));
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
