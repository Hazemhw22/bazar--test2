"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Clock, MapPin } from "lucide-react";
import Link from "next/link";

// أنواع التصنيفات
interface CategoryShop {
  id: number;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}
interface CategorySubShop {
  id: number;
  title: string;
  description: string;
  category_id: number;
  image_url: string;
  created_at: string;
}

// نوع المتجر (يمكنك تعديله حسب مشروعك)
type Shop = {
  id: number;
  shop_name: string;
  shop_desc?: string;
  desc?: string;
  address?: string;
  logo_url?: string;
  cover_image_url?: string;
  category_shop_id?: number | null;
  category_sub_shop_id?: number | null;
  categoryTitle?: string;
  productsCount?: number;
  work_hours?: any;
  profiles?: { full_name?: string };
  owner?: string;
};

type SortOption = "rating" | "products" | "alphabetical" | "newest";

export default function ShopsPage() {
  const [shopsData, setShopsData] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  // كاتيجوري المتاجر وسوب كاتيجوري
  const [shopCategories, setShopCategories] = useState<CategoryShop[]>([]);
  const [shopSubCategories, setShopSubCategories] = useState<CategorySubShop[]>([]);
  const [selectedShopCategory, setSelectedShopCategory] = useState<number | null>(null);
  const [selectedShopSubCategory, setSelectedShopSubCategory] = useState<number | null>(null);

  // جلب كاتيجوري المتاجر
  useEffect(() => {
    async function fetchShopCategories() {
      const { data } = await supabase.from("categories_shop").select("*").order("id", { ascending: true });
      setShopCategories(data || []);
    }
    fetchShopCategories();
  }, []);

  // جلب سوب كاتيجوري عند اختيار كاتيجوري
  useEffect(() => {
    if (selectedShopCategory) {
      supabase
        .from("categories_sub_shop")
        .select("*")
        .eq("category_id", selectedShopCategory)
        .then(({ data }) => setShopSubCategories(data || []));
    } else {
      setShopSubCategories([]);
    }
    setSelectedShopSubCategory(null);
  }, [selectedShopCategory]);

  // جلب المتاجر مع التصنيفات وعدد المنتجات
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: shops, error: shopsError } = await supabase
        .from("shops")
        .select("*, profiles(full_name)");
      const { data: cats } = await supabase.from("categories_shop").select("*");
      const { data: products } = await supabase.from("products").select("shop");
      if (!shopsError && shops && cats) {
        const shopsWithCount = shops.map((shop) => {
          const count = products
            ? products.filter((p) => p.shop === shop.id).length
            : 0;
          return {
            ...shop,
            categoryTitle:
              cats.find((cat) => cat.id === shop.category_shop_id)?.title ||
              "بدون تصنيف",
            productsCount: count,
          };
        });
        setShopsData(shopsWithCount);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // فلترة المتاجر حسب الكاتيجوري والسوب كاتيجوري والبحث والترتيب
  const filteredAndSortedShops = useMemo(() => {
    let filtered = shopsData;

    // فلترة حسب كاتيجوري المتاجر
    if (selectedShopCategory) {
      filtered = filtered.filter(
        (shop) => shop.category_shop_id === selectedShopCategory
      );
    }
    // فلترة حسب سوب كاتيجوري المتاجر
    if (selectedShopSubCategory) {
      filtered = filtered.filter(
        (shop) => shop.category_sub_shop_id === selectedShopSubCategory
      );
    }

    // فلترة البحث
    filtered = filtered.filter(
      (shop) =>
        shop.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.shop_desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort based on selected option
    switch (sortBy) {
      case "rating":
        filtered.sort((a: any, b: any) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "products":
        filtered.sort(
          (a: any, b: any) => (b.productsCount ?? 0) - (a.productsCount ?? 0)
        );
        break;
      case "alphabetical":
        filtered.sort((a, b) =>
          (a.shop_name ?? "").localeCompare(b.shop_name ?? "")
        );
        break;
      case "newest":
        filtered.sort((a, b) => Number(b.id) - Number(a.id));
        break;
    }

    return filtered;
  }, [shopsData, searchQuery, sortBy, selectedShopCategory, selectedShopSubCategory]);

  // سحب أفقي بالماوس
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const handleDown = (e: MouseEvent) => {
      isDown = true;
      el.classList.add("cursor-grabbing");
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const handleLeave = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
    };
    const handleUp = () => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
    };
    const handleMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };
    el.addEventListener("mousedown", handleDown);
    el.addEventListener("mouseleave", handleLeave);
    el.addEventListener("mouseup", handleUp);
    el.addEventListener("mousemove", handleMove);
    return () => {
      el.removeEventListener("mousedown", handleDown);
      el.removeEventListener("mouseleave", handleLeave);
      el.removeEventListener("mouseup", handleUp);
      el.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-purple-900 to-gray-900 min-h-screen text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg p-4">
        <h1 className="text-2xl font-bold text-center">Shops</h1>
      </div>
      
      {/* Search and Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search shops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-purple-800/50 border border-purple-700 rounded-lg py-2 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-purple-800/50 border border-purple-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Top Rated</option>
            <option value="products">Most Products</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        
        {/* Categories */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-3">Categories</h2>
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth cursor-grab"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {shopCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedShopCategory(cat.id)}
                className={`
                  flex flex-col items-center min-w-[120px] max-w-[140px] bg-purple-800/30 rounded-2xl shadow
                  border-2 transition-all duration-150 px-2 pt-2 pb-1
                  ${selectedShopCategory === cat.id
                    ? "border-blue-500 shadow-lg"
                    : "border-transparent hover:border-purple-600"}
                `}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden mb-1 bg-purple-700/50 flex items-center justify-center">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.title}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-purple-600/50 rounded-xl" />
                  )}
                </div>
                <span className={`text-xs font-semibold truncate text-center ${selectedShopCategory === cat.id ? "text-blue-400" : "text-white"}`}>
                  {cat.title}
                </span>
              </button>
            ))}
          </div>
          {/* subcategory pills */}
          {selectedShopCategory && shopSubCategories.length > 0 && (
            <div className="flex gap-2 mt-4">
              {shopSubCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedShopSubCategory(sub.id)}
                  className={`
                    px-4 py-2 rounded-xl bg-purple-800/50 border border-purple-700
                    hover:bg-blue-600 hover:text-white transition-colors shadow-sm
                    text-xs font-medium
                    ${selectedShopSubCategory === sub.id ? "bg-blue-600 text-white" : "text-white"}
                  `}
                >
                  {sub.title}
                </button>
              ))}
            </div>
          )}
        </div>

      {/* Shop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8">
        {loading ? (
          <div className="col-span-full text-center py-12 text-lg text-gray-300">Loading shops...</div>
        ) : filteredAndSortedShops.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">No shops found in this category.</div>
        ) : (
          filteredAndSortedShops.map((shop) => (
            <Link
              href={`/shops/${shop.id}`}
              key={shop.id}
              className="bg-gradient-to-b from-purple-800/80 to-indigo-900/80 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-purple-700/50"
            >
              <div className="relative h-40 bg-purple-900/50">
                {shop.cover_image_url ? (
                  <Image
                    src={shop.cover_image_url}
                    alt={shop.shop_name}
                    fill
                    className="object-cover opacity-90"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-800 to-indigo-700 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">{shop.shop_name.substring(0, 1)}</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-purple-700/90 text-white text-xs">
                    {shop.categoryTitle || "Shop"}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white">{shop.shop_name}</h3>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" />
                    <span className="text-sm font-medium text-gray-200">
                      {5}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                  {shop.desc || shop.shop_desc || "Visit our shop for amazing products!"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-300">
                    {shop.productsCount || 0} products
                  </span>
                  <span className="text-xs text-gray-300">
                    <MapPin className="inline h-3 w-3 mr-1" />{shop.address || ""}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  </div>
);
}

// مثال مبسط لـ StoreCard (يمكنك تعديله حسب تصميمك)
function StoreCard({ shop }: { shop: Shop }) {
  return (
    <Link
      href={`/shops/${shop.id}`}
      className="block overflow-hidden hover:shadow-lg transition-all duration-300 rounded-2xl bg-card cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <div className="relative overflow-hidden flex items-center justify-center aspect-[16/9] sm:aspect-[5/2]">
        <Image
          src={shop.cover_image_url || "/placeholder.svg"}
          alt={shop.shop_name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
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
            className="object-cover w-24 h-24 sm:w-28 sm:h-28"
          />
        </div>
      </div>
      <div className="p-4 sm:p-6 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {shop.shop_name}
          </h3>
          <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap ms-auto">
            {shop.profiles?.full_name ?? shop.owner}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
          {shop.desc || shop.shop_desc || ""}
        </p>
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
        {shop.categoryTitle && (
          <div className="flex items-center gap-2 mb-1">
            <Badge>{shop.categoryTitle}</Badge>
          </div>
        )}
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
    </Link>
  );
}