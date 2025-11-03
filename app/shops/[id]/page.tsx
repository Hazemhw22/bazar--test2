"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  ChevronLeft,
  Heart,
  MoreHorizontal,
  ChevronRight,
  Star,
  Users,
  ChevronDown,
  MapPin,
  Clock,
  Share2,
  Info,
  Phone,
  Search,
  Filter,
  ShoppingBag,
  Truck,
  CreditCard,
  Check,
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
import { 
  getProductsByShop, 
  getAllShops, 
  getShopSubcategories 
} from "@/lib/actions/products";
import { useQuery } from "@tanstack/react-query";
import type { Shop, Category, Product, WorkHours, CategoryShop, CategorySubShop } from "@/lib/types";
import { ProductCard } from "../../../components/ProductCard";
import AdBanner from "@/components/AdBanner";
import BrandsStrip from "@/components/BrandsStrip";
import ShopCategoryDisplay from "@/components/ShopCategoryDisplay";
import { useI18n } from "@/lib/i18n";

export default function ShopDetailPage() {
  const { t, locale } = useI18n();
  const allLabel = t("common.all");
  const allInitial = (allLabel && allLabel[0]) || "A";
  const params = useParams();
  const shopId = params?.id as string;
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [shopCategories, setShopCategories] = useState<CategoryShop[]>([]);
  const [shopSubcategories, setShopSubcategories] = useState<CategorySubShop[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [productsSort, setProductsSort] = useState("newest");
  const [productsSearch, setProductsSearch] = useState("");
  const [productSubcategories, setProductSubcategories] = useState<any[]>([]);

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
      // Use server action to bypass RLS
      if (!shop?.id) return [];
      return await getProductsByShop(shop.id);
    },
  });

  // جلب كاتيجوري المنتجات المربوطة بالمتجر
  useEffect(() => {
    if (!shop?.id) return;
    
    const fetchProductCategories = async () => {
      try {
        // جلب كاتيجوري المنتجات المربوطة بهذا المتجر
        const { data, error } = await supabase
          .from("products")
          .select(`
            category_id,
            products_categories(
              id,
              name,
              image_url
            )
          `)
          .eq("shop_id", shop.id);
          
        if (error) throw error;
        
        if (data) {
          // استخراج الكاتيجوريات الفريدة
          const uniqueCats = data
            .map((item: any) => item.products_categories)
            .filter((cat: any) => cat && cat.id)
            .filter((cat: any, index: number, arr: any[]) => 
              arr.findIndex((c: any) => c?.id === cat.id) === index
            );
          setCategories(uniqueCats as Category[]);
        }
      } catch (error: any) {
        console.error('Error fetching product categories:', error);
        // fallback إلى جلب جميع الكاتيجوريات
        try {
          const { data } = await supabase.from("products_categories").select("*");
          setCategories(data ?? []);
        } catch (fallbackError: any) {
          console.error('Error fetching fallback categories:', fallbackError);
          // إذا فشل جلب products_categories أيضاً، جرب categories
          try {
            const { data: categoriesData } = await supabase.from("categories").select("*");
            setCategories(categoriesData ?? []);
          } catch (finalError) {
            console.error('Error fetching categories table:', finalError);
            setCategories([]);
          }
        }
      }
    };
    
    fetchProductCategories();
  }, [shop?.id]);

  // جلب سوب كاتيجوري المنتجات عند اختيار كاتيجوري
  useEffect(() => {
    if (!selectedCategory || !shop?.id) {
      setProductSubcategories([]);
      return;
    }
    
    const fetchProductSubcategories = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(`
            sub_category_id,
            products_sub_categories(
              id,
              name,
              image_url
            )
          `)
          .eq("shop_id", shop.id)
          .eq("category_id", selectedCategory);
          
        if (error) throw error;
        
        if (data) {
          const uniqueSubcats = data
            .map((item: any) => item.products_sub_categories)
            .filter((subcat: any) => subcat && subcat.id)
            .filter((subcat: any, index: number, arr: any[]) => 
              arr.findIndex((s: any) => s?.id === subcat.id) === index
            );
          setProductSubcategories(uniqueSubcats);
        }
      } catch (error: any) {
        console.error('Error fetching product subcategories:', error);
        setProductSubcategories([]);
      }
    };
    
    fetchProductSubcategories();
  }, [selectedCategory, shop?.id]);

  // If the shop record declares a shop-category (category_shop_id), prefer loading that
  useEffect(() => {
    // new schema: shops.category_id
    const catId = (shop as any)?.category_id ?? (shop as any)?.category_shop_id;
    if (!catId) return;

    (async () => {
      try {
        // Use server action to bypass RLS
        const [cat, subs] = await Promise.all([
          supabase.from("shops_categories").select("*").eq("id", catId).single(),
          getShopSubcategories(catId)
        ]);
        setShopCategories(cat.data ? [cat.data as CategoryShop] : []);
        setShopSubcategories((subs as CategorySubShop[]) || []);
      } catch (err) {
        console.error("Error fetching shop's declared categories:", err);
      }
    })();
  }, [shop]);

  // جلب بيانات المتجر
  useEffect(() => {
    setLoading(true);
    getAllShops()
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

    // (isOpen will be computed from remote or local todayWork below)
  }

  // fetch today's work hours from Supabase explicitly and store in state
  const [todayWorkRemote, setTodayWorkRemote] = useState<WorkHours | null>(null);
  useEffect(() => {
    if (!shopId) return;
    (async () => {
      try {
        const res = await supabase.from("shops").select("work_hours").eq("id", shopId).single();
        const data = (res as any).data;
        if (!data) return;
        let arr: WorkHours[] = [];
        if (Array.isArray(data.work_hours)) {
          arr = data.work_hours.map((w: any) => (typeof w === "string" ? JSON.parse(w) : w));
        } else if (typeof data.work_hours === "string") {
          try {
            arr = JSON.parse(data.work_hours);
          } catch {
            arr = [];
          }
        }
        const todayIndexLocal = new Date().getDay();
        const daysEnLocal = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const daysArLocal = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
        const todayEnLocal = daysEnLocal[todayIndexLocal];
        const todayArLocal = daysArLocal[todayIndexLocal];
        const found = arr.find((wh:any) => String(wh.day).toLowerCase() === todayEnLocal.toLowerCase() || String(wh.day) === todayArLocal) ?? null;
        setTodayWorkRemote(found);
      } catch (err) {
        // ignore
      }
    })();
  }, [shopId]);

  // final today work prefers remote data if available
  const finalTodayWork: WorkHours | null = todayWorkRemote ?? todayWork;
  // compute isOpen from finalTodayWork
  if (finalTodayWork && finalTodayWork.open) {
    const start = (finalTodayWork.startTime ?? (finalTodayWork as any).start ?? (finalTodayWork as any).open_time) as string | undefined;
    const end = (finalTodayWork.endTime ?? (finalTodayWork as any).end ?? (finalTodayWork as any).close_time) as string | undefined;
    if (start && end) {
      isOpen = currentTime >= start && currentTime <= end;
    } else {
      isOpen = Boolean(finalTodayWork.open);
    }
  }

  // Prepare display variables for today's day name and hours (for Delivery Time)
  const todayIndex = new Date().getDay();
  const daysEnFull = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const daysArFull = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  const daysHeFull = [
    "ראשון",
    "שני",
    "שלישי",
    "רביעי",
    "חמישי",
    "שישי",
    "שבת",
  ];
  const weekdayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  // Prefer locale-specific hardcoded day names (avoids race with async message load).
  const localeDayNames: Record<string, string[]> = {
    en: daysEnFull,
    ar: daysArFull,
    he: daysHeFull,
  };

  const dayKey = `days.${weekdayKeys[todayIndex]}`;
  let displayTodayName = t(dayKey);
  // If translation isn't loaded yet `t` will return the key — use locale arrays as graceful fallback
  if (!displayTodayName || displayTodayName === dayKey) {
    displayTodayName = localeDayNames[locale]?.[todayIndex] ?? daysEnFull[todayIndex];
  }
  let displayTodayHours = t("shops.closed");
  if (todayWork) {
    const s = (todayWork.startTime ?? (todayWork as any).start ?? (todayWork as any).open_time) as string | undefined;
    const e = (todayWork.endTime ?? (todayWork as any).end ?? (todayWork as any).close_time) as string | undefined;
    if (s && e) displayTodayHours = `${s} - ${e}`;
    else displayTodayHours = todayWork.open ? t("shops.open") : t("shops.closed");
  }

  // استخدام كاتيجوري المنتجات المربوطة بالمتجر
  const uniqueCategories: Category[] = categories.length > 0 ? categories : [];

  // عدد المنتجات وعدد التصنيفات
  const productsCount = products.length;
  const categoriesCount = uniqueCategories.length;

  // فلترة وتصفية المنتجات
  const filteredSortedProducts = products
    .filter((product: Product) =>
      product.name?.toLowerCase().includes(productsSearch.toLowerCase())
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
          {t("shops.loading")}
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg text-red-500 ">
        {t("shops.notFound")}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
{/* Hero/Banner Section - 6am Mart Style */}
<div className="relative w-full h-60 sm:h-72 md:h-80">
        <Image
          src={String(shop.cover_url ?? "/placeholder.svg")}
          alt={String(shop.name ?? "")}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute top-4 left-4">
          <button onClick={() => window.history.back()} className="bg-black/40 text-white p-2 rounded-full">
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="bg-black/40 text-white p-2 rounded-full">
            <Heart size={24} />
          </button>
        </div>
      </div>

      {/* Store Info Panel */}
      <div className="relative -mt-16 sm:-mt-20 z-10">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl p-4 sm:p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-card flex-shrink-0">
              <Image
                src={String(shop.logo_url ?? "/placeholder.svg")}
                alt={`${String(shop.name ?? shop.name ?? "")} logo`}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{shop.name}</h1>
                {/* Open/Close badge */}
                {isOpen ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800">{t("shops.open")}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-800">{t("shops.closed")}</span>
                )}
              </div>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1">
                {shop.address} <ChevronRight size={16} />
              </Link>
              
              {/* عرض كاتيجوري المتجر والتقييم في نفس السطر */}
              <div className="mt-2 flex items-center justify-between">
                <ShopCategoryDisplay shopCategoryId={shop.category_id} />
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Star size={16} className="text-yellow-400" fill="currentColor" />
                  <span>4.8</span>
                  <span className="text-xs text-muted-foreground">(200)</span>
                </div>
              </div>
            </div>
          </div>
          
              <div className="grid grid-cols-3 gap-4 mt-4 text-center border-t border-border pt-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("shops.products")}</p>
              <p className="font-bold text-foreground">{productsCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("shops.deliveryTime")}</p>
              <p className="font-bold text-foreground">30 min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t(dayKey, { default: displayTodayName })}</p>
              <p className="font-bold text-foreground">{displayTodayHours}</p>
            </div>
            <div />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button aria-label={t("shops.deliveryAria")}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <Truck size={20} />
                <span className="text-sm font-medium">{t("shops.delivery")}</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800">
                  <Check size={14} />
                </span>
              </div>
            </button>
            <button aria-label="Card Payment" className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-semibold flex items-center justify-center gap-3">
              <div className="flex items-center gap-2">
                <CreditCard size={20} />
                <span className="text-sm font-medium">{t("shops.cardPayment")}</span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800">
                  <Check size={14} />
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>


      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* شريط تصنيفات المتجر */}
        <div className="mb-8 relative">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t("shops.categories")}</h2>
          <div className="relative">
            {/* سهم يسار (ديسكتوب فقط) */}
            <button
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const el = document.getElementById("shop-category-scroll");
                if (el) el.scrollBy({ left: -150, behavior: "smooth" });
              }}
              aria-label={t("common.scrollLeft")}
            >
              <ChevronDown className="rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
            </button>

            {/* تصنيفات المتجر - match BrandsStrip pill design */}
            <div id="shop-category-scroll" className="flex overflow-x-auto gap-3 scrollbar-hide pb-2 scroll-smooth">
              {/* All category pill */}
              <button
                key="all"
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all ${
                  selectedCategory === null ? "text-blue-600" : "text-gray-700 dark:text-gray-200"
                }`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                    selectedCategory === null ? "border-blue-600" : "border-transparent bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">{allInitial}</div>
                </div>
                <span className="text-sm font-medium mt-1">{t("common.all")}</span>
              </button>

              {uniqueCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(Number(cat.id));
                    setSelectedSubcategory(null);
                  }}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl whitespace-nowrap transition-all ${
                    selectedCategory === Number(cat.id) ? "text-blue-600" : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                      selectedCategory === Number(cat.id) ? "bg-blue-600 border-blue-600" : "border-transparent bg-card"
                    }`}
                  >
                    {cat.image_url ? (
                      <Image src={String(cat.image_url ?? "/placeholder.svg")} alt={String(cat.name ?? "")} fill className="object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">{String(cat.name ?? "").charAt(0)}</div>
                    )}
                  </div>
                  <span className="text-sm font-medium mt-1">{String(cat.name ?? "")}</span>
                </button>
              ))}
            </div>
            </div>

            {/* سهم يمين (ديسكتوب فقط) */}
            <button
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                const el = document.getElementById("shop-category-scroll");
                if (el) el.scrollBy({ left: 150, behavior: "smooth" });
              }}
              aria-label={t("common.scrollRight")}
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

        {/* Subcategory Pills for selected category - سوب كاتيجوري المنتجات */}
        {selectedCategory !== null && productSubcategories.length > 0 && (
          <div className="mt-6 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t("subcategories.title")}</h3>
            <div className="relative">
              {/* Left Arrow */}
              <button
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  const el = document.getElementById("product-subcategory-scroll");
                  if (el) el.scrollBy({ left: -150, behavior: "smooth" });
                }}
                aria-label="Scroll Left"
              >
                <ChevronDown className="rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Scrollable Pills */}
              <div
                id="product-subcategory-scroll"
                className="flex overflow-x-auto gap-3 scrollbar-hide pb-2 scroll-smooth"
              >
                {/* All subcategory pill */}
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all"
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                      selectedSubcategory === null ? "border-blue-600" : "border-transparent"
                    }`}
                  >
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                      {allInitial}
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium mt-1 ${
                      selectedSubcategory === null ? "text-blue-600" : ""
                    }`}
                  >
                    {t("common.all")}
                  </span>
                </button>

                {/* سوب كاتيجوري المنتجات */}
                {productSubcategories.map((sub: any) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(Number(sub.id))}
                    className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all"
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                        selectedSubcategory === Number(sub.id) ? "border-blue-600" : "border-transparent"
                      }`}
                    >
                      {sub.image_url ? (
                        <Image
                          src={String(sub.image_url ?? "/placeholder.svg")}
                          alt={String(sub.name ?? "")}
                          fill
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                          {String(sub.name ?? "").charAt(0)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium mt-1 ${
                        selectedSubcategory === Number(sub.id) ? "text-blue-600" : ""
                      }`}
                    >
                      {String(sub.name ?? "")}
                    </span>
                  </button>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  const el = document.getElementById("product-subcategory-scroll");
                  if (el) el.scrollBy({ left: 150, behavior: "smooth" });
                }}
                aria-label="Scroll Right"
              >
                <ChevronDown className="-rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}

        {/* Brands associated with shop (or general brands) */}
        <div className="mt-2 mb-8">
          <BrandsStrip selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} shopId={shop ? Number(shop.id) : null} />
        </div>

        {/* فلترة المنتجات حسب التصنيف المختار - عرض جميع العروض */}
        <div className="space-y-6">
          {productsLoading ? (
            <div className="text-center text-gray-400 py-8">{t("products.loading", { default: "Loading products..." })}</div>
          ) : productsError ? (
            <div className="text-center text-red-500 py-8">{t("products.error", { message: productsError?.message ?? t("common.unexpectedError") })}</div>
          ) : (
            (() => {
              const filteredProducts = filteredSortedProducts.filter((product: Product) => {
                // match category if selected
                const matchCat = selectedCategory === null ? true : Number(product.category_id) === Number(selectedCategory);
                // match subcategory if selected  
                const matchSub = selectedSubcategory === null ? true : Number((product as any).sub_category_id || 0) === Number(selectedSubcategory);
                // match brand if selected (check common product fields)
                const productBrandId = Number((product as any).brand_id || (product as any).brand?.id || (product as any).brand || 0);
                const matchBrand = selectedBrand === null ? true : productBrandId === Number(selectedBrand);
                return matchCat && matchSub && matchBrand;
              });

              if (filteredProducts.length === 0) {
                return <div className="text-center text-gray-400 py-8">{t("common.noProducts")}</div>;
              }

              // عرض جميع المنتجات في شبكة واحدة بدلاً من تجميعها
              return (
                <div className="space-y-6">
                  {/* عنوان القسم */}
                  <div className="flex items-center justify-between mb-6 px-2 sm:px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 sm:w-1.5 sm:h-6 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                      <h3 className="text-base sm:text-lg font-bold">
                        {selectedCategory || selectedSubcategory || selectedBrand 
                          ? t("shops.filteredProducts") 
                          : t("shops.allProducts")}
                        <span className="text-sm text-gray-500 ml-2">({filteredProducts.length})</span>
                      </h3>
                    </div>
                  </div>

                  {/* شبكة المنتجات */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 px-2 sm:px-6">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="w-full">
                        <ProductCard product={product as any} />
                      </div>
                    ))}
                  </div>

                  {/* إعلان في النهاية إذا كان هناك منتجات كثيرة */}
                  {filteredProducts.length > 12 && (
                    <div className="mt-8">
                      <AdBanner
                        imageSrc="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg"
                        title={t("ad.freshDeals.title", { default: "Fresh Deals" })}
                        subtitle={t("ad.freshDeals.subtitle", { default: "Save more on your favorites" })}
                      />
                    </div>
                  )}
                </div>
              );
            })()
          )}
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
          <p className="text-gray-600 dark:text-gray-300">Various products</p>
            <p className="text-gray-600 dark:text-gray-300">Mixed products</p>
        </div>
      </div>
    </div>
  );
}

