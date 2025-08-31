"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/lib/type";

const fallbackIcons = [
  "🏠", "🌿", "📱", "☕", "👕", "👜", "👟", "🛒", "🎁", "💡"
];

export function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

      const transformed = (data || []).map((cat, idx) => ({
        ...cat,
        icon: cat.icon || fallbackIcons[idx % fallbackIcons.length],
      }));

      setCategories(transformed);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("categories-container");
    if (container) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
      setTimeout(checkScrollPosition, 300);
    }
  };

  const checkScrollPosition = () => {
    const container = document.getElementById("categories-container");
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
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

  return (
    <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        

        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div
            id="categories-container"
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            onScroll={checkScrollPosition}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0 w-32 sm:w-36 md:w-40 lg:w-44"
              >
                <div
                  className="w-full aspect-square rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform duration-200 cursor-pointer"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                    {category.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
