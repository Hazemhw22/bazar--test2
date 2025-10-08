"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ShoppingBag, Store, ChevronDown } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { CategoryShop, Product, Shop, CategorySubShop } from "@/lib/type";
import { ProductCard } from "@/components/ProductCard";

export default function CategoryShopDetail() {
  const params = useParams();
  const id = Number(params?.id);
  const [category, setCategory] = useState<CategoryShop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [subcategories, setSubcategories] = useState<CategorySubShop[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'shops'>('products');

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

  // fetch shops for the products in this category
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

  // fetch subcategories for this category_shop
  useEffect(() => {
    async function loadSubcats() {
      try {
        const { data } = await supabase
          .from("categories_sub_shop")
          .select("*")
          .eq("category_id", id)
          .order("created_at", { ascending: true });
        setSubcategories((data || []) as CategorySubShop[]);
      } catch (err) {
        console.error(err);
        setSubcategories([]);
      }
    }
    if (id) loadSubcats();
  }, [id]);

  // filtered products when a subcategory is selected
  const filteredProducts = useMemo(() => {
    if (!selectedSubId) return products;
    return products.filter((p) => p.subcategory_id === selectedSubId);
  }, [products, selectedSubId]);

  const productsByShop = useMemo(() => {
    const map: Record<string, Product[]> = {};
    for (const p of filteredProducts) {
      const key = String((p as any).shop || "");
      map[key] = map[key] || [];
      map[key].push(p);
    }
    return map;
  }, [filteredProducts]);

  if (loading) return <div className="py-12 text-center">Loading...</div>;
  if (!category) return <div className="py-12 text-center">التصنيف غير موجود</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative mb-6">
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 relative flex-shrink-0">
              <Image src={category.image_url || "/placeholder.svg"} alt={category.title} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{category.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">{category.description}</p>
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


      {/* Subcategories (rounded tiles) */}
      {subcategories.length > 0 && (
        <div className="mb-4">
          <div className="relative">
            <button
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const el = document.getElementById("category-sub-scroll");
                if (el) el.scrollBy({ left: -150, behavior: "smooth" });
              }}
              aria-label="Scroll left"
            >
              <ChevronDown className="rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>

            <div id="category-sub-scroll" className="flex overflow-x-auto gap-3 scrollbar-hide pb-2 scroll-smooth">
              <button
                onClick={() => setSelectedSubId(null)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl whitespace-nowrap transition-all ${selectedSubId === null ? "text-blue-600" : "text-gray-700 dark:text-gray-200"}`}
              >
                <div className={`w-12 h-12 relative rounded-full overflow-hidden border-2 transition-colors ${selectedSubId === null ? "border-blue-600" : "border-transparent"} bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold`}>All</div>
                <span className="text-sm font-medium mt-1">All</span>
              </button>

              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl whitespace-nowrap transition-all ${selectedSubId === sub.id ? "text-blue-600" : "text-gray-700 dark:text-gray-200"}`}
                >
                  <div className={`w-12 h-12 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${selectedSubId === sub.id ? "border-blue-600" : "border-transparent"}`}>
                    {sub.image_url ? (
                      <Image src={sub.image_url} alt={sub.title} fill className="object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gray-400">{sub.title?.[0]}</div>
                    )}
                  </div>
                  <span className="text-sm font-medium mt-1">{sub.title}</span>
                </button>
              ))}
            </div>

            <button
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const el = document.getElementById("category-sub-scroll");
                if (el) el.scrollBy({ left: 150, behavior: "smooth" });
              }}
              aria-label="Scroll right"
            >
              <ChevronDown className="-rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>

            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar { display: none; }
              .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
          </div>
        </div>
      )}
  {/* Tabs (centered, non-sticky) */}
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
            {filteredProducts.map((p) => (
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
                      <Image src={(s.logo_url as string) || "/placeholder.svg"} alt={s.shop_name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{s.shop_name}</div>
                      <div className="text-sm text-muted-foreground truncate">{s.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{count} Products</div>
                      <button
                        onClick={() => setActiveShop((prev) => (prev?.id === s.id ? null : s))}
                        className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary text-white rounded-lg text-sm"
                      >{activeShop?.id === s.id ? 'إخفاء' : 'عرض'}</button>
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

      {/* removed global bottom sheet; panels now open inline under each shop card */}
    </div>
  );
}
