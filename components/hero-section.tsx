"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useSwipeable } from "react-swipeable"

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const slides = [
    {
      id: 1,
      title: "Smart Watch",
      subtitle: "Stay Connected, Stay Smart",
      image: "/pngtree-smart-electronic-apple-watches-vector-set-png-image_5155507.png",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: 2,
      title: "Premium phones",
      subtitle: "Explore the latest technology",
      image: "/pngimg.com - iphone16_PNG35.png",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      id: 3,
      title: "Gaming Consoles",
      subtitle: "Level up your gaming experience",
      image: "/pngimg.com - sony_playstation_PNG17546.png",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ]

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    trackMouse: true,
  })

  useEffect(() => setActiveSlide(0), [])

  useEffect(() => {
    if (isInteracting) return
    timeoutRef.current = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 10000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [activeSlide, isInteracting])

  const handleInteractionStart = () => setIsInteracting(true)
  const handleInteractionEnd = () => setIsInteracting(false)
  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const { title, subtitle, image, bgColor } = slides[activeSlide]

  return (
    <section
      {...swipeHandlers}
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      className={`mx-auto max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-screen-2xl 2xl:max-w-[1600px]
                  px-2 sm:px-6 md:px-8 rounded-2xl shadow-lg transition-all duration-500 
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
        {slides.map((_, index) => (
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
