// components/MainProductSection.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getProducts } from "@/lib/actions/products";
import { ChevronRight } from "lucide-react";
import { useI18n } from "../lib/i18n";

interface MainProductSectionProps {
  title: string;
  linkToAll?: string;
  products?: Product[]; // يمكن تمرير المنتجات مباشرة
}

export default function MainProductSection({
  title,
  linkToAll = "/products",
  products: initialProducts = [],
}: MainProductSectionProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    // إذا تم تمرير منتجات جاهزة من props، لا نحتاج fetch
    if (initialProducts.length > 0) return;

    async function fetchProducts() {
      setLoading(true);
      try {
        // Use server action to bypass RLS
        const prods = await getProducts({ limit: 8, orderBy: { column: "created_at", ascending: false } });
        setProducts(prods || []);
      } catch (err) {
        console.error('Unexpected error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [initialProducts]);

  return (
    <section className="py-3 sm:py-6 px-2">
      {/* العنوان مع خط جانبي */}
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 sm:w-1.5 sm:h-6 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
         <Link
          href={linkToAll}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          {t("common.viewAll")} <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
      </div>

      {/* شبكة الكروت أفقياً (سحب يمين/يسار) */}
      <div className="relative">
        <div
          id={`product-scroller-${title}`}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-2 px-1"
        >
          {loading ? (
            <div className="flex gap-3 px-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-44 sm:w-56 md:w-64 h-56 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="snap-center flex-shrink-0 w-44 sm:w-56 md:w-64 ">
                <div className="h-full flex flex-col">
                  <ProductCard product={product} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">{t("common.noProducts")}</div>
          )}
        </div>
      </div>
    </section>
  );
}
