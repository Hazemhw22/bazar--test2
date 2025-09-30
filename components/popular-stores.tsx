"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useSwipeable } from "react-swipeable";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Shop } from "@/lib/type";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

function StoreCard({ shop }: { shop: Shop }) {
  return (
    <Link
      href={`/shops/${shop.id}`}
      className="relative block overflow-hidden rounded-2xl aspect-[16/9] w-full group"
    >
      <Image
        src={shop.cover_image_url || "/placeholder.svg"}
        alt={shop.shop_name}
        fill
        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
        <h3 className="text-xl sm:text-2xl font-bold">{shop.shop_name}</h3>
        <p className="text-sm text-gray-300 mb-2">{shop.categoryTitle}</p>
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span>{shop.productsCount} Products</span>
          <span>30 min</span>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/30">
            <Star className="w-3 h-3 text-yellow-400" fill="currentColor" />
            <span>4.7</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PopularStores() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // جلب المتاجر مع اسم صاحب المتجر
      const { data: shops, error: shopsError } = await supabase
        .from("shops")
        .select("*, profiles(full_name)");
      // جلب التصنيفات
      const { data: cats } = await supabase.from("categories").select("*");
      if (!shopsError && shops && cats) {
        setCategories(cats); // <-- أضف هذا السطر
        // جلب المنتجات لحساب عدد المنتجات لكل متجر
        const { data: products } = await supabase
          .from("products")
          .select("shop");
        const shopsWithCount = shops.map((shop) => {
          const count = products
            ? products.filter((p) => p.shop === shop.id).length
            : 0;
          return {
            ...shop,
            categoryTitle:
              cats.find((cat) => cat.id === shop.category_id)?.title ||
              "بدون تصنيف",
            productsCount: count,
          };
        });
        setShops(shopsWithCount);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const maxIndex = Math.max(0, shops.length - itemsPerView.desktop);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + itemsPerView.desktop, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerView.desktop, 0));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

  return (
    <section className="py-8 px-2 md:px-4">
      <div className="mx-auto max-w-8xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Popular Shops
          </h2>
          <Link
            href="/shops"
            className="text-primary hover:underline text-sm font-medium"
          >
            See All
          </Link>
        </div>

        <div className="relative" {...swipeHandlers}>
          <div className="overflow-hidden">
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform duration-300"
            >
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-secondary rounded-2xl aspect-[16/9]"></div>
                  </div>
                ))
              ) : shops.length === 0 ? (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  No stores found
                </div>
              ) : (
                shops.slice(0, 6).map((shop) => <StoreCard key={shop.id} shop={shop} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}