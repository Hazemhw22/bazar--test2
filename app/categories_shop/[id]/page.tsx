"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { CategoryShop, Product } from "@/lib/type";
import { ProductCard } from "@/components/ProductCard";

export default function CategoryShopDetail() {
  const params = useParams();
  const id = Number(params?.id);
  const [category, setCategory] = useState<CategoryShop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { data: cats } = await supabase.from("categories_shop").select("*").eq("id", id).single();
        if (!mounted) return;
        setCategory(cats as CategoryShop);

        const { data: prods } = await supabase
          .from("products")
          .select("id, created_at, shop, title, desc, price, images, category, sale_price, active")
          .eq("category", id)
          .eq("active", true)
          .order("created_at", { ascending: false });
        if (!mounted) return;
        setProducts((prods || []) as Product[]);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="py-12 text-center">جاري التحميل...</div>;
  if (!category) return <div className="py-12 text-center">التصنيف غير موجود</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 relative">
          <Image src={category.image_url || "/placeholder.svg"} alt={category.title} fill className="object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{category.title}</h1>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-2 px-2 scroll-smooth">
          {products.map((p) => (
            <div key={p.id} className="snap-center flex-shrink-0 w-44 sm:w-52 md:w-56">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
