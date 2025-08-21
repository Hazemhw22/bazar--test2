// components/MainProductSection.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase"; // عدّل المسار حسب مكان ملف supabase client لديك

type Product = {
  id: number;
  created_at: string;
  shop: number;
  title: string;
  desc: string;
  price: number;
  images: string[];
  category: number | null;
  sale_price?: number | null;
  discount_type?: "fixed" | "percentage" | null;
  rating?: number;
  reviews?: number;
  active: boolean;
  [key: string]: any;
};

export interface MainProductSectionProps {
  title: string;
  linkToAll: string;
  products: Array<{
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    // Add other product fields as needed
  }>;
  // other props if any
}

export default function MainProductSection({
  title,
  linkToAll = "/products",
  products,
}: MainProductSectionProps) {
  const [loading, setLoading] = useState(true);
  const [productsState, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase
        .from("products")
        .select(
          `
          id, created_at, shop, title, desc, price, images, category, sale_price, discount_type, discount_value, discount_start, discount_end, active,
          shops:shops(shop_name),
          categories:id, categories:title, categories:desc, categories:created_at
        `
        )
        .eq("active", true)
        .limit(8);

      const { data, error } = await query;
      console.log("products data", data, "error", error);

      if (error) {
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
  }, []);
  return (
    <section className="py-6 px-2">
      {/* بانر العنوان في المنتصف */}
      <div className="relative mb-6 rounded-xl overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg h-12 flex items-center justify-center">
        <h2 className="text-xl sm:text-3xl font-extrabold text-white text-center">
          {title}
        </h2>
      </div>

      {/* شبكة الكروت */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-4 text-center py-10">جاري التحميل...</div>
        ) : productsState.length > 0 ? (
          productsState.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-4 text-center py-10">لا توجد منتجات</div>
        )}
      </div>
      {/* بانر سفلي - عرض الكل */}
      <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 shadow-md p-3 sm:p-4 flex flex-row items-center justify-between gap-2 sm:gap-4 text-base sm:text-lg">
        <Link
          href={linkToAll}
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-sm sm:text-base"
        >
          عرض الكل
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 font-medium text-base sm:text-lg">
          <MoreHorizontal className="w-5 h-5" />
          {title}
        </div>
      </div>
    </section>
  );
}
