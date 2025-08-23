import { supabase } from "./supabase"

// دالة لزيادة عدد زيارات المتجر
export async function incrementShopVisitCount(shopId: string) {
  try {
    const { error } = await supabase.rpc("increment_shop_visit_count", {
      shop_id: shopId,
    })
    if (error) {
      console.error("Error incrementing shop visit count:", error)
    }
  } catch (error) {
    console.error("Error incrementing shop visit count:", error)
  }
}