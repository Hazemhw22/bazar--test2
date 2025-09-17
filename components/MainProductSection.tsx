// components/MainProductSection.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/type";
import { supabase } from "@/lib/supabase";
import { ChevronRight } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    // إذا تم تمرير منتجات جاهزة من props، لا نحتاج fetch
    if (initialProducts.length > 0) return;

    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, created_at, shop, title, desc, price, images, category, sale_price, discount_type, discount_value, discount_start, discount_end, active,
          shops:shops(shop_name),
          categories:id, categories:title, categories:desc, categories:created_at
        `)
        .eq("active", true)
        .limit(8);

      if (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } else {
        setProducts(
          (data ?? []).map((product: any) => ({
            ...product,
            shops:
              product.shops && Array.isArray(product.shops)
                ? product.shops[0]
                : product.shops,
            categories:
              product.categories && Array.isArray(product.categories)
                ? product.categories[0]
                : product.categories,
          }))
        );
      }
      setLoading(false);
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
          href="/products"
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
        >
          View All <ChevronRight className="h-4 w-4 ml-1" />
      </Link>
      </div>

      {/* شبكة الكروت */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-4">
        {loading ? (
          <div className="col-span-2 md:col-span-6 text-center py-10">
            جاري التحميل...
          </div>
        ) : products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="col-span-2 md:col-span-6 text-center py-10">
            لا توجد منتجات
          </div>
        )}
      </div>
    </section>
  );
}
