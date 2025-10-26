"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import SuggestedProductCard from "@/components/SuggestedProductCard";
import type { Product } from "../lib/types";

interface SimilarProductsCarouselProps {
  products: Product[];
}

export default function SimilarProductsCarousel({ products }: SimilarProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const updateVisibleCount = () => {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    if (width < 400) setVisibleCount(1);
    else if (width < 640) setVisibleCount(2);
    else if (width < 1024) setVisibleCount(3);
    else setVisibleCount(4);
  };

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, products.length - visibleCount);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  const goNext = () => {
    if (!isTransitioning && canGoNext) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goPrev = () => {
    if (!isTransitioning && canGoPrev) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goNext,
    onSwipedRight: goPrev,
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="mt-6">
  <h2 className="text-xl font-semibold mb-4">Similar Products</h2>

      <div className="relative">
        {/* Desktop Arrows */}
        {canGoPrev && (
          <button
            onClick={goPrev}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {canGoNext && (
          <button
            onClick={goNext}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-200 dark:border-gray-700"
          >
            <ChevronRight size={20} />
          </button>
        )}

        <div className="overflow-x-auto scrollbar-hide" {...swipeHandlers}>
          <div
            className="flex gap-3 transition-transform duration-300"
            style={{
              transform: `translateX(-${(currentIndex * 100) / visibleCount}%)`,
              width: `${(products.length * 100) / visibleCount}%`,
            }}
          >
            {products.map((p) => (
              <div
                key={p.id}
                className={`flex-shrink-0 w-[80%] xs:w-[calc(50%-0.5rem)] sm:w-[calc(33.33%-0.66rem)] md:w-[calc(25%-0.75rem)]`}
              >
                <SuggestedProductCard
                  product={{
                    id: Number(p.id),
                    name: String((p as any).name ?? (p as any).title ?? ""),
                    price: Number(p.price),
                    discountedPrice: Number(p.sale_price ?? p.price),
                    rating: Number((p as any).rating ?? 0),
                    reviews: Number((p as any).reviews ?? 0),
                    image: String(p.images?.[0] ?? ""),
                    store: (p.shops as any)?.name ?? (p.shops as any)?.shop_name ?? "",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {maxIndex > 0 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentIndex ? "bg-blue-600 dark:bg-blue-400 w-6" : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Swipe hint */}
      <div className="md:hidden text-center mt-2 text-xs text-gray-500 dark:text-gray-400">
  👈 Swipe left or right for more products 👉
      </div>
    </div>
  );
}
