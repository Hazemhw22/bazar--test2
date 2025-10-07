"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSwipeable } from "react-swipeable"
import { supabase } from "../lib/supabase"

export function HeroSales() {
  const [products, setProducts] = useState<any[]>([])
  const [activeSlide, setActiveSlide] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 🟢 جلب البيانات الحقيقية من Supabase
  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        // Fetch products that are on sale (avoid complex join filters)
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, title, price, sale_price, onsale, images, shop")
          .eq("onsale", true)
          .order("created_at", { ascending: false })
          .limit(50) // fetch extra so we can filter out unwanted shops and still have results

        if (productsError) throw productsError
        if (!mounted) return

        // Fetch shops that belong to category_shop_id = 15 (we want to exclude products from these shops)
        const { data: excludedShops, error: shopsError } = await supabase
          .from("shops")
          .select("id, shop_name, category_shop_id")
          .eq("category_shop_id", 15)

        if (shopsError) throw shopsError
        if (!mounted) return

        // Coerce ids to strings to avoid number/string mismatch
        const excludedIds = new Set((excludedShops ?? []).map((s: any) => String(s.id)))
        const shopNameMap: Record<string, string> = {}
        ;(excludedShops ?? []).forEach((s: any) => {
          shopNameMap[String(s.id)] = s.shop_name
        })

        // Debug logs to inspect shapes at runtime
        console.debug("hero-sales: fetched products count:", (productsData ?? []).length)
        console.debug("hero-sales: excluded shops:", excludedShops)

        // Filter out products that belong to excluded shops (compare as strings)
        const filtered = (productsData ?? []).filter((p: any) => !excludedIds.has(String(p.shop)))

        // Debug filtered counts
        console.debug("hero-sales: filtered products count:", filtered.length)

        // If still no products, we can fall back to the original unfiltered list (optional)
        const finalProducts = filtered.length > 0 ? filtered.slice(0, 4) : (productsData ?? []).slice(0, 4)

        const mapped = finalProducts.map((p: any) => {
          const displayPrice = p.onsale && p.sale_price ? p.sale_price : p.price
          return {
            id: p.id,
            title: p.title || "Untitled",
            subtitle: `₪${displayPrice ?? "0"} ${
              shopNameMap[String(p.shop)] ? "- " + shopNameMap[String(p.shop)] : ""
            }`,
            image: p.images && p.images.length > 0 ? p.images[0] : "/placeholder.svg",
          }
        })

        setProducts(mapped)
      } catch (err) {
        console.error("❌ فشل تحميل المنتجات:", err)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  // 🌀 التنقل التلقائي بين السلايدات
  useEffect(() => {
    if (isInteracting) return
    if (products.length === 0) return

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % products.length)
    }, 8000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [activeSlide, isInteracting, products.length])

  const handleInteractionStart = () => setIsInteracting(true)
  const handleInteractionEnd = () => setIsInteracting(false)
  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % products.length)
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + products.length) % products.length)

  const swipeHandlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  })

  const current = products[activeSlide]

  // ⛔ لا توجد بيانات
  if (products.length === 0) {
    return (
      <section className="flex justify-center items-center h-64 bg-card rounded-2xl shadow-lg">
        <p className="text-muted-foreground">لا توجد منتجات حالياً</p>
      </section>
    )
  }

  return (
    <section
      {...swipeHandlers}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      className="mx-auto max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-screen-2xl 2xl:max-w-[1600px]
                 px-1 sm:px-3 md:px-3 rounded-2xl shadow-lg transition-all duration-500 bg-card"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center py-4 sm:py-10">
        <motion.div
          key={current?.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1"
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3">{current?.title}</h1>
          <p className="text-sm sm:text-lg md:text-xl mb-4 sm:mb-5 text-muted-foreground">{current?.subtitle}</p>
          <Link
            href={`/products/${current.id}`}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            Pay Now          
          </Link>
        </motion.div>

        <motion.div
          key={current?.image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center md:justify-end order-1 md:order-2"
        >
          <img
            src={current?.image}
            alt={current?.title}
            className="h-40 sm:h-72 md:h-96 w-auto object-contain"
          />
        </motion.div>
      </div>

      <div className="flex justify-center mt-3 sm:mt-4 pb-3 sm:pb-4 gap-2">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeSlide === index ? "bg-primary w-5" : "bg-muted-foreground/30 w-2"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
