"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSwipeable } from "react-swipeable";
import { supabase } from "../lib/supabase";
import type { Shop } from "../lib/type";
import { useI18n } from "../lib/i18n";

export default function PopularRestaurants() {
  const { t } = useI18n();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchShops = async () => {
      setLoading(true);
      try {
        const CATEGORY_ID = 15;
        const { data: shopsData, error: shopsError } = await supabase
          .from("shops")
          .select("id,shop_name,cover_image_url,category_shop_id")
          .eq("category_shop_id", CATEGORY_ID);

        if (!mounted) return;
        if (shopsError || !shopsData) {
          setShops([]);
          return;
        }

        const { data: productsData } = await supabase.from("products").select("shop");
        const counts: Record<string | number, number> = {};
        (productsData || []).forEach((p: any) => {
          const key = p.shop;
          counts[key] = (counts[key] || 0) + 1;
        });

        const shopsWithCount = (shopsData || []).map((s: any) => ({
          id: s.id,
          shop_name: s.shop_name,
          cover_image_url: s.cover_image_url,
          productsCount: counts[s.id] || 0,
        }));

        const withProducts = shopsWithCount.filter((s: any) => (s.productsCount || 0) > 0);
        const sorted = withProducts.sort((a: any, b: any) => (b.productsCount || 0) - (a.productsCount || 0));
        const top3 = sorted.slice(0, 3);

        while (top3.length < 3) {
          top3.push({ id: `placeholder-${top3.length}`, shop_name: "", cover_image_url: "/placeholder.svg", productsCount: 0 } as any);
        }

        if (mounted) setShops(top3 as unknown as Shop[]);
      } catch (err) {
        console.error("Error fetching popular restaurants:", err);
        if (mounted) setShops([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchShops();
    return () => {
      mounted = false;
    };
  }, []);

  const heroItems = useMemo(() => shops.slice(0, 3), [shops]);
  const len = heroItems.length;

  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentIndex((c) => (len ? (c + 1) % len : 0)),
    onSwipedRight: () => setCurrentIndex((c) => (len ? (c - 1 + len) % len : 0)),
    trackMouse: true,
  });

  useEffect(() => {
    if (len <= 1) return;
    if (isPaused) return;
    const id = setInterval(() => {
      setCurrentIndex((c) => (c + 1) % len);
    }, 8000);
    return () => clearInterval(id);
  }, [len, isPaused]);

  useEffect(() => {
    if (len === 0) setCurrentIndex(0);
    else setCurrentIndex((c) => ((c % len) + len) % len);
  }, [len]);

  return (
    <section className="py-6 px-1 md:px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{t("popular.restaurants.title")}</h3>
          <Link href="/shops" className="text-sm text-primary">{t("popular.seeAll")}</Link>
        </div>

        <div
          {...handlers}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="relative"
        >
          {loading || len === 0 ? (
            <div className="w-56 h-56 bg-gray-200 rounded-2xl mx-auto" />
          ) : (
            (() => {
              const left = heroItems[(currentIndex - 1 + len) % len];
              const center = heroItems[currentIndex % len];
              const right = heroItems[(currentIndex + 1) % len];
              return (
                <div className="relative w-full flex items-center justify-center" style={{ minHeight: 240 }}>
                  {/* left - behind */}
                  <div
                    className="absolute left-1 sm:left-1/4 top-1/2 -translate-y-1/2 w-40 sm:w-48 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-md transform scale-95 opacity-90 cursor-pointer"
                    onClick={() => setCurrentIndex((currentIndex - 1 + len) % len)}
                    style={{ zIndex: 10 }}
                  >
                    <Link href={`/shops/${left.id}`} className="block w-full h-full">
                      <Image src={(left as any).cover_image_url || "/placeholder.svg"} alt={(left as any).shop_name || ""} width={320} height={320} className="object-cover w-full h-full" />
                    </Link>
                  </div>

                  {/* right - behind */}
                  <div
                    className="absolute right-1 sm:right-1/4 top-1/2 -translate-y-1/2 w-40 sm:w-48 h-40 sm:h-48 rounded-2xl overflow-hidden shadow-md transform scale-95 opacity-90 cursor-pointer"
                    onClick={() => setCurrentIndex((currentIndex + 1) % len)}
                    style={{ zIndex: 10 }}
                  >
                    <Link href={`/shops/${right.id}`} className="block w-full h-full">
                      <Image src={(right as any).cover_image_url || "/placeholder.svg"} alt={(right as any).shop_name || ""} width={320} height={320} className="object-cover w-full h-full" />
                    </Link>
                  </div>

                  {/* center - front */}
                  <div className="relative w-52 h-52 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl transform scale-100 z-20">
                    <Link href={`/shops/${center.id}`} className="block w-full h-full">
                      <Image src={(center as any).cover_image_url || "/placeholder.svg"} alt={(center as any).shop_name || ""} width={420} height={420} className="object-cover w-full h-full rounded-3xl" />
                    </Link>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </section>
  );
}
