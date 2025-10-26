import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Product, Shop } from "./types";

// Avoid direct import of next/headers to prevent issues with pages directory
// We'll dynamically import it when needed in server component functions

// For server components
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Create a server client that can be used in Server Components
export const createServerComponentClient = async () => {
  // Dynamically import cookies to avoid issues with pages directory
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...options });
      },
    },
  });
};

// Singleton pattern for client-side
let browserClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    browserClient = createClient(supabaseUrl, supabaseKey);
  }
  return browserClient;
};

// Helper functions for common data fetching
export const fetchProducts = async (category: string | null = null) => {
  // Use createServerSupabaseClient for compatibility with both app and pages directories
  const supabase = createServerSupabaseClient();
  let query = supabase.from("products").select("*");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Product[];
};

export const fetchProductById = async (id: string | number) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
};

// Helper function to fetch shops (with work_hours as string[])
export const fetchShops = async () => {
  const supabase = createServerSupabaseClient();
  // Try ordering by created_at if present; fall back to ordering by id or no order.
  let shops: any[] | null = null;
  try {
    const res = await supabase.from("shops").select("*").order("created_at", { ascending: false });
    if (res.error) throw res.error;
    shops = res.data as any[];
  } catch (err) {
    // created_at may not exist in this schema - try ordering by id instead
    try {
      const res2 = await supabase.from("shops").select("*").order("id", { ascending: false });
      if (res2.error) throw res2.error;
      shops = res2.data as any[];
    } catch (err2) {
      // final fallback: plain select without order
      const res3 = await supabase.from("shops").select("*");
      if (res3.error) throw res3.error;
      shops = res3.data as any[];
    }
  }

  // جلب أوقات العمل لكل متجر وتطبيعها فقط إذا كانت غير موجودة في shops.work_hours
  for (const shop of shops) {
    const hasInlineWorkHours =
      Array.isArray((shop as any).work_hours) &&
      (shop as any).work_hours.length > 0;
    if (hasInlineWorkHours) continue;

    const { data: work_hours } = await supabase
      .from("work_hours")
      .select("*")
      .eq("shop_id", shop.id);

    const normalized = (work_hours ?? []).map((wh: any) => {
      const day =
        wh?.day ??
        wh?.Day ??
        wh?.day_of_week ??
        wh?.weekday ??
        wh?.week_day ??
        "";
      const open =
        (typeof wh?.open === "boolean" ? wh.open : undefined) ??
        (typeof wh?.is_open === "boolean" ? wh.is_open : undefined) ??
        (typeof wh?.isOpen === "boolean" ? wh.isOpen : undefined) ??
        false;
      const startTime =
        wh?.startTime ?? wh?.start_time ?? wh?.start ?? wh?.from ?? "";
      const endTime = wh?.endTime ?? wh?.end_time ?? wh?.end ?? wh?.to ?? "";
      return { day, open, startTime, endTime };
    });

    (shop as any).work_hours = normalized.map((wh) => JSON.stringify(wh));
  }

  return shops as Shop[];
};

// Helper function to increment shop visit count (client-side version)
export const incrementShopVisitCountClient = async (shopId: string) => {
  const supabase = getSupabaseBrowserClient();

  // First try to fetch visit_count; if missing try view_count; otherwise abort gracefully
  try {
    let currentCount = 0;
    // attempt visit_count
    const { data: currentShop, error: fetchError } = await supabase
      .from("shops")
      .select("visit_count")
      .eq("id", shopId)
      .maybeSingle();

    if (!fetchError && currentShop && (currentShop as any).visit_count !== undefined) {
      currentCount = Number((currentShop as any).visit_count) || 0;
    } else {
      // fallback to view_count
      const { data: altShop, error: altErr } = await supabase
        .from("shops")
        .select("view_count")
        .eq("id", shopId)
        .maybeSingle();

      if (!altErr && altShop && (altShop as any).view_count !== undefined) {
        currentCount = Number((altShop as any).view_count) || 0;
      } else if (fetchError && (fetchError as any).code === '42703') {
        // column doesn't exist; nothing to update
        return;
      }
    }

    const newVisitCount = currentCount + 1;

    // Try updating visit_count first, then view_count
    let updateResult = await (supabase as any)
      .from("shops")
      .update({ visit_count: newVisitCount })
      .eq("id", shopId);

    if (updateResult.error && (updateResult.error as any).code === '42703') {
      // visit_count column doesn't exist - try view_count
      await (supabase as any)
        .from("shops")
        .update({ view_count: newVisitCount })
        .eq("id", shopId);
    }
  } catch (err) {
    console.error("Error fetching/updating shop visit count:", err);
  }
};

// Create the main Supabase client with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseKey ? 'present' : 'missing'
  });
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

// Helper to build public storage URL for a given bucket and path.
// Usage: publicStorageUrl('shops', 'path/to/file.jpg') => https://<supabase>.supabase.co/storage/v1/object/public/shops/path%2Fto%2Ffile.jpg
export function publicStorageUrl(bucket: string, path?: string) {
  try {
    if (!bucket || !path) return "";
    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
    if (!base) return '';
    const p = String(path).replace(/^\/+/, '');
    return `${base}/storage/v1/object/public/${bucket}/${encodeURIComponent(p)}`;
  } catch (err) {
    return '';
  }
}