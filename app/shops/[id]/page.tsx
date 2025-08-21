"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Search,
  Heart,
  Share2,
  Star,
  Clock,
  MapPin,
  Filter,
  ShoppingBag,
  LayoutGrid,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { fetchShops, supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import type { Shop, Category, Product, WorkHours } from "@/lib/type";
import { ProductCard } from "../../../components/ProductCard";

export default function ShopDetailPage() {
  const params = useParams();
  const shopId = params?.id as string;
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [productsSort, setProductsSort] = useState("newest");
  const [productsSearch, setProductsSearch] = useState("");

  // جلب المنتجات حسب المتجر
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", shop?.id],
    enabled: !!shop?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(*)")
        .eq("shop", shop?.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  // جلب التصنيفات
  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  // جلب بيانات المتجر
  useEffect(() => {
    setLoading(true);
    fetchShops()
      .then((shops) => {
        const found = shops.find((s) => String(s.id) === shopId);
        setShop(found ?? null);
      })
      .finally(() => setLoading(false));
  }, [shopId]);

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // استخراج دوام اليوم الحالي من النوع WorkHours (دعم العربية والإنجليزية)
  let todayWork: WorkHours | null = null;
  let isOpen = false;
  let openDays: string[] = [];
  if (shop?.work_hours && shop.work_hours.length > 0) {
    let workHoursArr: WorkHours[] = [];
    if (typeof shop.work_hours[0] === "string") {
      workHoursArr = (shop.work_hours as string[])
        .map((s) => {
          try {
            return JSON.parse(s) as WorkHours;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as WorkHours[];
    } else {
      workHoursArr = (shop.work_hours as unknown as WorkHours[]);
    }

    const daysEn = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const daysAr = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    const todayIndex = new Date().getDay();
    const todayEn = daysEn[todayIndex];
    const todayAr = daysAr[todayIndex];

    todayWork =
      workHoursArr.find(
        (wh) =>
          String(wh.day).toLowerCase() === todayEn.toLowerCase() ||
          String(wh.day) === todayAr
      ) ?? null;

    openDays = workHoursArr.filter((wh) => wh.open).map((wh) => wh.day);

    // تحقق من حالة المتجر الآن
    if (todayWork && todayWork.open) {
      const now = currentTime;
      isOpen = now >= todayWork.startTime && now <= todayWork.endTime;
    }
  }

  // استخراج التصنيفات الفريدة من المنتجات
  const uniqueCategories: Category[] = products
    .map((p: any) => p.categories)
    .filter((cat) => cat && cat.id)
    .filter((cat, idx, arr) => arr.findIndex((c) => c.id === cat.id) === idx);

  // عدد المنتجات وعدد التصنيفات
  const productsCount = products.length;
  const categoriesCount = uniqueCategories.length;

  // فلترة وتصفية المنتجات
  const filteredSortedProducts = products
    .filter((product: Product) =>
      product.title?.toLowerCase().includes(productsSearch.toLowerCase())
    )
    .sort((a: Product, b: Product) => {
      if (productsSort === "newest") {
        return (
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
        );
      }
      if (productsSort === "highPrice") {
        return Number(b.price ?? 0) - Number(a.price ?? 0);
      }
      if (productsSort === "lowPrice") {
        return Number(a.price ?? 0) - Number(b.price ?? 0);
      }
      return 0;
    });

  useEffect(() => {
    async function incrementShopVisit(shopId: string) {
      await supabase.rpc("increment_shop_visit_count", { shop_id: shopId });
    }
    if (shop?.id) {
      incrementShopVisit(shop.id);
    }
  }, [shop?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg">
        جاري تحميل بيانات المتجر...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg text-red-500">
        لم يتم العثور على المتجر
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Cover Image */}
      <div className="relative h-80 overflow-hidden">
        <Image
          src={shop.cover_image_url || "/placeholder.svg"}
          alt={shop.shop_name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Link href="/shops">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
              <Input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border-2 border-white/20 rounded-full text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:shadow-lg transition-all duration-300 transform focus:scale-105"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Shop Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{shop.shop_name}</h1>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4" />
                <span className="text-lg">{shop.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isOpen ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                  title={
                    todayWork
                      ? isOpen
                        ? `Open until ${todayWork.endTime}`
                        : "Closed"
                      : "No working hours"
                  }
                />
                <span className="text-lg font-medium">
                  {todayWork
                    ? isOpen
                      ? `مفتوح حتى ${todayWork.endTime}`
                      : "مغلق"
                    : "لا يوجد دوام اليوم"}
                </span>
                
              </div>
            </div>

            {/* Shop Logo */}
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white ml-4">
              <Image
                src={shop.logo_url || "/placeholder.svg"}
                alt={`${shop.shop_name} logo`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shop Stats */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {/* Status */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-2">
                <Badge
                  className={`mt-2 ${
                    shop.status === "Approved"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  } text-white`}
                >
                  {shop.status}
                </Badge>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {shop.public ? "Public" : "Private"}
              </span>
            </div>

            {/* Opening Hours */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-4">
                <Clock className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {(() => {
                    // دعم العربية والإنجليزية
                    const daysEn = [
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ];
                    const daysAr = [
                      "الأحد",
                      "الإثنين",
                      "الثلاثاء",
                      "الأربعاء",
                      "الخميس",
                      "الجمعة",
                      "السبت",
                    ];
                    const todayIndex = new Date().getDay();
                    const todayEn = daysEn[todayIndex];
                    const todayAr = daysAr[todayIndex];

                    let workHoursArr: WorkHours[] = [];
                    if (Array.isArray(shop.work_hours)) {
                      if (
                        shop.work_hours.length > 0 &&
                        typeof shop.work_hours[0] === "string"
                      ) {
                        workHoursArr = (shop.work_hours as string[])
                          .map((s) => {
                            try {
                              return JSON.parse(s) as WorkHours;
                            } catch {
                              return null;
                            }
                          })
                          .filter(Boolean) as WorkHours[];
                      } else {
                        workHoursArr = shop.work_hours as unknown as WorkHours[];
                      }
                    } else if (typeof shop.work_hours === "string") {
                      try {
                        workHoursArr = JSON.parse(
                          shop.work_hours
                        ) as WorkHours[];
                      } catch {
                        workHoursArr = [];
                      }
                    }

                    const todayWork = workHoursArr.find(
                      (h) =>
                        h.day?.toLowerCase() === todayEn.toLowerCase() ||
                        h.day === todayAr
                    );

                    return todayWork
                      ? `${todayWork.day}: ${
                          todayWork.open
                            ? `${todayWork.startTime} - ${todayWork.endTime}`
                            : "مغلق"
                        }`
                      : `${todayEn}: لا يوجد دوام`;
                  })()}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Now {currentTime}
              </span>
            </div>

            {/* Owner + Delivery */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {shop.profiles?.full_name ?? shop.owner}
                </span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Shop Owner
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {shop.created_at?.slice(0, 10).split("-").reverse().join(".")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex items-center gap-0 mb-6">
            {/* Categories Tab with Icon */}
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 px-4 py-2"
            >
              <LayoutGrid className="h-5 w-5" />
              التصنيفات{" "}
              <span className="ml-1 text-xs text-blue-600">
                ({categoriesCount})
              </span>
            </TabsTrigger>

            {/* Vertical Divider */}
            <span className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-2" />

            {/* Products Tab with Icon */}
            <TabsTrigger
              value="products"
              className="flex items-center gap-2 px-4 py-2"
            >
              <ShoppingBag className="h-5 w-5" />
              المنتجات{" "}
              <span className="ml-1 text-xs text-blue-600">
                ({productsCount})
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-8">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              <button
                className={`px-4 py-2 rounded-full border ${
                  selectedCategory === null
                    ? "bg-indigo-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                الكل
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat.id}
                  className={`px-4 py-2 rounded-full border ${
                    selectedCategory === cat.id
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  }`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* المنتجات حسب التصنيف المختار */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(selectedCategory
                ? products.filter((p: any) => p.category === selectedCategory)
                : products
              ).length === 0 ? (
                <div className="col-span-full text-center text-gray-400">
                  لا توجد منتجات لهذا التصنيف
                </div>
              ) : (
                (selectedCategory
                  ? products.filter((p: any) => p.category === selectedCategory)
                  : products
                ).map((product: Product) => (
                  <ProductCard
                    key={
                      typeof product.id === "string"
                        ? Number(product.id)
                        : product.id
                    }
                    product={{
                      ...product,
                      id:
                        typeof product.id === "string"
                          ? Number(product.id)
                          : product.id,
                      shop:
                        typeof product.shop === "string"
                          ? Number(product.shop)
                          : product.shop,
                      price:
                        typeof product.price === "string"
                          ? Number(product.price)
                          : product.price,
                    }}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                جميع المنتجات
              </h3>
              {/* خانة البحث */}
              <Input
                type="text"
                placeholder="ابحث عن منتج..."
                value={productsSearch}
                onChange={(e) => setProductsSearch(e.target.value)}
                className="max-w-xs"
              />
              {/* التصفية */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  ترتيب:
                </span>
                <select
                  className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
                  onChange={(e) => setProductsSort(e.target.value)}
                  value={productsSort}
                >
                  <option value="newest">الأحدث</option>
                  <option value="highPrice">الأعلى سعراً</option>
                  <option value="lowPrice">الأقل سعراً</option>
                </select>
              </div>
            </div>

           

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsLoading ? (
                <div className="text-center text-gray-400 col-span-full">
                  جاري تحميل المنتجات...
                </div>
              ) : productsError ? (
                <div className="text-center text-red-500 col-span-full">
                  حدث خطأ أثناء جلب المنتجات: {productsError.message}
                </div>
              ) : filteredSortedProducts.length === 0 ? (
                <div className="text-center text-gray-400 col-span-full">
                  لا توجد منتجات لهذا المتجر
                </div>
              ) : (
                filteredSortedProducts.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      id:
                        typeof product.id === "string"
                          ? Number(product.id)
                          : product.id,
                      shop:
                        typeof product.shop === "string"
                          ? Number(product.shop)
                          : product.shop,
                      price:
                        typeof product.price === "string"
                          ? Number(product.price)
                          : product.price,
                    }}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
