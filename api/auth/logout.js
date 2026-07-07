import { clearAuthCookie } from '../lib/auth.js';

export default async function handler(_req, res) {
  clearAuthCookie(res);
  res.json({ ok: true });
}
