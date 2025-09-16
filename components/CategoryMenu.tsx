"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Category } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";

export default function CategoryMenu() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="overflow-x-auto snap-x scrollbar-hide">
      <div className="flex flex-wrap gap-4 py-4 px-2 w-max">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="flex flex-col items-center gap-2 snap-start cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              <Image
                src={cat.image_url || "/fallback.png"}
                alt={cat.title}
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <span className="text-xs font-medium">{cat.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
