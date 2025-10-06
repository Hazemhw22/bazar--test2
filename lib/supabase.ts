import { createClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { Product, Shop } from "./type";

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
  const { data: shops, error } = await supabase
    .from("shops")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

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

  // First get the current visit_count
  const { data: currentShop, error: fetchError } = await supabase
    .from("shops")
    .select("visit_count")
    .eq("id", shopId)
    .single();

  if (fetchError) {
    console.error("Error fetching shop:", fetchError);
    return;
  }

  // Increment the visit_count (handle null/undefined case)
  const currentCount = Number(((currentShop as any)?.visit_count) ?? 0) || 0;
  const newVisitCount = currentCount + 1;

  // Update the visit_count
  const { error: updateError } = await (supabase as any)
    .from("shops")
    .update({ visit_count: newVisitCount })
    .eq("id", shopId);

  if (updateError) {
    console.error("Error updating visit count:", updateError);
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