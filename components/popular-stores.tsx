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
import { Star, Package, Clock, MapPin } from "lucide-react";

function StoreCard({ shop }: { shop: Shop }) {
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", shop.id],
    enabled: !!shop.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("shop", shop.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 rounded-2xl bg-card cursor-pointer">
      <CardContent className="p-0">
        {/* Shop Cover Image */}
        <div className="relative overflow-hidden flex items-center justify-center aspect-[16/9] sm:aspect-[5/2]">
          <Image
            src={shop.cover_image_url || "/placeholder.svg"}
            alt={shop.shop_name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Shop Logo بارزة وكاملة بين صورة الغلاف والمحتوى */}
        <div className="relative w-full flex justify-center">
          <div
            className="absolute left-1/2 -top-12 transform -translate-x-1/2 z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center"
            style={{ pointerEvents: "none" }}
          >
            <Image
              src={shop.logo_url || "/placeholder.svg"}
              alt={`${shop.shop_name} logo`}
              width={112}
              height={112}
              sizes="112px"
              className="object-cover w-24 h-24 sm:w-28 sm:h-28"
            />
          </div>
        </div>

        {/* Shop Info */}
        <div className="p-4 sm:p-6 pt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {shop.shop_name}
            </h3>
            <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap ms-auto">
              {shop.profiles?.full_name ?? shop.owner}
            </span>
          </div>

          {/* الوصف */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
            {shop.desc || shop.shop_desc || ""}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-2 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  5
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Rating
              </span>
            </div>
            {/* عدد المنتجات */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {shop.productsCount ?? "-"}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Products
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-gray-900 dark:text-white text-xs">
                  20 - 30
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Delivery
              </span>
            </div>
          </div>
          {/* الكاتيجوري */}
          {shop.categoryTitle && (
            <div className="flex items-center gap-2 mb-1">
              <Badge>{shop.categoryTitle}</Badge>
            </div>
          )}
          {/* الموقع */}
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{shop.address}</span>
          </div>

          {/* ساعات العمل */}
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-2">
            <Clock className="h-3 w-3" />
            {(() => {
              let workHoursArr: any[] = [];
              if (Array.isArray(shop.work_hours)) {
                if (
                  shop.work_hours.length > 0 &&
                  typeof shop.work_hours[0] === "string"
                ) {
                  // Parse each string to object
                  workHoursArr = (shop.work_hours as string[])
                    .map((s) => {
                      try {
                        return JSON.parse(s);
                      } catch {
                        return null;
                      }
                    })
                    .filter(Boolean);
                } else {
                  workHoursArr = shop.work_hours as any[];
                }
              } else if (typeof shop.work_hours === "string") {
                try {
                  workHoursArr = JSON.parse(shop.work_hours);
                } catch {
                  workHoursArr = [];
                }
              }
              // اليوم الحالي
              const days = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ];
              const today = days[new Date().getDay()];
              const todayWork = workHoursArr.find((h) => h.day === today);
              return todayWork
                ? todayWork.open
                  ? `${todayWork.day} ${todayWork.startTime} - ${todayWork.endTime}`
                  : `${todayWork.day}: مغلق`
                : "لا يوجد دوام اليوم";
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
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
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              Popular Shops
            </h2>
          </div>
          <Link
            href="/shops"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
          >
            See All
          </Link>
        </div>

        <div className="relative" {...swipeHandlers}>
          <div className="overflow-hidden">
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-transform duration-300"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerView.desktop)
                }%)`,
              }}
            >
              {loading ? (
                <div className="col-span-full text-center text-gray-400 py-12">
                  Loading...
                </div>
              ) : shops.length === 0 ? (
                <div className="col-span-full text-center text-gray-400 py-12">
                  No stores found
                </div>
              ) : (
                shops.map((shop) => <StoreCard key={shop.id} shop={shop} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}