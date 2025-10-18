"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "../lib/i18n";

export function HomeBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);

      // Assumption: brands are stored in a table called `categories_brands`.
      // If your DB uses a different table name (e.g. `brands`), update this query accordingly.
      const { data, error } = await supabase
        .from("categories_brands")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        setError(t("brands.loadError") || "فشل تحميل العلامات التجارية، حاول مرة أخرى.");
        return;
      }

      setBrands(data || []);
    } catch (err) {
      setError(t("common.unexpectedError") || "خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-center">{t("common.loading")}</p>;
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchBrands}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (brands.length === 0) {
    return <p className="p-6 text-center">{t("brands.none")}</p>;
  }

  return (
    <section className="w-full py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{t("brands.title") ?? t("brands") ?? "Brands"}</h2>
          <Link href="/brands_shop" className="text-sm font-medium text-primary hover:underline">
            {t("common.viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6 sm:gap-6 md:gap-8 justify-items-center">
          {brands.slice(0, 8).map((brand) => (
            <Link
              key={brand.id}
              href={`/brands_shop/${brand.id}`}
              className="flex flex-col items-center text-center cursor-pointer group px-2 py-1"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg bg-card overflow-hidden mb-2 transition-all duration-300 group-hover:shadow-lg group-hover:bg-primary/10">
                {brand.image_url ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={brand.image_url}
                      alt={brand.brand || brand.title || brand.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-foreground truncate w-full">
                {brand.brand || brand.title || brand.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
