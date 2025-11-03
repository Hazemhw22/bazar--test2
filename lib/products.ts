import { createServiceClient } from './supabase/service';
import { fetchShopsMapAndFilter } from './shops';
import { normalizeProduct } from './normalizers';

export interface FetchProductsOptions {
  limit?: number;
  orderBy?: { column: string; ascending?: boolean };
  onlyActive?: boolean;
  excludeCategoryIds?: number[]; // product.category values to exclude
  excludeShopCategoryId?: number | null; // if provided, products from shops with this category_shop_id will be excluded
}

export async function fetchProducts(options: FetchProductsOptions = {}) {
  const {
    limit = 12,
      orderBy = { column: 'created_at', ascending: false },
      // default to not querying legacy `active` column — components should opt-in if they need it
      onlyActive = false,
    excludeCategoryIds,
    excludeShopCategoryId = null,
  } = options;

  // Use service client to bypass RLS
  const supabase = createServiceClient();

  // Only request actual DB columns (avoid legacy aliases like `title`/`desc` which may not exist)
  let query = supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      images,
      price,
      sale_price,
      sale_percentage,
      image_url,
      onsale,
      shop_id,
      category_id,
      sub_category_id,
      created_at,
      updated_at,
      products_categories(id, name),
      products_sub_categories(id, name)
    `)
    .limit(limit);
  if (onlyActive) query = query.eq('active', true);
  if (excludeCategoryIds && excludeCategoryIds.length > 0) {
    // PostgREST expects an "in" array like (a,b)
    const inList = `(${excludeCategoryIds.join(',')})`;
    query = query.not('category_id', 'in', inList);
  }

  if (orderBy && orderBy.column) {
    query = query.order(orderBy.column, { ascending: !!orderBy.ascending });
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const productsRaw = (data || []) as any[];

  // Attach shops and optionally filter out products belonging to shops with excluded category
  const shopIds = Array.from(new Set(productsRaw.map((p) => p.shop_id).filter(Boolean)));
  let shopsMap: Record<string | number, any> = {};
  let allowedShopIds = shopIds.slice();
  if (shopIds.length > 0) {
    const res = await fetchShopsMapAndFilter(shopIds, excludeShopCategoryId ?? undefined);
    shopsMap = res.map || {};
    if (excludeShopCategoryId != null) allowedShopIds = res.allowedIds || [];
  }

  const productsWithShops = productsRaw
    .filter((p) => (excludeShopCategoryId != null ? allowedShopIds.includes(p.shop_id) : true))
    .map((p) => ({ ...p, shops: p.shops || shopsMap[p.shop_id] || null }));

  const normalized = productsWithShops.map((p) => normalizeProduct(p));
  return normalized;
}
