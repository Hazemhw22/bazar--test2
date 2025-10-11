"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ShoppingBag, Store } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Product, Shop } from "@/lib/type";
import { ProductCard } from "@/components/ProductCard";

export default function BrandDetail() {
  const params = useParams();
  const id = Number(params?.id);
  const [brand, setBrand] = useState<any | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { data: b } = await supabase.from("categories_brands").select("*").eq("id", id).single();
        if (!mounted) return;
        setBrand(b || null);

        // fetch products by brand - assumption: products table has a `brand_id` or `brand` column
        const { data: prods } = await supabase
          .from("products")
          .select("id, created_at, shop, title, desc, price, images, category, sale_price, active, brand_id, brand")
          .or(`brand_id.eq.${id},brand.eq.${b?.brand ?? b?.name ?? ''}`)
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

  // fetch shops for products
  useEffect(() => {
    async function loadShops() {
      try {
        const shopIds = Array.from(new Set(products.map((p) => String((p as any).shop))));
        if (shopIds.length === 0) {
          setShops([]);
          return;
        }
        const { data } = await supabase.from("shops").select("*").in("id", shopIds);
        setShops((data || []) as Shop[]);
      } catch (err) {
        console.error(err);
        setShops([]);
      }
    }
    loadShops();
  }, [products]);

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (!brand) return <div className="py-12 text-center">العلامة التجارية غير موجودة</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative mb-6">
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 relative flex-shrink-0">
              <Image src={brand.image_url || "/placeholder.svg"} alt={brand.brand || brand.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{brand.brand || brand.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">{brand.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-center border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><ShoppingBag size={16} /> Products</p>
              <p className="font-bold text-foreground">{products.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Store size={16} /> Shops</p>
              <p className="font-bold text-foreground">{shops.length}</p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-6 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p.id} className="">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
