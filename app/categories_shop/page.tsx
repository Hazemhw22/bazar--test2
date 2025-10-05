"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CategoryShop } from "@/lib/type";
import { supabase } from "@/lib/supabase";

export default function CategoriesShopPage() {
  const [categories, setCategories] = useState<CategoryShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("categories_shop")
          .select("*")
          .order("id", { ascending: true });
        if (!mounted) return;
        setCategories((data || []) as CategoryShop[]);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="py-12 text-center">جارٍ تحميل التصنيفات...</div>;
  if (error) return <div className="py-12 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories_shop/${cat.id}`}
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 relative">
              <Image src={cat.image_url || "/placeholder.svg"} alt={cat.title} fill className="object-cover" />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{cat.title}</div>
              <div className="text-xs text-muted-foreground">{cat.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
