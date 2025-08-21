import { createServerSupabaseClient } from "../../../lib/supabase";
import ProductDetail from "./product-page";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      id,
      created_at,
      shop,
      title,
      desc,
      price,
      images,
      category,
      sale_price,
      discount_type,
      discount_value,
      discount_start,
      discount_end,
      active,
      view_count,
      shops ( shop_name ),
      categories:category ( id, desc, title, created_at )
    `
    )
    .eq("id", Number(params.id)) // غيّر إلى params.id إذا كان id نص
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <ProductDetail
      params={{ id: params.id }}
      product={{
        ...product,
        shops: Array.isArray(product.shops) ? product.shops[0] : product.shops,
        categories: Array.isArray(product.categories)
          ? product.categories[0]
          : product.categories,
      }}
    />
  );
}
