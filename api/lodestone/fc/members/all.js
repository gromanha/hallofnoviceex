import { getFCAllMembers } from '../../../lib/lodestone.js';

const LODESTONE_FC_ID = process.env.LODESTONE_FC_ID || '9234349560946612399';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const data = await getFCAllMembers(LODESTONE_FC_ID);
    return res.json(data);
  } catch (err) {
    console.error('[lodestone] fc all members error', err?.message || err);
    return res.status(500).json({ error: 'lodestone_fetch_failed' });
  }
}
