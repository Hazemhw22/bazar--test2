"use client";
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

export function ProductViewCounter({ productId, currentCount }: { productId: string, currentCount?: number }) {
  useEffect(() => {
    async function incrementProductView() {
      await supabase
        .from("products")
        .update({ view_count: (currentCount ?? 0) + 1 })
        .eq("id", productId);
    }
    if (productId) incrementProductView();
  }, [productId]);
  return null;
}