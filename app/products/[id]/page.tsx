"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../../../lib/i18n";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import type { Product } from "../../../lib/types";
import ProductDetail from "./product-page";

export default function ProductPage() {
  const params = useParams();
  const { t } = useI18n();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("products")
          .select("*, shops(*), products_categories(*), image_url, images")
          .eq("id", productId)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
  setError(err instanceof Error ? err.message : "An error occurred while fetching the product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg">
  {t("common.loading")}
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg text-red-500">
  {error || t("product.notFound")}
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
