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
    <Card className="overflow-hidden bg-white dark:bg-gray-900 border-0 shadow-md hover:shadow-lg transition-all duration-200">
      <CardContent className="p-0">
        {/* Cover Image */}
        {shop.cover_image_url && (
          <div className="relative h-36 w-full">
            <Image
              src={shop.cover_image_url}
              alt={`${shop.shop_name} cover`}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Upper Section - Logo */}
        <div className="relative h-28 flex items-center justify-center -mt-14 mx-4 rounded-lg shadow-lg">
          <Image
            src={shop.logo_url || "/placeholder.svg"}
            alt={shop.shop_name}
            width={100}
            height={100}
            className="object-contain w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-md"
          />
        
        </div>

        {/* Store Info */}
        <div className="p-4 bg-white dark:bg-gray-900 rounded-b-lg">
          <div className="flex items-start gap-3 mb-3">
            <Badge
              variant="outline"
              className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-medium"
            >
              Featured
            </Badge>
            <div className="flex-1">
              <h3 className="font-medium text-lg text-gray-900 dark:text-white">
                {shop.shop_name}
              </h3>
              {/* العنوان */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {shop.address || "-"}
              </p>
            </div>
          </div>

          {/* Today's Work Hours */}
          {shop.work_hours && shop.work_hours.length > 0 && (
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              <strong>Today's Hours:</strong> {shop.work_hours[0]}
            </div>
          )}

          {/* Products Count and Visit Button */}
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {productsLoading ? "..." : `${products.length} Products`}
            </span>
            <Link
              href={`/shops/${shop.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-lg text-xs font-medium transition-colors"
            >
              Visit Shop
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PopularStores() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  };

  useEffect(() => {
    async function fetchShops() {
      setLoading(true);
      const { data } = await supabase
        .from("shops")
        .select("*")
        .eq("status", "Approved")
        .limit(6);

      if (data) {
        const todayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ... 6=Sat
        const daysMap = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

        const formattedShops = data.map((shop) => {
          const todayWorkHour = shop.work_hours?.find(
            (wh: any) => wh.day === daysMap[todayIndex]
          );
          return {
            ...shop,
            work_hours: todayWorkHour
              ? [
                  todayWorkHour.open
                    ? `${todayWorkHour.day}: ${todayWorkHour.startTime}-${todayWorkHour.endTime}`
                    : `${todayWorkHour.day}: Closed`,
                ]
              : ["Closed"],
          };
        });
        setShops(formattedShops);
      }

      setLoading(false);
    }

    fetchShops();
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