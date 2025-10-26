"use client";

import {
  useState,
  useEffect,
  useMemo,
  useRef
} from "react";
import { supabase, publicStorageUrl } from "../lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Clock, ChevronDown, Search, Filter, ShoppingBag, Award, Calendar, LayoutGrid, List, Eye, Heart } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { Shop as LibShop } from "@/lib/types";

// Render a single star that fills proportionally to value/5 using two layered SVGs
function StarProgress({ value = 0, size = 14 }: { value?: number; size?: number }) {
  const pct = Math.max(0, Math.min(1, value / 5));
  const gray = '#E5E7EB'; // tailwind gray-200
  const yellow = '#F59E0B'; // tailwind amber-500

  return (
    <span className="inline-block relative" style={{ width: size, height: size }}>
      {/* background (unfilled) star */}
      <Star
        style={{ width: size, height: size, color: gray }}
        fill="none"
        stroke="currentColor"
      />
      {/* foreground (filled) star clipped to percentage */}
      <span style={{ position: 'absolute', left: 0, top: 0, width: `${pct * 100}%`, height: size, overflow: 'hidden' }}>
        <Star
          style={{ width: size, height: size, color: yellow }}
          fill="currentColor"
          stroke="none"
        />
      </span>
    </span>
  );
}

// Render 5 stars and fill each according to rating (supports fractional by filling each star proportionally)
function StarsRow({ rating = 4, size = 14 }: { rating?: number; size?: number }) {
  const r = Math.max(0, Math.min(5, rating));
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const perStarFill = Math.max(0, Math.min(1, r - i));
        return <StarProgress key={i} value={perStarFill * 5} size={size} />;
      })}
    </div>
  );
}


// أنواع التصنيفات
interface CategoryShop {
  id: number;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
}
interface CategorySubShop {
  id: number;
  name: string;
  description: string;
  category_id: number;
  image_url: string;
  created_at: string;
}

// نوع المتجر (يمكنك تعديله حسب مشروعك)
// Use shared Shop type from `lib/type.ts`

type SortOption = "rating" | "products" | "alphabetical" | "newest";

