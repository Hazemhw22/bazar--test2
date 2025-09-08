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
// Supabase function to increment product cart count
export async function incrementProductCartCount(productId: string) {
  const { data, error } = await supabase.from("products").select("cart_count").eq("id", productId).single()

  if (error || !data) return

  const newCount = (data.cart_count ?? 0) + 1

  await supabase.from("products").update({ cart_count: newCount }).eq("id", productId)
}
export async function incrementCategoryViewCount(categoryId: number) {
  const { data, error } = await supabase
    .from("categories")
    .select("view_count")
    .eq("id", categoryId)  // هنا number
    .single()

  if (error || !data) return

  const newCount = (data.view_count ?? 0) + 1

  await supabase
    .from("categories")
    .update({ view_count: newCount })
    .eq("id", categoryId)
}
