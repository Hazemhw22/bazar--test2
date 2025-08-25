"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/lib/type";

const fallbackIcons = [
  "🏠",
  "🌿",
  "📱",
  "☕",
  "👕",
  "👜",
  "👟",
  "🛒",
  "🎁",
  "💡",
];

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
      {categories.map((cat, idx) => (
        <button
          key={cat.id}
          className="flex flex-row-reverse items-center gap-1 text-sm whitespace-nowrap px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-0 flex-shrink-0"
        >
          <span className="text-lg">
            {cat.icon || fallbackIcons[idx % fallbackIcons.length]}
          </span>
          {cat.title}
        </button>
      ))}
    </div>
  );
}
