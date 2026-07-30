import { getFCProfile, getFCMembers, getFCAllMembers } from '../lib/lodestone.js';

const FC_ID = process.env.LODESTONE_FC_ID || '9234349560946612399';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const segments = url.pathname.split('/').filter(Boolean);
    // segments: ['api', 'lodestone', ...rest]
    const slug = segments.slice(2).join('/');

    // GET /api/lodestone/fc
    if (slug === 'fc') {
      const data = await getFCProfile(FC_ID);
      return res.json(data);
    }

    // GET /api/lodestone/fc/members/all
    if (slug === 'fc/members/all') {
      const data = await getFCAllMembers(FC_ID);
      return res.json(data);
    }

    // GET /api/lodestone/fc/members?page=1
    if (slug === 'fc/members') {
      const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
      const data = await getFCMembers(FC_ID, page);
      return res.json(data);
    }

    return res.status(404).json({ error: 'endpoint_not_found' });
  } catch (err) {
    console.error('[lodestone] error', err?.message || err);
    return res.status(500).json({ error: 'lodestone_fetch_failed' });
  }
}
