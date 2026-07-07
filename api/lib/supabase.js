import { createClient } from '@supabase/supabase-js';

let _admin = null;
let _anon = null;

function getEnv(name) {
  const val = process.env[name];
  if (!val) {
    throw new Error(`[config] Missing env var: ${name}. Configure it in Vercel → Settings → Environment Variables.`);
  }
  return val;
}

export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}

export function getSupabaseAnon() {
  if (!_anon) {
    _anon = createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_ANON_KEY'), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _anon;
}
