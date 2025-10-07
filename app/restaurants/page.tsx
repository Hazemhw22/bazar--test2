"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { CategorySubShop, Shop, Product } from "@/lib/type";
import { ProductCard } from "@/components/ProductCard";
import AdBanner from "@/components/AdBanner";
import MainProductSection from "@/components/MainProductSection";
import { HeroSectionRes } from "@/components/hero-section-res";

export default function RestaurantsPage() {
  const CATEGORY_SHOP_ID = 15; // restaurants category_shop id
  const [subcats, setSubcats] = useState<CategorySubShop[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // fetch categories by id or by title 'מסעדות' to find restaurants category ids
        const { data: catsById } = await supabase.from("categories_shop").select("*").eq("id", CATEGORY_SHOP_ID);
        const { data: catsByTitle } = await supabase.from("categories_shop").select("*").eq("title", "מסעדות");
        const catsCombined = Array.from(new Map([...(catsById || []), ...(catsByTitle || [])].map((c: any) => [c.id, c])).values());
        const categoryIds = (catsCombined || []).map((c: any) => c.id);

        // fetch subcategories for those category ids
        if (categoryIds.length > 0) {
          const { data: subs } = await supabase
            .from("categories_sub_shop")
            .select("*")
            .in("category_id", categoryIds)
            .order("created_at", { ascending: true });
          setSubcats((subs || []) as CategorySubShop[]);

          // fetch shops attached to these category ids
          const { data: sh } = await supabase.from("shops").select("*").in("category_shop_id", categoryIds);
          let fetchedShops = (sh || []) as Shop[];

          // fetch products that belong to these shops
          const shopIds = fetchedShops.map((s: any) => String(s.id));
          let prodsFromSh: Product[] = [];
          if (shopIds.length > 0) {
            const { data: prods } = await supabase
              .from("products")
              .select("*")
              .in("shop", shopIds)
              .eq("active", true)
              .order("created_at", { ascending: false });
            prodsFromSh = (prods || []) as Product[];
          }

          // also fetch products that have category = these category ids (some products may be tied directly)
          let prodsFromCategory: Product[] = [];
          const { data: prodsCat } = await supabase
            .from("products")
            .select("*")
            .in("category", categoryIds)
            .eq("active", true)
            .order("created_at", { ascending: false });
          prodsFromCategory = (prodsCat || []) as Product[];

          // merge products (dedupe by id)
          const prodMap = new Map<string, Product>();
          for (const p of [...prodsFromSh, ...prodsFromCategory]) {
            prodMap.set(String((p as any).id), p);
          }
          const mergedProducts = Array.from(prodMap.values());
          setProducts(mergedProducts as Product[]);

          // ensure shops referenced by merged products are included
          const productShopIds = Array.from(new Set(mergedProducts.map((p) => String((p as any).shop))));
          const missingShopIds = productShopIds.filter((id) => !fetchedShops.find((s) => String(s.id) === id));
          if (missingShopIds.length > 0) {
            const { data: extraSh } = await supabase.from("shops").select("*").in("id", missingShopIds);
            if (extraSh && extraSh.length > 0) {
              fetchedShops = [...fetchedShops, ...((extraSh as Shop[]) || [])];
            }
          }

          setShops(fetchedShops);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const productsByShop = useMemo(() => {
    const map: Record<string, Product[]> = {};
    const shopIds = new Set(shops.map((s) => String(s.id)));
    const restaurantProducts = products.filter((p) => shopIds.has(String((p as any).shop || "")));
    for (const p of restaurantProducts) {
      const key = String((p as any).shop || "");
      map[key] = map[key] || [];
      map[key].push(p);
    }
    return map;
  }, [products, shops]);

  const restaurantProducts = useMemo(() => {
    const shopIds = new Set(shops.map((s) => String(s.id)));
    return products.filter((p) => shopIds.has(String((p as any).shop || "")));
  }, [products, shops]);

  if (loading) return <div className="py-12 text-center">Loading restaurants...</div>;

  return (
    <main className="min-h-screen">
  {/* Hero */}
  <HeroSectionRes />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subcategories strip */}
        {subcats.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {subcats.map((sc) => (
                <Link key={sc.id} href={`/restaurants?sub=${sc.id}`} className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 relative">
                    {sc.image_url ? (
                      <Image src={sc.image_url} alt={sc.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">{sc.title?.[0]}</div>
                    )}
                  </div>
                  <div className="text-sm">{sc.title}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Offers with restaurants: clicking a shop opens inline product scroller */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">عروض المطاعم</h2>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4 items-center px-1">
              {shops.map((s) => (
                <div key={s.id} className="flex-shrink-0 w-28 text-center">
                  <button
                    onClick={() => setActiveShop((prev) => (prev?.id === s.id ? null : s))}
                    className="flex flex-col items-center gap-2 w-full"
                  >
                    <div className={`w-20 h-20 rounded-full overflow-hidden bg-gray-100 relative border ${activeShop?.id === s.id ? 'ring-2 ring-primary' : ''}`}>
                      <Image src={(s.logo_url as string) || "/placeholder.svg"} alt={s.shop_name} fill className="object-cover" />
                    </div>
                    <div className="text-sm truncate w-full">{s.shop_name}</div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Single inline panel for the active shop */}
          {activeShop && (
            <div className="mt-4 bg-white dark:bg-gray-900 rounded-lg p-3 shadow-inner border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 relative">
                    <Image src={(activeShop.logo_url as string) || "/placeholder.svg"} alt={activeShop.shop_name} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold">{activeShop.shop_name}</div>
                    <div className="text-sm text-muted-foreground">{activeShop.address}</div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">{(productsByShop[String(activeShop.id)] || []).length} منتجات</div>
              </div>

              <div className="relative">
                <button
                  aria-label="scroll left"
                  className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    const el = document.getElementById(`shop-products-scroll-${activeShop.id}`);
                    if (el) el.scrollBy({ left: -240, behavior: "smooth" });
                  }}
                >‹</button>

                <div id={`shop-products-scroll-${activeShop.id}`} className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1 scroll-smooth">
                  {(productsByShop[String(activeShop.id)] || []).map((p) => (
                    <div key={p.id} className="snap-center flex-shrink-0 w-40 sm:w-44 md:w-48">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>

                <button
                  aria-label="scroll right"
                  className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    const el = document.getElementById(`shop-products-scroll-${activeShop.id}`);
                    if (el) el.scrollBy({ left: 240, behavior: "smooth" });
                  }}
                >›</button>
              </div>
            </div>
          )}
        </section>

        {/* Popular restaurants (all shops) */}
        {shops.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xl font-bold mb-3">المطاعم المشهورة</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {shops.map((s) => (
                <Link key={s.id} href={`/shops/${s.id}`} className="flex flex-col items-center gap-2 w-32">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 relative">
                    <Image src={(s.logo_url as string) || "/placeholder.svg"} alt={s.shop_name} fill className="object-cover" />
                  </div>
                  <div className="text-sm text-center truncate">{s.shop_name}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Ad banner between popular restaurants and main product sections */}
        <div className="mt-8">
          <AdBanner
            imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
            href="/products?filter=deals"
            title="Special Restaurant Deals"
            subtitle="Discover discounts from local restaurants"
          />

          <div className="mt-6 space-y-8">
            <MainProductSection title="More dishes" products={restaurantProducts.slice(0,4)} linkToAll="/products" />
             <AdBanner
            imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
            href="/products?filter=deals"
            title="Special Restaurant Deals"
            subtitle="Discover discounts from local restaurants"
          />
            <MainProductSection title="Chef's Picks" products={restaurantProducts.slice(0,4)} linkToAll="/products" />
             <AdBanner
            imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
            href="/products?filter=deals"
            title="Special Restaurant Deals"
            subtitle="Discover discounts from local restaurants"
          />
            <MainProductSection title="Trending Now" products={restaurantProducts.slice(0,4)} linkToAll="/products" />
             <AdBanner
            imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
            href="/products?filter=deals"
            title="Special Restaurant Deals"
            subtitle="Discover discounts from local restaurants"
          />
            <MainProductSection title="Special Offers" products={restaurantProducts.slice(0,4)} linkToAll="/products" />
          </div>
        </div>
      </div>
    </main>
  );
}
