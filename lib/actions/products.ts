"use server";

import { fetchProducts } from '../../lib/products';
import { fetchShops } from '../../lib/supabase';
import { fetchShopsMapAndFilter } from '../../lib/shops';

// Server actions for client components to bypass RLS
export async function getProducts(options?: any) {
  try {
    return await fetchProducts(options);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getAllShops() {
  try {
    return await fetchShops();
  } catch (error) {
    console.error('Error fetching shops:', error);
    throw error;
  }
}

export async function getShopsMapAndFilter(ids: Array<string | number>, excludeCategoryId?: number) {
  try {
    return await fetchShopsMapAndFilter(ids, excludeCategoryId);
  } catch (error) {
    console.error('Error fetching shops map:', error);
    throw error;
  }
}

// Server action for fetching products by shop ID
export async function getProductsByShop(shopId: string | number) {
  try {
    const { createServiceClient } = await import('../supabase/service');
    const supabase = createServiceClient();
    
    let query = supabase.from("products").select("*");
    try {
      // test presence of shop_id column (safe quick probe)
      const test = await supabase.from("products").select("shop_id").limit(1).maybeSingle();
      if (!(test as any).error) {
        query = query.eq("shop_id", shopId);
      } else {
        query = query.eq("shop", shopId);
      }
    } catch (err) {
      query = query.eq("shop", shopId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch (error) {
    console.error('Error fetching products by shop:', error);
    throw error;
  }
}

// Server action for fetching categories
export async function getCategories() {
  try {
    const { createServiceClient } = await import('../supabase/service');
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("products_categories")
      .select("name, id, image_url, description, created_at, updated_at, shop_id");
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

// Server action for fetching shops categories
export async function getShopsCategories() {
  try {
    const { createServiceClient } = await import('../supabase/service');
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("shops_categories")
      .select("*");
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching shops categories:', error);
    throw error;
  }
}

// Server action for fetching subcategories
export async function getSubcategories(categoryId: number) {
  try {
    const { createServiceClient } = await import('../supabase/service');
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("products_sub_categories")
      .select("id, name, description, shop_id, product_category_id, image_url")
      .eq("product_category_id", categoryId);
    
    if (error) throw error;
    // تحويل البيانات لتتوافق مع الواجهة الحالية
    return (data || []).map(item => ({
      id: item.id,
      title: item.name,
      name: item.name,
      description: item.description,
      image_url: item.image_url
    }));
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
}

// Server action for fetching shop subcategories
export async function getShopSubcategories(categoryId: number) {
  try {
    const { createServiceClient } = await import('../supabase/service');
    const supabase = createServiceClient();
    
    const { data, error } = await supabase
      .from("shops_sub_categories")
      .select("*")
      .eq("category_id", categoryId);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching shop subcategories:', error);
    throw error;
  }
}

// Server action for fetching all categories with products
export async function getCategoriesWithProducts() {
  try {
    const { createServiceClient } = await import('../supabase/service');
    const supabase = createServiceClient();
    
    // Fetch categories
    const { data: cats, error: catsError } = await supabase
      .from("products_categories")
      .select("*")
      .order("id", { ascending: true });

    if (catsError) throw catsError;
    const categoriesList = cats || [];

    // Fetch products for each category
    const selectFields = "id, created_at, updated_at, shop_id, name, description, price, image_url, images, category_id, sale_price, onsale";
    
    const promises = categoriesList.map(async (c: any) => {
      const { data, error } = await supabase
        .from("products")
        .select(selectFields)
        .eq("category_id", c.id);
      
      if (error) throw error;
      return { categoryId: c.id, products: data || [] };
    });

    const results = await Promise.all(promises);
    const map: Record<number, any[]> = {};
    results.forEach(({ categoryId, products }) => {
      map[Number(categoryId)] = products;
    });

    return { categories: categoriesList, productsMap: map };
  } catch (error) {
    console.error('Error fetching categories with products:', error);
    throw error;
  }
}

// Server action for fetching popular stores
export async function getPopularStores() {
  try {
    const { createServiceClient } = await import('../supabase/service');
    const supabase = createServiceClient();
    
    // fetch shops using canonical column names from the new schema
    const { data: shopsData, error: shopsError } = await supabase
      .from("shops")
      .select("id,name,logo_url,cover_url,category_id");
    
    if (shopsError || !shopsData) {
      return [];
    }

    // fetch products and compute counts per shop
    const { data: productsData } = await supabase.from("products").select("shop_id");
    const counts: Record<string, number> = {};
    (productsData || []).forEach((p: any) => {
      const key = String((p as any).shop_id ?? "");
      counts[key] = (counts[key] || 0) + 1;
    });

    const shopsWithCount = (shopsData || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      cover_url: s.cover_url,
      logo_url: s.logo_url,
      category_id: s.category_id,
      productsCount: counts[String(s.id)] || 0,
    }));

    // keep only the shops that were returned, and preserve the order of wantedIds
    const byId: Record<string | number, any> = {};
    shopsWithCount.forEach((s: any) => {
      byId[s.id] = s;
    });

    // Determine top3: prefer global wantedIds if provided, otherwise use first 3 shops returned
    const globalWanted: any = (globalThis as any).wantedIds;
    let top3: any[] = [];
    if (Array.isArray(globalWanted) && globalWanted.length > 0) {
      top3 = globalWanted.map((id: any) => byId[id] || null).filter(Boolean);
    } else {
      top3 = shopsWithCount.slice(0, 3);
    }

    // fill with placeholders if fewer than 3
    while (top3.length < 3) {
      top3.push({ id: `placeholder-${top3.length}`, name: "", logo_url: "/placeholder.svg", productsCount: 0 } as any);
    }

    return top3;
  } catch (error) {
    console.error('Error fetching popular stores:', error);
    throw error;
  }
}
