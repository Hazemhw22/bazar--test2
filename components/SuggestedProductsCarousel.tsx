"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useSwipeable } from "react-swipeable"
import SuggestedProductCard from "./SuggestedProductCard"

type SuggestedProduct = {
  id: number
  name: string
  price: number
  discountedPrice: number
  rating: number
  reviews: number
  image: string
  store?: string
  category?: string
  description?: string
}

interface SuggestedProductsCarouselProps {
  products?: SuggestedProduct[]
  title?: string
}

export default function SuggestedProductsCarousel({
  products = [],
  title = "You might also like",
}: SuggestedProductsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Calculate how many products are visible at once
  const getVisibleCount = () => {
    if (typeof window === "undefined") return 4
    const width = window.innerWidth
    if (width < 640) return 2 // Mobile: 2 products
    if (width < 1024) return 3 // Tablet: 3 products
    return 4 // Desktop: 4 products
  }

  const [visibleCount, setVisibleCount] = useState(getVisibleCount())

  useEffect(() => {
    const handleResize = () => {
      setVisibleCount(getVisibleCount())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const maxIndex = Math.max(0, products.length - visibleCount)
  const canGoNext = currentIndex < maxIndex
  const canGoPrev = currentIndex > 0

  const goToNext = () => {
    if (canGoNext && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const goToPrev = () => {
    if (canGoPrev && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex((prev) => Math.max(prev - 1, 0))
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  const goToSlide = (index: number) => {
    if (index !== currentIndex && !isTransitioning) {
      setIsTransitioning(true)
      setCurrentIndex(Math.max(0, Math.min(index, maxIndex)))
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrev,
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 10,
  })

  // Auto-scroll functionality (optional)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)

  useEffect(() => {
    if (!isAutoScrolling) return

    const interval = setInterval(() => {
      if (currentIndex >= maxIndex) {
        setCurrentIndex(0)
      } else {
        goToNext()
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [currentIndex, maxIndex, isAutoScrolling])

  const cardWidth = 192 + 16 // 192px card width + 16px gap
  const translateX = -currentIndex * cardWidth

  // Don't render if no products
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      {/* Header with title and controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={goToPrev}
            disabled={!canGoPrev || isTransitioning}
            className={`p-2 rounded-full border transition-all duration-200 ${
              canGoPrev && !isTransitioning
                ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                : "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
            aria-label="Previous products"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToNext}
            disabled={!canGoNext || isTransitioning}
            className={`p-2 rounded-full border transition-all duration-200 ${
              canGoNext && !isTransitioning
                ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                : "bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            }`}
            aria-label="Next products"
          >
            <ChevronRight size={20} />
          </button>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`ml-2 px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
              isAutoScrolling
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {isAutoScrolling ? "Auto ⏸" : "Auto ▶"}
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Mobile Navigation Arrows */}
        {canGoPrev && (
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full border border-gray-200 dark:border-gray-700 md:hidden"
            aria-label="Previous products"
          >
            <ChevronLeft size={16} />
          </button>
        )}

        {canGoNext && (
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full border border-gray-200 dark:border-gray-700 md:hidden"
            aria-label="Next products"
          >
            <ChevronRight size={16} />
          </button>
        )}

        {/* Products Container */}
        <div className="overflow-hidden" {...swipeHandlers}>
          <div
            ref={scrollContainerRef}
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${translateX}px)`,
              width: `${products.length * cardWidth}px`,
            }}
          >
            {products.map((product) => (
              <SuggestedProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        {maxIndex > 0 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-blue-600 dark:bg-blue-400 w-6"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Product Counter */}
        <div className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
          Showing {Math.min(currentIndex + visibleCount, products.length)} of {products.length} products
        </div>
      </div>

      {/* Touch Instructions (Mobile) */}
      <div className="md:hidden text-center mt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">👈 Swipe left or right to see more products 👉</p>
      </div>
    </div>
  )
}
