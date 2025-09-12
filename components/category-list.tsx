"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Package,
  TrendingUp,
  Monitor,
  Smartphone,
  Headphones,
  Laptop,
  Tv,
  Speaker,
  Watch,
  Lightbulb,
  Wifi,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export interface Category {
  id: number;
  title: string;
  desc: string;
  image_url?: string; // الصورة من قاعدة البيانات
}

type SortOption = "title" | "products" | "trending";
type CategoryWithExtra = Category & {
  productCount: number;
  trending: boolean;
  color: string;
};

// خريطة الأيقونات
const getCategoryIcon = (title: string) => {
  const iconMap: Record<string, any> = {
    Phones: Smartphone,
    Headsets: Headphones,
    Laptops: Laptop,
    "TV sets": Tv,
    Sound: Speaker,
    Watches: Watch,
    Others: Lightbulb,
    Internet: Wifi,
  };
  return iconMap[title] || Package;
};

// خريطة الألوان
const getIconColor = (title: string) => {
  const colorMap: Record<string, string> = {
    Phones: "#4A70FF",
    Headsets: "#8A63D2",
    Laptops: "#FFB84A",
    "TV sets": "#FF638A",
    Sound: "#FFD700",
    Watches: "#8A63D2",
    Others: "#4A70FF",
    Internet: "#FFB84A",
  };
  return colorMap[title] || "#6B7280";
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("title");
  const [showTrendingOnly, setShowTrendingOnly] = useState(false);
  const [productCounts, setProductCounts] = useState<Record<number, number>>(
    {}
  );

  // جلب التصنيفات
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return data as Category[];
    },
  });

  // جلب عدد المنتجات لكل تصنيف
  useEffect(() => {
    const fetchCounts = async () => {
      if (!categories.length) return;
      const counts: Record<number, number> = {};
      for (const cat of categories) {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category", cat.id);
        counts[cat.id] = count || 0;
      }
      setProductCounts(counts);
    };
    fetchCounts();
  }, [categories]);

  // إضافة الحقول الإضافية
  const categoriesWithExtra: CategoryWithExtra[] = categories.map((cat) => ({
    ...cat,
    productCount: productCounts[cat.id] ?? 0,
    trending: Math.random() > 0.5,
    color: "from-blue-500 to-purple-600",
  }));

  // فلترة وفرز
  const filteredAndSortedCategories = categoriesWithExtra
    .filter((category) => {
      const matchesSearch =
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrending = !showTrendingOnly || category.trending;
      return matchesSearch && matchesTrending;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "products":
          return b.productCount - a.productCount;
        case "trending":
          return Number(b.trending) - Number(a.trending);
        case "title":
        default:
          return a.title.localeCompare(b.title);
      }
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-card border-b border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Our Categories
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover products organized into categories to help you find what
              you love faster.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto space-y-4 mobile:max-w-[480px]">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <Select
                  value={sortBy}
                  onValueChange={(value: SortOption) => setSortBy(value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Alphabetical</SelectItem>
                    <SelectItem value="products">Most Products</SelectItem>
                    <SelectItem value="trending">Trending First</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={showTrendingOnly ? "default" : "outline"}
                  onClick={() => setShowTrendingOnly(!showTrendingOnly)}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  Trending Only
                </Button>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredAndSortedCategories.length} of{" "}
                {categories.length} categories
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            حدث خطأ أثناء جلب التصنيفات
          </div>
        ) : filteredAndSortedCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCategories.map((category, idx) => {
              const IconComponent = getCategoryIcon(category.title);
              const iconColor = getIconColor(category.title);
              const isHighlighted = idx === 0;

              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  aria-label={category.title}
                >
                  <div
                    className={`relative rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                      isHighlighted
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="p-6 space-y-4">
                      {/* صورة أو أيقونة */}
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.title}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            isHighlighted
                              ? "bg-white/20"
                              : "bg-gray-100 dark:bg-gray-700"
                          }`}
                        >
                          <IconComponent
                            className="w-6 h-6"
                            style={{
                              color: isHighlighted ? "white" : iconColor,
                            }}
                          />
                        </div>
                      )}

                      {/* العنوان */}
                      <h3
                        className={`font-semibold text-lg ${
                          isHighlighted
                            ? "text-white"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {category.title}
                      </h3>

                      {/* الوصف */}
                      <p
                        className={`text-sm leading-relaxed ${
                          isHighlighted
                            ? "text-white/80"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {category.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
