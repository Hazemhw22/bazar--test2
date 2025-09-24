"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category, CategorySub } from "@/lib/type";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useI18n } from "../lib/i18n";


export function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<CategorySub[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });

      if (fetchError) {
        setError("فشل تحميل التصنيفات، حاول مرة أخرى.");
        return;
      }

      setCategories(data || []);
    } catch (err) {
      setError("خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId: number) => {
    const { data, error } = await supabase
      .from("categories_sub") 
      .select("*")
      .eq("category_id", categoryId);

    if (!error) setSubcategories(data || []);
    else setSubcategories([]);
  };

  if (loading) {
    return <p className="p-6 text-center">جارٍ تحميل التصنيفات...</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchCategories}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (categories.length === 0) {
    return <p className="p-6 text-center">لا يوجد تصنيفات حالياً.</p>;
  }

  // أول 5 تصنيفات فقط للهاتف
  const displayedCategories = categories.slice(0, 5);

  return (
    <section className="w-full py-4 sm:py-8 px-2 sm:px-1 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t("suggestedCategories")}
          </h2>
        </div>

        {/* ديسكتوب: سطر أفقي لجميع الكاتيجوري مع هوفر واختيار */}
        <div className="hidden md:block">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative flex flex-col items-center px-4 py-2 transition-colors duration-150
                  ${
                    selectedCategory === category.id
                      ? "text-blue-600 font-bold"
                      : "text-gray-700 dark:text-gray-200 hover:text-blue-600"
                  }
                `}
                style={{ background: "none", border: "none" }}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden mb-1">
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.title}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
                  )}
                </div>
                <span className="text-xs font-medium truncate">{category.title}</span>
              </button>
            ))}
            {/* زر عرض الكل */}
            <Link
              href="/categories"
              className="flex flex-col items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-1">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium">See All</span>
            </Link>
          </div>
          {/* subcategory كبطاقات أو pills واضحة */}
          {selectedCategory && subcategories.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-5">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${selectedCategory}?sub=${sub.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white transition-colors shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  {sub.image && (
                    <Image
                      src={sub.image}
                      alt={sub.title}
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium">{sub.title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* موبايل: شبكة كما هي */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 md:hidden">
          {displayedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden mb-2">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.title}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full" />
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {category.title}
              </h3>
            </Link>
          ))}

          {/* العنصر السادس: See All */}
          <Link
            href="/categories"
            className="flex flex-col items-center text-center cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-2">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xs sm:text-sm font-medium text-blue-600">
              See All
            </h3>
          </Link>
        </div>
      </div>
    </section>
  );
}
