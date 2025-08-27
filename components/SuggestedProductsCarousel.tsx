"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import SuggestedProductCard from "./SuggestedProductCard";

type SuggestedProduct = {
  id: number;
  name: string;
  price: number;
  discountedPrice: number;
  rating: number;
  reviews: number;
  image: string;
  store?: string;
  category?: string;
  description?: string;
};

interface SuggestedProductsCarouselProps {
  products?: SuggestedProduct[];
  title?: string;
}

export default function SuggestedProductsCarousel({
  products = [],
  title = "منتجات مشابهة",
}: SuggestedProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getVisibleCount = () => {
    if (typeof window === "undefined") return 4;
    const width = window.innerWidth;
    if (width < 400) return 1; // Very small phones
    if (width < 640) return 2; // Mobile
    if (width < 1024) return 3; // Tablet
    return 4; // Desktop
  };

  useEffect(() => {
    setVisibleCount(getVisibleCount());
    const handleResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - visibleCount);
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  const goToNext = () => {
    if (canGoNext) setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const goToPrev = () => {
    if (canGoPrev) setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, maxIndex)));
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrev,
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 10,
  });

  if (!products || products.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <div className="hidden md:flex gap-2">
          <button onClick={goToPrev} disabled={!canGoPrev} className="p-2 rounded-full border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToNext} disabled={!canGoNext} className="p-2 rounded-full border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        {canGoPrev && (
          <button onClick={goToPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full border border-gray-200 dark:border-gray-700 md:hidden">
            <ChevronLeft size={16} />
          </button>
        )}
        {canGoNext && (
          <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full border border-gray-200 dark:border-gray-700 md:hidden">
            <ChevronRight size={16} />
          </button>
        )}

        <div className="overflow-x-auto scrollbar-hide" {...swipeHandlers}>
          <div className="flex gap-4 w-max transition-transform duration-300" style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}>
            {products.map(product => (
              <div key={product.id} className={`flex-shrink-0 w-[calc(100%/${visibleCount}-1rem)]`}>
                <SuggestedProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {maxIndex > 0 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button key={index} onClick={() => goToSlide(index)} className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex ? "bg-blue-600 dark:bg-blue-400 w-6" : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"}`} />
            ))}
          </div>
        )}
      </div>

      <div className="md:hidden text-center mt-4 text-xs text-gray-500 dark:text-gray-400">
        👈 اسحب لليسار أو اليمين لمزيد من المنتجات 👉
      </div>
    </div>
  );
}