export default function ShopsPage({
  viewMode: viewModeProp,
  onViewModeChange,
  initialViewMode,
}: {
  viewMode?: "grid" | "list";
  onViewModeChange?: (m: "grid" | "list") => void;
  initialViewMode?: "grid" | "list";
}) {
  const [shopsData, setShopsData] = useState<LibShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewModeState] = useState<"grid" | "list">(
    viewModeProp ?? initialViewMode ?? "grid"
  );

  // sync when controlled prop changes
  useEffect(() => {
    if (viewModeProp) setViewModeState(viewModeProp);
  }, [viewModeProp]);

  const setViewMode = (m: "grid" | "list") => {
    if (onViewModeChange) onViewModeChange(m);
    // only update local state when uncontrolled
    if (viewModeProp === undefined) setViewModeState(m);
  };

  const { t, locale } = useI18n();

  // كاتيجوري المتاجر وسوب كاتيجوري
  const [shopCategories, setShopCategories] = useState<CategoryShop[]>([]);
  const [shopSubCategories, setShopSubCategories] = useState<CategorySubShop[]>([]);
  const [selectedShopCategory, setSelectedShopCategory] = useState<number | null>(null);
  const [selectedShopSubCategory, setSelectedShopSubCategory] = useState<number | null>(null);

  // جلب كاتيجوري المتاجر (قاعدة البيانات الجديدة: `shops_categories`)
  useEffect(() => {
    async function fetchShopCategories() {
      const { data } = await supabase.from("shops_categories").select("*").order("id", { ascending: true });
      setShopCategories(data || []);
    }
    fetchShopCategories();
  }, []);

  // جلب سوب كاتيجوري عند اختيار كاتيجوري (قاعدة البيانات الجديدة: `shops_sub_categories`)
  useEffect(() => {
    if (selectedShopCategory) {
      supabase
        .from("shops_sub_categories")
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
      const { data: shops, error: shopsError } = await supabase.from("shops").select("*");
      const { data: cats } = await supabase.from("shops_categories").select("*");

      // Try to fetch products' shop foreign key in a resilient way:
      // prefer `shop_id` (newer schema) and fall back to legacy `shop` column.
      let products: any[] | null = null;
      try {
        const { data } = await supabase.from("products").select("shop_id");
        if (data) products = data;
      } catch (err) {
        // ignore and try fallback
      }
      if (!products) {
        try {
          const { data } = await supabase.from("products").select("shop");
          if (data) products = data;
        } catch (err) {
          products = null;
        }
      }

      if (!shopsError && shops && cats) {
        const shopsWithCount = shops.map((shop) => {
          const count = products
            ? products.filter((p) => (p.shop_id ?? p.shop) === shop.id).length
            : 0;
          return {
            ...shop,
            // don't resolve translations during fetch; store actual name or null
            categoryTitle:
              cats.find((cat) => cat.id === shop.category_shop_id)?.name || null,
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

    return filtered;
  }, [shopsData, selectedShopCategory, selectedShopSubCategory]);

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
    <div className="container mx-auto px-1 py-6">
      {/* Header and Search */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pazar-dark dark:text-white mb-2">{t("shops.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("shops.subtitle")}</p>
      </div>

      {/* View mode + Filters (mobile friendly) */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md ${viewMode === "grid" ? "bg-pazar-primary text-white" : "text-gray-300 hover:bg-white/5"}`}
            aria-label={t("shops.gridView")}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${viewMode === "list" ? "bg-pazar-primary text-white" : "text-gray-300 hover:bg-white/5"}`}
            aria-label={t("shops.listView")}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // open filters - you can replace this with your filter drawer logic
              setSelectedShopCategory(null)
              setSelectedShopSubCategory(null)
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-pazar-dark-accent text-sm"
          >
            <Filter className="w-4 h-4" />
            <span>{t("shops.filters")}</span>
          </button>
        </div>
      </div>
      
      {/* Categories */}
      <div className="mb-8">
  <h2 className="text-lg font-semibold text-pazar-dark dark:text-white mb-3">{t("shops.categories")}</h2>
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
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 relative rounded-full overflow-hidden bg-gray-100">
                <Image src="/placeholder.svg" alt="All" fill className="object-cover" />
              </div>
              <span>{t("common.all")}</span>
            </div>
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
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 relative rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={resolveImage(category.image_url, "/placeholder.svg", "shop_categories")}
                      alt={String(category.name ?? "")}
                      fill
                      className="object-cover"
                    />
                </div>
                <span>{category.name}</span>
              </div>
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
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 relative rounded-full overflow-hidden bg-gray-100">
                    <Image src={resolveImage(sub.image_url, "/placeholder.svg", "shop_categories")} alt={String(sub.name ?? "")} fill className="object-cover" />
                  </div>
                  <span>{sub.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* هنا يمكنك وضع شريط البحث أو خيارات الترتيب */}

      {/* Shop Cards */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-8 mt-2">
          {loading ? (
          // Loading skeletons
            Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-white dark:bg-pazar-dark-card rounded-2xl shadow-sm animate-pulse">
                  <div className="h-40 bg-gray-200 dark:bg-pazar-dark-accent rounded-t-2xl"></div>
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
            <h3 className="text-xl font-semibold text-pazar-dark dark:text-white mb-2">{t("shops.noResults.title")}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t("shops.noResults.description")}</p>
          </div>
          ) : (
            filteredAndSortedShops.map((shop) => (
              <StoreCard key={shop.id} shop={shop} />
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-8">
          {loading ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-white dark:bg-pazar-dark-card rounded-xl shadow-sm animate-pulse h-20" />
              ))
          ) : filteredAndSortedShops.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-pazar-dark dark:text-white mb-2">{t("shops.noResults.title")}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t("shops.noResults.description")}</p>
            </div>
          ) : (
            filteredAndSortedShops.map((shop) => (
              <ListRow key={shop.id} shop={shop} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// مثال مبسط لـ StoreCard (يمكنك تعديله حسب تصميمك)
function StoreCard({ shop }: { shop: LibShop }) {
  const { t } = useI18n();
  return (
    <Link
      href={`/shops/${shop.id}`}
      className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full"
    >
  {/* Image */}
  <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 h-44 sm:h-52">
        <Image
         src={shop.cover_url || "/placeholder.svg"}
          alt={shop.name ?? shop.name ?? ""}
          fill
          priority
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />


        {/* Category badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold shadow">
            {shop.categoryName ?? t("shops.uncategorized")}
          </span>
        </div>

        
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-lg">
              {shop.name}
            </h3>
            {/* Open/Close badge next to name */}
            {renderOpenBadge(shop.work_hours, t)}
          </div>
          {shop.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{shop.description}</p>
          )}
        </div>

            <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <StarProgress value={(shop as any).rating ?? 4.7} size={12} />
              <span className="text-sm">{((shop as any).rating ?? 4.7).toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <ShoppingBag className="w-3 h-3 text-gray-700 dark:text-gray-200" />
              <span className="text-sm">{shop.productsCount ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Helpers: determine if shop is open today from work_hours
function parseTimeToMinutes(t?: string) {
  if (!t) return null;
  const parts = t.split(":");
  if (parts.length < 2) return null;
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  return hh * 60 + mm;
}

function isOpenToday(work_hours: any): { open: boolean; label?: string } {
  try {
    if (!work_hours || !Array.isArray(work_hours)) return { open: false };
    const now = new Date();
    const todayIndex = now.getDay(); // 0 = Sunday
    const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

    const entry = work_hours.find((w: any) => {
      if (!w) return false;
      if (typeof w.day === "number") return Number(w.day) === todayIndex;
      const dayStr = String(w.day || "").toLowerCase();
      if (names.includes(dayStr)) return names.indexOf(dayStr) === todayIndex;
      if (dayStr.length >= 3) {
        const short = dayStr.slice(0, 3);
        return names.map(n => n.slice(0,3)).indexOf(short) === todayIndex;
      }
      return false;
    });

    if (!entry) return { open: false };
    if (!entry.open) return { open: false };

    const start = parseTimeToMinutes(entry.startTime || entry.start || entry.open_time);
    const end = parseTimeToMinutes(entry.endTime || entry.end || entry.close_time);
    if (start === null || end === null) {
      // If times not parseable, fall back to entry.open flag
      return { open: Boolean(entry.open), label: undefined };
    }
    const nowMin = now.getHours() * 60 + now.getMinutes();
    return { open: nowMin >= start && nowMin <= end, label: `${entry.startTime || entry.start || entry.open_time} - ${entry.endTime || entry.end || entry.close_time}` };
  } catch (err) {
    return { open: false };
  }
}

function renderOpenBadge(work_hours: any, t: (k: string) => string) {
  const status = isOpenToday(work_hours);
  if (status.open) {
    return (
      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-800">{t("shops.open")}</span>
    );
  }
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-800">{t("shops.closed")}</span>
  );
}

// Resolve image paths: if value is a full URL or starts with '/', return as-is.
// Otherwise build a public storage URL using the given bucket name.
function resolveImage(src: any, fallback: string, bucket: string) {
  if (!src) return fallback;
  const s = String(src);
  if (s.startsWith("http") || s.startsWith("/")) return s;
  const url = publicStorageUrl(bucket, s);
  return url || fallback;
}

// Compact list row for list view
function ListRow({ shop }: { shop: LibShop }) {
  const { t } = useI18n();
  return (
    <Link
      href={`/shops/${shop.id}`}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-200 cursor-pointer hover:ring-4 hover:ring-pazar-primary/20"
      role="button"
    >
      <div className="w-20 h-20 relative rounded-md overflow-hidden bg-gray-200">
        <Image
          src={resolveImage(shop.cover_url, "/placeholder.svg", "shops")}
          alt={String(shop.name ?? shop.name ?? t("shops.unnamed") ?? "Shop")}
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold truncate">{shop.name}</h4>
          {/* Open/Close badge moved to the top-right (replacing the stars) */}
          <div className="flex-shrink-0">
            {renderOpenBadge(shop.work_hours, t)}
          </div>
        </div>
  <p className="text-sm text-gray-300 truncate">{shop.categoryTitle ?? t("shops.uncategorized")}</p>
        <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span>{shop.productsCount} Products</span>
            </div>
            {/* Stars moved below the products count */}
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-300">
              <StarsRow rating={Math.round((shop as any).rating ?? 4)} size={14} />
              <span>{((shop as any).rating ?? 4).toFixed(1)}</span>
            </div>
          </div>
          <div className="flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}