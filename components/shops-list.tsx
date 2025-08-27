"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { Category, Shop as ShopBase, WorkHours } from "@/lib/type";
import { useI18n } from "../lib/i18n";

// Extend Shop type to include categoryTitle and shop_desc
type Shop = ShopBase & { categoryTitle: string; shop_desc: string };
import { supabase } from "@/lib/supabase";

type SortOption = "rating" | "products" | "alphabetical" | "newest";

export default function ShopsPage() {
  const { t } = useI18n();
  const [shopsData, setShopsData] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 9;

  // جلب البيانات الحقيقية من supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // جلب المتاجر
      const { data: shops, error: shopsError } = await supabase
        .from("shops")
        .select("*, profiles(full_name)");
      // جلب التصنيفات
      const { data: cats } = await supabase.from("categories").select("*");
      if (!shopsError && shops && cats) {
        setCategories(cats);
        const { data: products } = await supabase
          .from("products")
          .select("shop");
        const shopsWithCount = shops.map((shop) => {
          const count = products
            ? products.filter((p) => p.shop === shop.id).length
            : 0;
          return {
            ...shop,
            categoryTitle:
              cats.find((cat) => cat.id === shop.category_id)?.title ||
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

  // Filter and sort shops
  const filteredAndSortedShops = useMemo(() => {
    const filtered = shopsData.filter(
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
  }, [shopsData, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedShops.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShops = filteredAndSortedShops.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mb-8">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("shops.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{t("shops.subtitle")}</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={t("shops.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {t("shops.filters")}
              </Button>

              <Select
                value={sortBy}
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t("shops.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">{t("shops.sort.topRated")}</SelectItem>
                  <SelectItem value="products">{t("shops.sort.mostProducts")}</SelectItem>
                  <SelectItem value="alphabetical">{t("shops.sort.alphabetical")}</SelectItem>
                  <SelectItem value="newest">{t("shops.sort.newest")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t("shops.showing", { count: paginatedShops.length, total: filteredAndSortedShops.length })}
            </div>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-lg text-gray-500">{t("common.loading")}</div>
        ) : paginatedShops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t("shops.noResults")}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t("shops.noResultsHint")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedShops.map((shop) => (
              <Card
                key={shop.id}
                className="overflow-hidden hover:shadow-md transition-all duration-300 group"
              >
                <CardContent className="p-0">
                  {/* Shop Cover Image */}
                  <div className="relative h-32 overflow-hidden flex items-center justify-center">
                    <Image
                      src={shop.cover_image_url || "/placeholder.svg"}
                      alt={shop.shop_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Shop Logo - بارز وفي منتصف الكارد بين الغلاف والمحتوى */}
                  <div
                    className="flex justify-center"
                    style={{
                      marginTop: "-2rem",
                      zIndex: 20,
                      position: "relative",
                    }}
                  >
                    <div className="w-16 h-16 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                      <Image
                        src={shop.logo_url || "/placeholder.svg"}
                        alt={`${shop.shop_name} logo`}
                        width={64}
                        height={64}
                        className="object-cover w-16 h-16"
                      />
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="p-4 pt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        {shop.shop_name}
                      </h3>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap ms-auto">
                        {shop.profiles?.full_name ?? shop.owner}
                      </span>
                    </div>

                    {/* الوصف */}
                    <p className="text-xs leading-snug text-gray-600 dark:text-gray-400 mb-1 h-10 overflow-hidden">
                      {shop.shop_desc}
                    </p>

                    {/* Stats (compact) */}
                    <div className="flex items-center gap-3 text-xs mb-1">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-blue-500" />
                        <span className="text-gray-700 dark:text-gray-200 font-medium">
                          {shop.productsCount ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[160px]">{shop.address}</span>
                      </div>
                    </div>
                    {/* الكاتيجوري */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                        {shop.categoryTitle}
                      </Badge>
                    </div>

                    {/* ساعات العمل */}
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 mb-2">
                      <Clock className="h-3 w-3" />
                      {(() => {
                        let workHoursArr: WorkHours[] = [];
                        if (Array.isArray(shop.work_hours)) {
                          if (
                            shop.work_hours.length > 0 &&
                            typeof shop.work_hours[0] === "string"
                          ) {
                            // Parse each string to WorkHours object
                            workHoursArr = (shop.work_hours as string[])
                              .map((s) => {
                                try {
                                  return JSON.parse(s);
                                } catch {
                                  return null;
                                }
                              })
                              .filter(Boolean) as WorkHours[];
                          } else {
                            workHoursArr =
                              shop.work_hours as unknown as WorkHours[];
                          }
                        } else if (typeof shop.work_hours === "string") {
                          try {
                            workHoursArr = JSON.parse(shop.work_hours);
                          } catch {
                            workHoursArr = [];
                          }
                        }
                        // استدعاء اليوم الحالي فقط
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
                        const todayWork = workHoursArr.find(
                          (h) => h.day === today
                        );
                        return todayWork
                          ? todayWork.open
                            ? `${todayWork.day}: ${todayWork.startTime} - ${todayWork.endTime}`
                            : `${todayWork.day}: مغلق`
                          : "لا يوجد دوام اليوم";
                      })()}
                    </div>

                    {/* Visit Button */}
                    <div className="flex justify-end">
                      <Link href={`/shops/${shop.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-xs">
                          زيارة المتجر
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common.prev")}
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className="w-10 h-10"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              {t("common.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}