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
} from '../lib/ffxiv.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const path = url.pathname;
    const segments = path.split('/').filter(Boolean);
    const slug = segments.slice(2).join('/');

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

    return res.status(404).json({ error: 'endpoint_not_found' });
  } catch (err) {
    console.error('[ffxiv] error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}
