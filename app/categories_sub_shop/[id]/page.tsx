"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ShoppingBag, Store, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { CategorySubShop, Product, Shop } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

export default function CategorySubShopDetail() {
  const params = useParams();
  const id = Number(params?.id);
  const [subcat, setSubcat] = useState<CategorySubShop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'shops'>('products');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
  const { data: sc } = await supabase.from("shops_sub_categories").select("*").eq("id", id).single();
        if (!mounted) return;
        setSubcat(sc as CategorySubShop);

        const { data: prods } = await supabase
          .from("products")
          .select("id, created_at, shop_id, name, description, price, images, category_id, sale_price, onsale, sub_category_id")
          .eq("sub_category_id", id)
          .eq("onsale", true)
          .order("id", { ascending: false });
        if (!mounted) return;
        setProducts((prods || []) as unknown as Product[]);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  // fetch shops for the products in this subcategory
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

    const productsByShop = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const p of products) {
      const key = String((p as any).shop_id || "");
      map[key] = map[key] || [];
      map[key].push(p);
    }
    return map;
  }, [products]);

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (!subcat) return <div className="py-12 text-center">Subcategory not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative mb-6">
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 relative flex-shrink-0">
              <Image src={subcat.image_url || "/placeholder.svg"} alt={subcat?.name ?? ""} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{subcat.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">{subcat.description}</p>
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

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-card rounded-3xl p-1 shadow-sm">
            <button
              role="tab"
              aria-selected={activeTab === 'products'}
              onClick={() => setActiveTab('products')}
              aria-pressed={activeTab === 'products'}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm transition-all duration-150 ${activeTab === 'products' ? 'bg-white dark:bg-gray-800 shadow-md font-semibold' : 'text-muted-foreground'}`}
            ><ShoppingBag size={16} /> <span>Products</span></button>

            <button
              role="tab"
              aria-selected={activeTab === 'shops'}
              onClick={() => setActiveTab('shops')}
              aria-pressed={activeTab === 'shops'}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm transition-all duration-150 ${activeTab === 'shops' ? 'bg-white dark:bg-gray-800 shadow-md font-semibold' : 'text-muted-foreground'}`}
            ><Store size={16} /> <span>Shops</span></button>
          </div>
        </div>
      </div>

      {/* Products tab content */}
      {activeTab === 'products' && (
        <section className="space-y-6 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.id} className="">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Shops tab content */}
      {activeTab === 'shops' && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {shops.map((s) => {
              const count = (productsByShop[String(s.id)] || []).length;
              return (
                <div key={s.id} className="flex flex-col bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      <Image src={(s.logo_url as string) || "/placeholder.svg"} alt={s.shop_name ?? ""} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{s.shop_name}</div>
                      <div className="text-sm text-muted-foreground truncate">{s.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{count} Products</div>
                      <button
                        onClick={() => setActiveShop((prev: Shop | null) => (prev?.id === s.id ? null : s))}
                        className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg text-sm"
                      >{activeShop?.id === s.id ? 'Hide' : 'Show'}</button>
                    </div>
                  </div>

                  {/* Inline panel under the same shop card */}
                  {activeShop?.id === s.id && (
                    <div className="mt-3 bg-white dark:bg-gray-900 rounded-lg p-3 shadow-inner border">
                      <div className="relative">
                        <button
                          aria-label="scroll left"
                          className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            const el = document.getElementById(`shop-products-scroll-${s.id}`);
                            if (el) el.scrollBy({ left: -240, behavior: "smooth" });
                          }}
                        >‹</button>

                        <div id={`shop-products-scroll-${s.id}`} className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1 scroll-smooth">
                          {(productsByShop[String(s.id)] || []).map((p) => (
                            <div key={p.id} className="snap-center flex-shrink-0 w-40 sm:w-44 md:w-48">
                              <ProductCard product={p} />
                            </div>
                          ))}
                        </div>

                        <button
                          aria-label="scroll right"
                          className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            const el = document.getElementById(`shop-products-scroll-${s.id}`);
                            if (el) el.scrollBy({ left: 240, behavior: "smooth" });
                          }}
                        >›</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
