"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
      title: "Premium Smartphones",
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

  useEffect(() => {
    setActiveSlide(0)
  }, [])

  useEffect(() => {
    if (isInteracting) return
    timeoutRef.current = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 10000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [activeSlide, isInteracting, slides.length])

  const handleInteractionStart = () => setIsInteracting(true)
  const handleInteractionEnd = () => setIsInteracting(false)
  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const { title, subtitle, image, bgColor } = slides[activeSlide]

  return (
    <section className=" ">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSlide}
          {...swipeHandlers}
          onMouseEnter={handleInteractionStart}
          onMouseLeave={handleInteractionEnd}
          onTouchStart={handleInteractionStart}
          onTouchEnd={handleInteractionEnd}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`mx-auto max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl 
                      px-2 sm:px-6 md:px-8 rounded-xl shadow-lg border transition-all duration-500 
                      ${bgColor} border-gray-300 dark:border-gray-600`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center py-4 sm:py-10">
            <div className="flex flex-col items-start text-gray-900 dark:text-gray-100">
              <motion.h1
                key={title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="text-xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-3"
              >
                {title}
              </motion.h1>

              <motion.p
                key={subtitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="text-sm sm:text-lg md:text-xl mb-4 sm:mb-5 text-gray-700 dark:text-gray-300"
              >
                {subtitle}
              </motion.p>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/products"
                  className="bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-md font-medium hover:bg-blue-700 transition-colors text-xs sm:text-base"
                >
                  Buy Now
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="flex justify-center md:justify-end"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.img
                key={image}
                src={image}
                alt={title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="h-40 sm:h-72 md:h-96 w-auto object-contain"
              />
            </motion.div>
          </div>

          <div className="flex justify-center mt-3 sm:mt-4 pb-3 sm:pb-4 gap-2">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveSlide(index)}
                animate={{ width: activeSlide === index ? 20 : 8 }}
                transition={{ duration: 0.3 }}
                className={`h-2 rounded-full ${
                  activeSlide === index ? "bg-blue-600 dark:bg-blue-400" : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
