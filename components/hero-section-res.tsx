"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import type { Product } from "@/lib/type"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSwipeable } from "react-swipeable"

export function HeroSectionRes() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // slide shape used internally
  type Slide = { id: string; title: string; subtitle?: string; image: string; bgColor?: string }

  const [slides, setSlides] = useState<Slide[]>([])

  // fallback static slides (used when no products available)
  const fallbackSlides: Slide[] = [
    {
      id: "1",
      title: "Smart Watch",
      subtitle: "Stay Connected, Stay Smart",
      image: "/pngtree-smart-electronic-apple-watches-vector-set-png-image_5155507.png",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: "2",
      title: "Premium phones",
      subtitle: "Explore the latest technology",
      image: "/pngimg.com - iphone16_PNG35.png",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      id: "3",
      title: "Gaming Consoles",
      subtitle: "Level up your gaming experience",
      image: "/pngimg.com - sony_playstation_PNG17546.png",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ]

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const CATEGORY_SHOP_ID = 15
        const { data: catsById } = await supabase.from("categories_shop").select("*").eq("id", CATEGORY_SHOP_ID)
        const { data: catsByTitle } = await supabase.from("categories_shop").select("*").eq("title", "מסעדות")
        const catsCombined = Array.from(new Map([...(catsById || []), ...(catsByTitle || [])].map((c: any) => [c.id, c])).values())
        const categoryIds = (catsCombined || []).map((c: any) => c.id)

        if (categoryIds.length === 0) {
          if (mounted) setSlides(fallbackSlides)
          return
        }

        // fetch shops for those category ids
        const { data: shops } = await supabase.from("shops").select("id").in("category_shop_id", categoryIds)
        const shopIds = (shops || []).map((s: any) => String(s.id))

        // fetch products either by shop or by category
        const prods: Product[] = []
        if (shopIds.length > 0) {
          const { data: p1 } = await supabase.from("products").select("id,title,price,images,shop,category").in("shop", shopIds).eq("active", true).order("created_at", { ascending: false })
          if (p1) prods.push(...(p1 as Product[]))
        }
        const { data: p2 } = await supabase.from("products").select("id,title,price,images,shop,category").in("category", categoryIds).eq("active", true).order("created_at", { ascending: false })
        if (p2) prods.push(...(p2 as Product[]))

        // dedupe by id and map to slides
        const map = new Map<string, Product>()
        for (const p of prods) map.set(String((p as any).id), p)
        const merged = Array.from(map.values())
        const mapped: Slide[] = merged.slice(0, 10).map((p) => ({
          id: String((p as any).id),
          title: p.title || "",
          subtitle: p.price ? String((p as any).price) + "₪" : undefined,
          image: Array.isArray((p as any).images) && (p as any).images[0] ? (p as any).images[0] : "/placeholder.svg",
        }))

        if (mounted) setSlides(mapped.length > 0 ? mapped : fallbackSlides)
      } catch (err) {
        console.error(err)
        if (mounted) setSlides(fallbackSlides)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    trackMouse: true,
  })

  useEffect(() => setActiveSlide(0), [])

  useEffect(() => {
    if (isInteracting) return
    const len = slides.length > 0 ? slides.length : fallbackSlides.length
    timeoutRef.current = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % len)
    }, 10000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [activeSlide, isInteracting, slides.length])

  const handleInteractionStart = () => setIsInteracting(true)
  const handleInteractionEnd = () => setIsInteracting(false)
  const nextSlide = () => {
    const len = slides.length > 0 ? slides.length : fallbackSlides.length
    setActiveSlide((prev) => (prev + 1) % len)
  }
  const prevSlide = () => {
    const len = slides.length > 0 ? slides.length : fallbackSlides.length
    setActiveSlide((prev) => (prev - 1 + len) % len)
  }

  const effectiveSlides = slides.length > 0 ? slides : fallbackSlides
  const displayedIndex = effectiveSlides.length > 0 ? activeSlide % effectiveSlides.length : 0
  const currentSlide = effectiveSlides[displayedIndex]
  const { title, subtitle, image, bgColor } = currentSlide

  return (
    <section
      {...swipeHandlers}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      className={`mx-auto max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-screen-2xl 2xl:max-w-[1600px]
                  px-1 sm:px-3 md:px-3 rounded-2xl shadow-lg transition-all duration-500 
                  bg-card`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center py-4 sm:py-10">
        {/* النص */}
        <motion.div
          key={title} // يجعل النص يتغير مع الشرائح
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1"
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3">{title}</h1>
          <p className="text-sm sm:text-lg md:text-xl mb-4 sm:mb-5 text-muted-foreground">{subtitle}</p>
          <Link
            href="/products"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            Buy Now
          </Link>
        </motion.div>

        {/* الصورة */}
        <motion.div
          key={image} // تجعل الصورة تتغير مع الشرائح
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center md:justify-end order-1 md:order-2"
        >
          <img src={image} alt={title} className="h-40 sm:h-72 md:h-96 w-auto object-contain" />
        </motion.div>
      </div>

      {/* النقاط */}
      <div className="flex justify-center mt-3 sm:mt-4 pb-3 sm:pb-4 gap-2">
        {effectiveSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              displayedIndex === index ? "bg-primary w-5" : "bg-muted-foreground/30 w-2"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
