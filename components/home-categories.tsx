"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/lib/type";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useI18n } from "../lib/i18n"


export function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n()

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });

      if (fetchError) {
        console.error("Supabase error:", fetchError);
        setError("فشل تحميل التصنيفات، حاول مرة أخرى.");
        return;
      }

      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
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

  // أول 5 تصنيفات فقط
  const displayedCategories = categories.slice(0, 5);

  return (
    <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
             {t("suggestedCategories")}
          </h2>
        </div>

        {/* شبكة من صفين × 3 أعمدة */}
        <div className="grid grid-cols-3 gap-6">
          {displayedCategories.map((category) => (
            <div
              key={category.id}
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
            </div>
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
