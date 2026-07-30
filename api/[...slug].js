import {
  searchItems,
  getItemById,
  searchRecipes,
  getRecipeById,
  getCharacterById,
  searchQuests,
  searchDungeons,
  searchTrials,
  searchRaids,
  getMarketPrices,
  searchWiki,
  getWikiPage,
  getCacheStats,
  WORLDS,
} from '../src/lib/ffxiv.js';
import { getFCProfile, getFCMembers, getFCAllMembers } from '../src/lib/lodestone.js';

const LODSTONE_FC_ID = process.env.LODESTONE_FC_ID || '9234349560946612399';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const segments = url.pathname.split('/').filter(Boolean);
    // segments[0] = 'api', segments[1] = namespace ('ffxiv' | 'lodestone'), rest = slug
    const namespace = segments[1] || '';
    const slug = segments.slice(2).join('/');

    // ── Lodestone FC routes ──────────────────────────────────
    if (namespace === 'lodestone') {
      if (slug === 'fc') {
        return res.json(await getFCProfile(LODSTONE_FC_ID));
      }
      if (slug === 'fc/members/all') {
        return res.json(await getFCAllMembers(LODSTONE_FC_ID));
      }
      if (slug === 'fc/members') {
        const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
        return res.json(await getFCMembers(LODSTONE_FC_ID, page));
      }
      return res.status(404).json({ error: 'endpoint_not_found' });
    }

    // ── FFXIV Game Data routes ───────────────────────────────
    if (namespace === 'ffxiv') {
      if (slug === 'worlds') {
        return res.json({ worlds: WORLDS });
      }

      if (slug === 'cache/stats') {
        return res.json(getCacheStats());
      }

      if (slug === 'items') {
        const search = url.searchParams.get('search');
        const limit = url.searchParams.get('limit') || '20';
        if (!search || search.length < 2) {
          return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }
        return res.json(await searchItems(search, Math.min(Number(limit), 50)));
      }

      if (slug.startsWith('items/')) {
        const id = slug.split('/')[1];
        if (!id || isNaN(Number(id))) {
          return res.status(400).json({ error: 'Invalid item ID' });
        }
        return res.json(await getItemById(Number(id)));
      }

      if (slug === 'recipes') {
        const search = url.searchParams.get('search');
        const limit = url.searchParams.get('limit') || '20';
        if (!search || search.length < 2) {
          return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }
        return res.json(await searchRecipes(search, Math.min(Number(limit), 50)));
      }

      if (slug.startsWith('recipes/')) {
        const id = slug.split('/')[1];
        if (!id || isNaN(Number(id))) {
          return res.status(400).json({ error: 'Invalid recipe ID' });
        }
        return res.json(await getRecipeById(Number(id)));
      }

      if (slug.startsWith('characters/')) {
        const id = slug.split('/')[1];
        if (!id || isNaN(Number(id))) {
          return res.status(400).json({ error: 'Invalid character ID' });
        }
        return res.json(await getCharacterById(Number(id)));
      }

      if (slug === 'quests') {
        const search = url.searchParams.get('search');
        const limit = url.searchParams.get('limit') || '20';
        if (!search || search.length < 2) {
          return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }
        return res.json(await searchQuests(search, Math.min(Number(limit), 50)));
      }

      if (slug === 'instances') {
        const search = url.searchParams.get('search');
        const type = url.searchParams.get('type');
        const limit = url.searchParams.get('limit') || '20';
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
          default:
            result = await searchDungeons(search, Math.min(Number(limit), 50));
            break;
        }
        return res.json(result);
      }

      if (slug === 'market') {
        const items = url.searchParams.get('items');
        const world = url.searchParams.get('world') || 'Excalibur';
        if (!items) {
          return res.status(400).json({ error: 'Items parameter required (comma-separated IDs)' });
        }
        const itemIds = items.split(',').map(Number).filter(n => !isNaN(n));
        if (itemIds.length === 0) {
          return res.status(400).json({ error: 'No valid item IDs provided' });
        }
        if (!WORLDS.includes(world)) {
          return res.status(400).json({ error: 'Invalid world', available_worlds: WORLDS.slice(0, 10) });
        }
        return res.json(await getMarketPrices(world, itemIds));
      }

      if (slug.startsWith('market/')) {
        const itemId = slug.split('/')[1];
        const world = url.searchParams.get('world') || 'Excalibur';
        if (!itemId || isNaN(Number(itemId))) {
          return res.status(400).json({ error: 'Invalid item ID' });
        }
        if (!WORLDS.includes(world)) {
          return res.status(400).json({ error: 'Invalid world', available_worlds: WORLDS.slice(0, 10) });
        }
        return res.json(await getMarketPrices(world, Number(itemId)));
      }

      if (slug === 'wiki/search') {
        const q = url.searchParams.get('q');
        const limit = url.searchParams.get('limit') || '10';
        if (!q || q.length < 2) {
          return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }
        return res.json(await searchWiki(q, Math.min(Number(limit), 50)));
      }

      if (slug.startsWith('wiki/')) {
        const title = slug.split('/').slice(1).join('/');
        if (!title) {
          return res.status(400).json({ error: 'Page title required' });
        }
        return res.json(await getWikiPage(decodeURIComponent(title)));
      }
    }

    return res.status(404).json({ error: 'endpoint_not_found' });
  } catch (err) {
    console.error('[api] error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
