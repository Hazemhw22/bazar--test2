"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { CategoryBrand } from "@/lib/type";

interface Props {
  selectedBrand: number | null;
  setSelectedBrand: (id: number | null) => void;
  shopId?: number | null;
}

export default function BrandsStrip({ selectedBrand, setSelectedBrand, shopId }: Props) {
  const [brands, setBrands] = useState<CategoryBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let q = supabase.from("categories_brands").select("*").order("id", { ascending: true });
        if (shopId) q = q.eq("shop_id", shopId as any);
        const { data } = await q;
        if (!mounted) return;
        setBrands((data || []) as CategoryBrand[]);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setBrands([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [shopId]);

  if (loading) return <p className="py-4 text-center">Loading brands...</p>;
  if (brands.length === 0) return <p className="py-4 text-center">No brands available</p>;

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Brands</h2>
        </div>

        <div id="shop-brand-scroll" className="flex overflow-x-auto gap-3 scrollbar-hide pb-2 scroll-smooth">
          {/* All brand pill */}
          <button
            onClick={() => setSelectedBrand(null)}
            className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${
              selectedBrand === null ? "text-blue-600" : "text-gray-700 dark:text-gray-200"
            }`}
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                selectedBrand === null ? "border-blue-600" : "border-transparent bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center text-white font-bold">A</div>
            </div>
            <span className="text-sm font-medium mt-1">All</span>
          </button>

          {brands.slice(0, 12).map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${
                selectedBrand === brand.id ? "text-blue-600" : "text-gray-700 dark:text-gray-200"
              }`}
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                  selectedBrand === brand.id ? "bg-blue-600 border-blue-600" : "border-transparent bg-card"
                }`}
              >
                {brand.image_url ? (
                  <Image src={brand.image_url} alt={brand.brand || brand.description || "brand"} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">{(brand.brand || "")[0]}</div>
                )}
              </div>
              <span className="text-sm font-medium mt-1">{brand.brand}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
