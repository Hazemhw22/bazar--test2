import { supabase } from './supabase';

export interface ShopsFetchResult {
  map: Record<string | number, any>;
  allowedIds: Array<string | number>;
  list: Array<any>;
}

/**
 * Fetch shops by ids and optionally exclude shops with a given category_shop_id.
 * Returns a map (id => shop), the list of shops, and allowedIds (after excluding category).
 */
export async function fetchShopsMapAndFilter(ids: Array<string | number>, excludeCategoryId?: number): Promise<ShopsFetchResult> {
  const result: ShopsFetchResult = { map: {}, allowedIds: [], list: [] };
  if (!ids || ids.length === 0) return result;

  // select canonical and common legacy fields; avoid requesting columns that may not exist (e.g. category_shop_id)
  const { data, error } = await supabase
    .from('shops')
    .select('id, name, category_id, logo_url')
    .in('id', ids);

  if (error) {
    // don't throw here - let callers decide; return empty result
    console.warn('fetchShopsMapAndFilter error:', error);
    return result;
  }

  result.list = data || [];
  result.list.forEach((s: any) => {
    // normalize name from either `name` (canonical) or `shop_name` (legacy)
    const normalized = { ...s, display_name: s.name ?? s.name };
    result.map[s.id] = normalized;
    const shopCategory = Number(s.category_shop_id ?? s.category_id ?? 0);
    if (excludeCategoryId == null || shopCategory !== excludeCategoryId) {
      result.allowedIds.push(s.id);
    }
  });

  return result;
}
