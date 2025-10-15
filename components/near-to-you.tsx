"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Heart, Plus, Star, Eye } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/type";
import { useFavorites } from "./favourite-items";
import { useCart } from "./cart-provider";
import Image from "next/image";
import ProductFeaturesModal from "./ProductFeaturesModal";

export function NearToYou() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchNearbyProducts();
  }, []);

  const fetchNearbyProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now fetch latest active products (placeholder for proximity-based query)
      const { data, error: fetchError } = await supabase
        .from("products")
        .select(`
          id,
          title,
          price,
          sale_price,
          discount_type,
          discount_value,
          images,
          view_count,
          created_at
        `)
        .eq("active", true)
        .not("category", "in", "(18,56)")
        .order("created_at", { ascending: false })
        .limit(12);

      if (fetchError) {
        console.error("Supabase error:", fetchError.message);
        setError("Failed to fetch products.");
        return;
      }

      if (!data || data.length === 0) {
        setProducts([]);
        return;
      }

      const transformedProducts = data.map((product: any) => ({
        ...product,
        price: product.price || "0",
        images: product.images || [],
        view_count: product.view_count || 0,
      }));

      setProducts(transformedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Something went wrong while fetching products.");
    } finally {
      setLoading(false);
    }
  };

  const getDisplayPrice = (product: Product) => {
    if (product.sale_price && product.price) {
      const originalPrice = parseFloat(product.price as unknown as string);
      return product.sale_price < originalPrice ? product.sale_price : originalPrice;
    }
    return parseFloat((product.price as any) || "0");
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("near-to-you-container");
    if (container) {
      const scrollAmount = 300;
      const newScrollLeft = direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newScrollLeft, behavior: "smooth" });

      setTimeout(() => {
        if (container) {
          setShowLeftArrow(container.scrollLeft > 0);
          setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
        }
      }, 300);
    }
  };

  const checkScrollPosition = () => {
    const container = document.getElementById("near-to-you-container");
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
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
          <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Near To You</h2>
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">◎</span>
          </div>
        </div>
        <Link href="/products" className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
          View All <ChevronRight className="h-4 w-4 ml-1" />
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
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No products available</div>
      ) : (
        <div className="relative">
          {showLeftArrow && (
            <button onClick={() => handleScroll("left")} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/90 dark:bg-black/60 shadow-md" aria-label="Previous">
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          {showRightArrow && (
            <button onClick={() => handleScroll("right")} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-white/90 dark:bg-black/60 shadow-md" aria-label="Next">
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          <div id="near-to-you-container" className="flex gap-2 overflow-x-auto snap-x snap-mandatory py-1 px-1">
            {products.map((product) => (
              <div key={product.id} className="snap-center flex-shrink-0 w-44 sm:w-48 md:w-52">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-1 border border-gray-100 dark:border-gray-700 flex flex-col h-full">
                  <div className="relative mb-3 pt-[100%]">
                    <Link href={`/products/${product.id}`}>
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-md">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full transition-transform hover:scale-105" />
                        ) : (
                          <div className="bg-gray-200 dark:bg-gray-700 w-full h-full flex items-center justify-center"><span className="text-gray-500 dark:text-gray-400">No image</span></div>
                        )}
                      </div>
                    </Link>

                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <button onClick={() => toggleFavorite({
                        id: Number(product.id),
                        name: product.title,
                        price: getDisplayPrice(product),
                        discountedPrice: product.sale_price ?? getDisplayPrice(product),
                        image: (product.images && product.images[0]) || "/placeholder.svg",
                        store: "",
                        rating: 0,
                        reviews: 0,
                      })} className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Heart size={14} className={isFavorite(Number(product.id)) ? "fill-red-500 text-red-500" : "text-gray-500 dark:text-gray-400"} />
                      </button>
                      <button onClick={() => setQuickViewProduct(product)} className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Eye size={14} className="text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/products/${product.id}`} className="flex-grow">
                    <h3 className="font-medium text-xs mb-1 line-clamp-2 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{product.title}</h3>
                  </Link>

                  <div className="flex items-center mb-1">
                    <div className="flex items-center gap-1"><Eye size={14} /><span className="ml-1 text-xs text-gray-600 dark:text-gray-400">Views</span></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({product.view_count || 0})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">{getDisplayPrice(product).toFixed(2)} ₪</span>
                    </div>
                    <button onClick={() => addItem({ id: Number(product.id), name: product.title, price: getDisplayPrice(product), image: (product.images && product.images[0]) || "/placeholder.svg" })} className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full transition-colors"><Plus size={14} /></button>
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
