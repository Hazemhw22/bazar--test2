"use client";

import { useEffect, useState, useRef } from "react";
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
  .filter((product: Product) => {
    const matchesSearch = product.title
      ?.toLowerCase()
      .includes(productsSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === null || product.categories?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  })

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
      {/* Hero/Banner Section */}
  <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
           {/* Left Side - Hero Content */}
      <div className="text-center lg:text-left">
        <div className="mb-6">
          {/* Logo */}
          <div className="w-24 h-24 mx-auto lg:mx-0 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            {shop.logo_url ? (
              <Image
                src={shop.logo_url}
                alt={shop.shop_name}
                width={96}
                height={96}
                className="object-cover w-24 h-24 rounded-full"
              />
            ) : (
              <span className="text-4xl">🛍️</span>
            )}
          </div>

          {/* Cover Image */}
          {shop.cover_image_url ? (
            <div className="w-full h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden shadow-md mb-4">
              <Image
                src={shop.cover_image_url}
                alt={`${shop.shop_name} Cover`}
                width={1200}
                height={400}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          ) : (
            <div className="w-full h-56 sm:h-72 lg:h-80 rounded-2xl overflow-hidden shadow-md mb-4 bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">No cover available</span>
            </div>
          )}

        </div>
      </div>

      {/* Right Side - Store Info Panel */}
      <div className="bg-gray-800 dark:bg-gray-900 rounded-2xl p-6 text-white shadow-xl">
        {/* Store Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">{shop.shop_name}</h2>
            <p className="text-gray-300 text-medium mb-2">
              {shop.profiles?.full_name ?? shop.owner}
            </p>
            <p className="text-green-400 text-sm font-medium">Minimum ₪0.00</p>
          </div>
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
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">0.0</span>
            <span className="text-gray-300 text-sm">0 + ratings</span>
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
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-2">
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
      {/* Main Content Area - 6am Mart Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Categories</h3>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for items..."
                    className="pl-10 pr-4 py-2"
                  />
                </div>
                <Button className="w-full mt-2 bg-green-600 hover:bg-green-700">
                  Search
                </Button>
              </div>

              {/* Category List */}
              <div className="space-y-2">
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? "bg-green-600 text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedCategory(null)}
                >
                  ALL
                </button>
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? "bg-green-600 text-white"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Right Section - Products Grid */}
          <div className="lg:col-span-3">
            {/* Products Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Products ({productsCount})
              </h2>
              <div className="flex items-center gap-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                
                  type="text"
                  placeholder="Search products..."
                  value={productsSearch}
                  onChange={(e) => setProductsSearch(e.target.value)}
                  className="w-64"
                />
                <select
                  className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:text-white"
                  onChange={(e) => setProductsSort(e.target.value)}
                  value={productsSort}
                >
                  <option value="newest">Newest</option>
                  <option value="highPrice">Highest Price</option>
                  <option value="lowPrice">Lowest Price</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productsLoading ? (
                <div className="text-center text-gray-400 col-span-full py-8">
                  Loading products...
                </div>
              ) : productsError ? (
                <div className="text-center text-red-500 col-span-full py-8">
                  Error loading products: {productsError.message}
                </div>
              ) : filteredSortedProducts.length === 0 ? (
                <div className="text-center text-gray-400 col-span-full py-8">
                  No products found for this store
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
          </div>
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