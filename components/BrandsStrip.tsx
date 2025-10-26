"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import type { CategoryBrand } from "@/lib/types";

interface Props {
  selectedBrand: number | null;
  setSelectedBrand: (id: number | null) => void;
  shopId?: number | null;
}

export default function BrandsStrip({ selectedBrand, setSelectedBrand, shopId }: Props) {
  const { t } = useI18n();
  const allLabel = t("common.all");
  const allInitial = (allLabel && String(allLabel).charAt(0)) || "A";
  const [brands, setBrands] = useState<CategoryBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  // brands are now stored in `products_brands` (per schema)
  let q = supabase.from("products_brands").select("*").order("id", { ascending: true });
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

  if (loading) return <p className="py-4 text-center">{t("brands.loading")}</p>;
  if (brands.length === 0) return <p className="py-4 text-center">{t("brands.none")}</p>;

  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t("brands.title")}</h2>
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
              <div className="w-full h-full flex items-center justify-center text-white font-bold">{allInitial}</div>
            </div>
            <span className="text-sm font-medium mt-1">{t("common.all")}</span>
          </button>

          {brands.slice(0, 12).map((brand) => (
            <button
              key={brand.id}
              onClick={() => setSelectedBrand(selectedBrand === Number(brand.id) ? null : Number(brand.id))}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${
                selectedBrand === Number(brand.id) ? "text-blue-600" : "text-gray-700 dark:text-gray-200"
              }`}
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                  selectedBrand === Number(brand.id) ? "bg-blue-600 border-blue-600" : "border-transparent bg-card"
                }`}
              >
                {brand.image_url ? (
                  <Image src={String(brand.image_url ?? "/placeholder.svg")} alt={String(brand.brand ?? brand.description ?? "brand")} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">{String(brand.name ?? "").charAt(0)}</div>
                )}
              </div>
              <span className="text-sm font-medium mt-1">{String(brand.name ?? "")}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
