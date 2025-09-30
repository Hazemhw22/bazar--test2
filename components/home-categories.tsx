"use client";

import { useEffect, useRef, useState } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  // Mouse drag scroll for desktop
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
      const walk = (x - startX) * 1.5; // سرعة السحب
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
    <section className="w-full py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* العنوان */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {t("suggestedCategories")}
          </h2>
          <Link href="/categories" className="text-sm font-medium text-primary hover:underline">
            See All
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-4 gap-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="flex flex-col items-center text-center cursor-pointer group"
            >
              <div className="w-20 h-20 p-4 rounded-2xl bg-card flex items-center justify-center overflow-hidden mb-2 transition-all duration-300 group-hover:shadow-lg group-hover:bg-primary/10">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.title}
                    width={64}
                    height={64}
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-full" />
                )}
              </div>
              <h3 className="text-sm font-medium text-foreground truncate w-full">
                {category.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
