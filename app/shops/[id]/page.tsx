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
  Plus,
  Minus,
  ShoppingCart,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
import { useCart } from "@/components/cart-provider";

export default function ShopDetailPage() {
  const params = useParams();
  const shopId = params?.id as string;
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("featured");
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

  const router = useRouter();
  const { addItem } = useCart();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-gray-900 text-white">
      {/* Shop Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.push('/shops')}
              className="flex items-center text-white"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/cart')}
                className="relative flex items-center justify-center w-10 h-10 rounded-full bg-purple-800 hover:bg-purple-700"
                aria-label="View cart"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">3</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Info Card */}
      <div className="px-4 py-6">
        <div className="bg-gradient-to-r from-purple-800 to-indigo-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-xl overflow-hidden relative mr-4 bg-purple-700">
              {shop?.logo_url ? (
                <Image src={shop.logo_url} alt={shop.shop_name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold">
                  {shop?.shop_name?.charAt(0) || "S"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{shop?.shop_name || "Loading..."}</h1>
              <div className="flex items-center mt-1 text-gray-300">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{shop?.address || "Address unavailable"}</span>
              </div>
            </div>
          </div>
          
          {/* Shop Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-purple-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">4.8</div>
              <div className="text-xs text-gray-300">Rating</div>
            </div>
            <div className="bg-purple-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">30</div>
              <div className="text-xs text-gray-300">Delivery Time</div>
            </div>
            <div className="bg-purple-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">${shop?.delivery_fee || "3.99"}</div>
              <div className="text-xs text-gray-300">Delivery Fee</div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3 mt-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </button>
            <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-2" />
              Directions
            </button>
          </div>
        </div>
      </div>


      {/* Category Tabs */}
      <div className="px-4 mt-6">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex space-x-4 border-b border-gray-700">
            <button 
              className="text-white px-4 py-2 border-b-2 border-blue-500 font-medium"
              onClick={() => setActiveTab("featured")}
            >
              Featured Items
            </button>
            <button 
              className="text-gray-400 px-4 py-2 hover:text-white"
              onClick={() => setActiveTab("phone")}
            >
              Phone
            </button>
            <button 
              className="text-gray-400 px-4 py-2 hover:text-white"
              onClick={() => setActiveTab("airpods")}
            >
              Airpods
            </button>
            <button 
              className="text-gray-400 px-4 py-2 hover:text-white"
              onClick={() => setActiveTab("watch")}
            >
              Watch
            </button>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mt-6 mb-4">Featured Items</h2>
        
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

      {/* Product Grid */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-gradient-to-b from-purple-800/50 to-indigo-900/50 rounded-xl overflow-hidden shadow-lg">
              <div className="relative h-40 bg-purple-700/30">
                <Image 
                  src={`/products/product-${(index % 6) + 1}.png`} 
                  alt={`Product ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-1">Premium Headphones</h3>
                <div className="flex items-center mt-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-300 ml-1">4.8</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold">$129.99</span>
                  <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
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