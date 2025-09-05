"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/lib/type";
import Image from "next/image";

export default function CategoryMenu() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .then(({ data }) => {
        setCategories(data || []);
      });
  }, []);

  return (
    <div
      className="flex flex-row-reverse gap-2 overflow-x-auto py-2 scrollbar-hide"
      dir="rtl"
    >
      {categories.map((cat) => (
        <button
          key={cat.id}
          className="flex flex-row-reverse items-center gap-2 text-sm whitespace-nowrap px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-0 flex-shrink-0"
        >
          {/* صورة التصنيف */}
          {cat.image_url ? (
            <Image
              src={cat.image_url}
              alt={cat.title}
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600" />
          )}

          {/* اسم التصنيف */}
          <span>{cat.title}</span>
        </button>
      ))}
    </div>
  );
}
