"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Search,
  Heart,
  Share2,
  Clock,
  MapPin,
  ShoppingBag,
  LayoutGrid,
  Star,
  Package,
  Truck,
  Phone,
  Mail,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  fetchShops,
  supabase,
  incrementShopVisitCountClient,
} from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import type { Shop, Category, Product, WorkHours } from "@/lib/type";
import { ProductCard } from "../../../components/ProductCard";
import { HomeCategories } from "@/components/home-categories";
import AdBanner from "@/components/AdBanner";

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

  // Function to render shop content based on type
  const renderShopContent = () => {
    if (!shop) return null;
    
    // For now, show default content since type field is not in database yet
    return <DefaultShopContent shop={shop} />;
  };

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

  // تحديث عداد الزيارات عند زيارة المتجر
  useEffect(() => {
    if (shopId) {
      incrementShopVisitCountClient(shopId).catch((error: any) => {
        console.error("Failed to increment visit count:", error);
      });
    }
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
      workHoursArr = shop.work_hours as unknown as WorkHours[];
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg">
        جاري تحميل بيانات المتجر...
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg text-red-500 ">
        لم يتم العثور على المتجر
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 w-full">
{/* Hero/Banner Section - 6am Mart Style */}
<div className="bg-white dark:bg-black">
  <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 items-start relative">

      {/* Store Info Panel (Dark Grey) */}
      <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative">
        {/* Circle Image - Overlapping Top */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full overflow-hidden border-4 border-gray-800">
          <Image
            src={shop.logo_url || "/placeholder.svg"}
            alt={shop.shop_name}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Store Header */}
        <div className="flex justify-between items-start mt-12 mb-4">
          {/* Left Side - Store Info */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{shop.shop_name}</h2>
            <p className="text-gray-300 text-sm mb-2">{shop.address}</p>
            <p className="text-green-400 text-sm font-medium">Minimum ₪0.00</p>
          </div>

          {/* Right Side - Buttons */}
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
            </button>
            <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
              <Share2 className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Store Metrics */}
        <div className="flex justify-between mt-4 mb-4 text-left">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">0.0</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">{shop.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm">20-30 min</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-left">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-green-400" />
            <span className="text-gray-300 text-sm">Contact for details</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-green-400" />
            <span className="text-gray-300 text-sm">info@store.com</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>


      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* شريط تصنيفات المتجر */}
        <div className="mb-8 relative">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Categories</h2>
          <div className="relative">
            {/* سهم يسار (ديسكتوب فقط) */}
            <button
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const el = document.getElementById("shop-category-scroll");
                if (el) el.scrollBy({ left: -150, behavior: "smooth" });
              }}
              aria-label="Scroll Left"
            >
              <ChevronDown className="rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>

            {/* تصنيفات المتجر */}
            <div
              id="shop-category-scroll"
              className="flex overflow-x-auto gap-3 scrollbar-hide pb-2 scroll-smooth"
            >
              <button
                key="all"
                onClick={() => setSelectedCategory(null)}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${
                  selectedCategory === null ? "text-blue-600" : "text-gray-700 dark:text-gray-200"
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                    selectedCategory === null ? "border-blue-600" : "border-transparent"
                  } bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold`}
                >
                  <span className={selectedCategory === null ? "text-blue-600" : "text-gray-700 dark:text-gray-200"}>
                    A
                  </span>
                </div>
                <span className="text-sm font-medium mt-1">All</span>
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${
                    selectedCategory === cat.id ? "text-blue-600" : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                    selectedCategory === cat.id ? "bg-blue-600 border-blue-600" : " border-transparent"
                  }`}>
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={cat.title}
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {cat.title[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium mt-1">{cat.title}</span>
                </button>
              ))}
            </div>

            {/* سهم يمين (ديسكتوب فقط) */}
            <button
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const el = document.getElementById("shop-category-scroll");
                if (el) el.scrollBy({ left: 150, behavior: "smooth" });
              }}
              aria-label="Scroll Right"
            >
              <ChevronDown className="-rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
          {/* Custom scrollbar hide */}
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>

        {/* فلترة المنتجات حسب التصنيف المختار */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsLoading ? (
            <div className="text-center text-gray-400 col-span-full py-8">
              Loading products...
            </div>
          ) : productsError ? (
            <div className="text-center text-red-500 col-span-full py-8">
              Error loading products: {productsError.message}
            </div>
          ) : filteredSortedProducts
              .filter((product: Product) =>
                selectedCategory === null
                  ? true
                  : product.categories?.id === selectedCategory
              )
              .length === 0 ? (
            <div className="text-center text-gray-400 col-span-full py-8">
              No products found for this category
            </div>
          ) : (
            filteredSortedProducts
              .filter((product: Product) =>
                selectedCategory === null
                  ? true
                  : product.categories?.id === selectedCategory
              )
              .map((product: Product, index: number) => (
                <React.Fragment key={product.id}>
                  {index > 0 && index % 8 === 0 && (
                    <AdBanner
                      key={`ad-${index}`}
                      imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
                      title="Fresh Deals"
                      subtitle="Save more on your favorites"
                    />
                  )}
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      id: typeof product.id === "string" ? product.id : product.id,
                      shop: typeof product.shop === "string" ? product.shop : product.shop,
                      price: typeof product.price === "string" ? product.price : product.price,
                    }}
                  />
                </React.Fragment>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

// Shop Type Components
interface ShopContentProps {
  shop: Shop;
}

// Default Shop Content
function DefaultShopContent({ shop }: ShopContentProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xl">🏪</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">متجر عام</h3>
          <p className="text-gray-600 dark:text-gray-300">منتجات متنوعة</p>
        </div>
      </div>
    </div>
  );
}