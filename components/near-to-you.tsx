"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Heart, Plus, Star, Eye } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getProducts } from "@/lib/actions/products";
import { Product } from "@/lib/types";
import { normalizeProduct } from "@/lib/normalizers";
import { useFavorites } from "./favourite-items";
import { useCart } from "./cart-provider";
import Image from "next/image";
import { useI18n } from "../lib/i18n";
import ProductFeaturesModal from "./ProductFeaturesModal";

export function NearToYou() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const { t, direction } = useI18n();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchNearbyProducts();
  }, []);

  const fetchNearbyProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use server action to bypass RLS
      const prods = await getProducts({ limit: 12, orderBy: { column: "created_at", ascending: false } });
      setProducts(prods || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Something went wrong while fetching products.");
    } finally {
      setLoading(false);
    }
  };

  const getDisplayPrice = (product: Product): number => {
    const priceNum = Number(product.price ?? 0);
    const saleNum = Number(product.sale_price ?? 0);
    if (saleNum && priceNum) {
      return saleNum < priceNum ? saleNum : priceNum;
    }
    return priceNum;
  };

  const handleScroll = (dir: "left" | "right") => {
    const container = document.getElementById("near-to-you-container");
    if (container) {
      const scrollAmount = 300;
      const logicalAmount = dir === "right" ? scrollAmount : -scrollAmount;
      const multiplier = direction === "rtl" ? -1 : 1;
      const newScrollLeft = container.scrollLeft + logicalAmount * multiplier;
      container.scrollTo({ left: newScrollLeft, behavior: "smooth" });

      setTimeout(() => {
        if (container) {
          if (direction === "rtl") {
            setShowLeftArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
            setShowRightArrow(container.scrollLeft > 0);
          } else {
            setShowLeftArrow(container.scrollLeft > 0);
            setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
          }
        }
      }, 300);
    }
  };

  const checkScrollPosition = () => {
    const container = document.getElementById("near-to-you-container");
    if (container) {
      if (direction === "rtl") {
        setShowLeftArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
        setShowRightArrow(container.scrollLeft > 0);
      } else {
        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
      }
    }
  };

  useEffect(() => {
    const container = document.getElementById("near-to-you-container");
    checkScrollPosition();
    if (container) container.addEventListener("scroll", checkScrollPosition);
    window.addEventListener("resize", checkScrollPosition);
    return () => {
      if (container) container.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [products]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">{t("near.title")}</h2>
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">◎</span>
          </div>
        </div>
          <Link href="/products" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
            {t("common.viewAll")} <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
      </div>

      {loading ? (
        <div className="flex gap-2 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 sm:w-48 md:w-52">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{t("near.fetchError", { message: error })}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-4">{t("near.noProducts")}</div>
      ) : (
        <div className="relative">
            {showLeftArrow && (
              <button
                onClick={() => handleScroll("left")}
                className={`absolute ${direction === "rtl" ? "right-2" : "left-2"} top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/90 dark:bg-black/60 shadow-md`}
                aria-label={t("common.prev")}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {showRightArrow && (
              <button
                onClick={() => handleScroll("right")}
                className={`absolute ${direction === "rtl" ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/90 dark:bg-black/60 shadow-md`}
                aria-label={t("common.next")}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

          <div id="near-to-you-container" dir={direction === "rtl" ? "rtl" : "ltr"} className="flex gap-2 overflow-x-auto snap-x snap-mandatory py-1 px-1">
            {products.map((product) => (
              <div key={product.id} className="snap-center flex-shrink-0 w-44 sm:w-48 md:w-52">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-1 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                  <div className="relative mb-3 pt-[100%]">
                    <Link href={`/products/${product.id}`}>
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-md">
                        {(product.image_url || (product.images && product.images.length > 0)) ? (
                          <img src={String(product.image_url ?? product.images?.[0])} alt={String(product.name ?? product.name ?? "")} className="object-cover w-full h-full transition-transform hover:scale-105" />
                        ) : (
                          <div className="bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center"><span className="text-gray-500 dark:text-gray-400">No image</span></div>
                        )}
                      </div>
                    </Link>

                    <div className={`absolute top-2 ${direction === "rtl" ? "left-2" : "right-2"} flex flex-col gap-1`}>
                      <button onClick={() => toggleFavorite({
                        id: Number(product.id),
                        name: String(product.name ?? product.name ?? ""),
                        price: getDisplayPrice(product),
                        discountedPrice: Number(product.sale_price ?? getDisplayPrice(product)),
                        image: String(product.image_url ?? product.images?.[0] ?? "/placeholder.svg"),
                        store: "",
                        rating: 0,
                        reviews: 0,
                      })} className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Heart size={14} className={isFavorite(Number(product.id)) ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-400"} aria-hidden />
                      </button>
                      <button onClick={() => setQuickViewProduct(product)} className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Eye size={14} className="text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/products/${product.id}`} className="flex-grow">
                    <h3 className="font-medium text-xs mb-1 line-clamp-2 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{String( product.name ?? "")}</h3>
                  </Link>

                    <div className="flex items-center mb-1">
                    <div className="flex items-center gap-1"><Eye size={14} /><span className="ml-1 text-xs text-gray-600 dark:text-gray-400">{t("near.views")}</span></div>
                    {/* <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({Number(product.view_count || 0)})</span> */}
                  </div>

                    <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">{t("currency.symbol")}{Number(getDisplayPrice(product)).toFixed(2)}</span>
                    </div>
                    <button onClick={() => addItem({ id: Number(product.id), name: String( product.name ??""), price: getDisplayPrice(product), image: String(product.image_url ?? product.images?.[0] ?? "/placeholder.svg") })} className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full transition-colors"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {quickViewProduct && (
        <ProductFeaturesModal product={quickViewProduct} isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </div>
  );
}
