"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import type { Product } from "../../../lib/type";
import ProductDetail from "./product-page";

export default function ProductPage() {
  const params = useParams();
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
          .select("*, shops(*), categories(*)")
          .eq("id", productId)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "حدث خطأ أثناء جلب المنتج");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg">
        جاري تحميل المنتج...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg text-red-500">
        {error || "لم يتم العثور على المنتج"}
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
