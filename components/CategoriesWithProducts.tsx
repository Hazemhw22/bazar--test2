"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product, CategoryShop } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "./ProductCard";
import { useI18n } from "../lib/i18n";

export default function CategoriesWithProducts() {
  const [categories, setCategories] = useState<CategoryShop[]>([]);
  const [productsMap, setProductsMap] = useState<Record<number, Product[]>>({});
  const [excludedShopIds, setExcludedShopIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | "all">("all");
  const { t } = useI18n();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);

      // fetch shops that belong to category_shop_id = 15 (restaurants) and exclude them
      const { data: restShops } = await supabase.from("shops").select("id").eq("category_shop_id", 15);
      const excludedShops = (restShops || []).map((s: any) => s.id as number);
      setExcludedShopIds(excludedShops);

      // fetch categories (include all categories) - we'll show featured categories
      const { data: cats } = await supabase
        .from("shops_categories")
        .select("*")
        .neq("id", 15) // do not include category_shop id = 15
        .order("id", { ascending: true })
        .limit(12);

      const categoriesList = (cats || []) as CategoryShop[];
      if (!mounted) return;
      setCategories(categoriesList);

      const promises = categoriesList.map(async (c: any) => {
        // fetch shops that belong to this category (shops.category_shop_id === c.id)
        const { data: shopsOfCategory } = await supabase
          .from("shops")
          .select("id")
          .eq("category_shop_id", c.id);

        const shopIds = (shopsOfCategory || []).map((s: any) => Number(s.id));

        // build products query: products where shop IN shopIds and active
        if (shopIds.length > 0) {
          return supabase
            .from("products")
            // prefer canonical columns: name, description, shop_id
            .select("id, created_at, updated_at, shop_id, name, description, price, images, category_id, sale_price, onsale")
            .in("shop_id", shopIds)
            .eq("onsale", true)
            .limit(12);
        }

        // fallback: attempt to fetch products by category_id if no shops found
        return supabase
          .from("products")
          .select("id, created_at, updated_at, shop_id, name, description, price, images, category_id, sale_price, onsale")
          .eq("category_id", c.id)
          .eq("onsale", true)
          .limit(12);
      });

      const results = await Promise.all(promises);
      const map: Record<number, Product[]> = {};
      // results may be array of promises resolved values
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        map[Number(categoriesList[i].id)] = (r && r.data) ? (r.data as Product[]) : [];
      }
      if (!mounted) return;
      setProductsMap(map);
      setLoading(false);

      if (categoriesList.length > 0) setSelected("all");
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const allProducts = useMemo(() => {
      const arr = Object.values(productsMap).flat();
    const seen = new Set<string>();
    const out: Product[] = [];
    for (const p of arr) {
      // skip products linked to excluded category ids (15, 18, 34)
      const catId = Number((p as any).category);
      if ([15, 18, 56].includes(catId)) continue;
      const pid = String(p.id);
      if (!seen.has(pid)) {
        seen.add(pid);
        out.push(p);
      }
    }
    return out;
  }, [productsMap]);

  if (loading) {
    return (
      <section className="py-8 bg-green-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center py-8">{t("categories.loading")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-green-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
  <h2 className="text-xl font-bold mb-6">{t("categories.featured")}</h2>

        {/* Categories bar (same UI/behavior as shop page) */}
        <div className="mb-6 relative">
          <div className="relative">
            <button
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const el = document.getElementById("categories-with-products-scroll");
                if (el) el.scrollBy({ left: -150, behavior: "smooth" });
              }}
              aria-label="Scroll Left"
            >
              <svg className="rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div id="categories-with-products-scroll" className="flex overflow-x-auto gap-3 scrollbar-hide pb-2 scroll-smooth">
              <button
                key="all"
                onClick={() => setSelected("all")}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${selected === "all" ? "text-blue-600" : "text-gray-700 dark:text-gray-200"}`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${selected === "all" ? "border-blue-600" : "border-transparent"} bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold`}>
                  <span className={selected === "all" ? "text-blue-600" : "text-gray-700 dark:text-gray-200"}>A</span>
                </div>
                  <span className="text-sm font-medium mt-1">{t("common.all")}</span>
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelected(Number(cat.id))}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${selected === Number(cat.id) ? "text-blue-600" : "text-gray-700 dark:text-gray-200"}`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${selected === Number(cat.id) ? "bg-blue-600 border-blue-600" : "border-transparent"}`}>
                    {cat.image_url ? (
                      <Image src={String(cat.image_url ?? "/placeholder.svg")} alt={String(cat.name ?? "")} fill className="object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">{String(cat.name ?? "").charAt(0)}</div>
                    )}
                  </div>
                  <span className="text-sm font-medium mt-1">{String(cat.name ?? "")}</span>
                </button>
              ))}
            </div>

            <button
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const el = document.getElementById("categories-with-products-scroll");
                if (el) el.scrollBy({ left: 150, behavior: "smooth" });
              }}
              aria-label="Scroll Right"
            >
              <svg className="-rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </div>

        <div className="relative">
          <button
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              const el = document.getElementById("categories-products-scroll");
              if (el) el.scrollBy({ left: -300, behavior: "smooth" });
            }}
            aria-label="Scroll Left"
          >
            <svg className="rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div id="categories-products-scroll" className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-2 px-2 scroll-smooth">
            {(selected === "all" ? allProducts : productsMap[selected as number] || []).map((p) => (
              <div key={p.id} className="snap-center flex-shrink-0 w-44 sm:w-52 md:w-56">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <button
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              const el = document.getElementById("categories-products-scroll");
              if (el) el.scrollBy({ left: 300, behavior: "smooth" });
            }}
            aria-label="Scroll Right"
          >
            <svg className="-rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
