import { getFCMembers } from '../../../src/lib/lodestone.js';

const LODESTONE_FC_ID = process.env.LODESTONE_FC_ID || '9234349560946612399';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
    const data = await getFCMembers(LODESTONE_FC_ID, page);
    return res.json(data);
  } catch (err) {
    console.error('[lodestone] fc members error', err?.message || err);
    return res.status(500).json({ error: 'lodestone_fetch_failed' });
  }
}
