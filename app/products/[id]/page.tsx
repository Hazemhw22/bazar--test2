import { createServerSupabaseClient } from "../../../lib/supabase";
import ProductDetail from "./product-page";
import { notFound } from "next/navigation";
import type { Product } from "../../../lib/type";
import { useEffect } from "react";

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

  useEffect(() => {
    async function incrementProductView(productId: string) {
      if (!product) return;
      await supabase
        .from("products")
        .update({ view_count: (product.view_count ?? 0) + 1 })
        .eq("id", productId);
    }
    if (product?.id) {
      incrementProductView(product.id);
    }
  }, [product?.id]);

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
