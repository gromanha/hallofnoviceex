import { requireAdmin } from '../lib/auth.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const claims = requireAdmin(req);
  if (!claims) {
    return res.status(401).json({ error: 'unauthenticated' });
  }
  res.json({
    username: claims.username,
    display_name: claims.name,
  });
}
