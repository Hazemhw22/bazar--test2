"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef
} from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Clock, ChevronDown, Search, Filter, ShoppingBag, Award, Calendar } from "lucide-react";

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
    <div className="container mx-auto px-4 py-6">
      {/* Header and Search */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pazar-dark dark:text-white mb-2">Shops</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Discover our verified shops and find what you need
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-pazar-dark-accent bg-white dark:bg-pazar-dark-card text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-pazar-primary"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
        </div>

      
      </div>
      
      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-pazar-dark dark:text-white mb-3">Categories</h2>
        <div 
          ref={scrollRef} 
          className="flex overflow-x-auto pb-4 gap-3 cursor-grab scrollbar-hide"
        >
          <button
            onClick={() => setSelectedShopCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedShopCategory === null
                ? "bg-pazar-primary text-white"
                : "bg-gray-100 dark:bg-pazar-dark-accent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-pazar-dark-accent/80"
            }`}
          >
            All
          </button>
          {shopCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedShopCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedShopCategory === category.id
                  ? "bg-pazar-primary text-white"
                  : "bg-gray-100 dark:bg-pazar-dark-accent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-pazar-dark-accent/80"
              }`}
            >
              {category.title}
            </button>
          ))}
        </div>
        {/* subcategory كبطاقات أو pills واضحة */}
        {selectedShopCategory && shopSubCategories.length > 0 && (
          <div className="flex gap-2 mt-4">
            {shopSubCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedShopSubCategory(sub.id)}
                className={`
                  px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800
                  hover:bg-blue-600 hover:text-white transition-colors shadow-sm border
                  border-gray-200 dark:border-gray-700 text-xs font-medium
                  ${selectedShopSubCategory === sub.id ? "bg-blue-600 text-white" : ""}
                `}
              >
                {sub.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* هنا يمكنك وضع شريط البحث أو خيارات الترتيب */}

      {/* Shop Cards */}
      <div className="grid grid-cols-1 gap-6 md:gap-8 mt-8">
        {loading ? (
          // Loading skeletons
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="bg-white dark:bg-pazar-dark-card rounded-xl shadow-sm animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-pazar-dark-accent rounded-t-xl"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 dark:bg-pazar-dark-accent rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-pazar-dark-accent rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-pazar-dark-accent rounded w-5/6 mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 dark:bg-pazar-dark-accent rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-pazar-dark-accent rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))
        ) : filteredAndSortedShops.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-pazar-dark dark:text-white mb-2">No shops found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          filteredAndSortedShops.map((shop) => (
            <StoreCard key={shop.id} shop={shop} />
          ))
        )}
      </div>
    </div>
  );
}

// مثال مبسط لـ StoreCard (يمكنك تعديله حسب تصميمك)
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