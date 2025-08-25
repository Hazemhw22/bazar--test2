"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Category {
  id: number
  title: string
  icon?: string
}
 
export default function HomeCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const trackRef = useRef<HTMLDivElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("*")
      setCategories(data ?? [])
    }
    fetchCategories()
  }, [])

  // ⏩ Auto scroll desktop
  useEffect(() => {
    if (!categories.length) return
    startAuto()
    return stopAuto
  }, [categories])

  const startAuto = () => {
    stopAuto()
    intervalRef.current = setInterval(() => {
      scrollByOne("right")
    }, 4000)
  }
  const stopAuto = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const scrollByOne = (dir: "left" | "right") => {
    const el = trackRef.current
    if (!el) return
    const step = el.clientWidth / 4 // عرض ٤ عناصر في الهاتف
    if (dir === "left") {
      el.scrollBy({ left: -step, behavior: "smooth" })
    } else {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: step, behavior: "smooth" })
      }
    }
  }

  return (
    <section className="w-full bg-transparent">
      <div className="flex items-center justify-between mb-3 px-4">
        <h2 className="text-xl sm:text-2xl font-bold">Explore Popular Categories</h2>
        <Link href="/categories" className="text-blue-600 hover:underline text-sm">View All</Link>
      </div>

      {/* 🟢 الهاتف: سحب أفقي فقط على الشريط */}
      <div className="w-full flex justify-center sm:hidden">
        <div className="max-w-sm w-full flex gap-2 overflow-x-auto snap-x snap-mandatory px-2 pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <div key={cat.id} className="flex-[0_0_25%] snap-start rounded-xl flex flex-col items-center py-2">
              <div className="relative w-14 h-14 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                <span className="text-gray-400 text-[10px]">No Image</span>
              </div>
              <div className="text-center text-xs font-medium text-gray-100 mt-1">
                {cat.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🖥️ الديسكتوب: أسطر + أسهم + حركة */}
      <div className="hidden sm:relative sm:flex items-center">
        <button
          onClick={() => scrollByOne("left")}
          className="absolute -left-3 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div
          ref={trackRef}
          className="flex gap-3 overflow-x-auto no-scrollbar py-2"
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="min-w-[160px] rounded-xl bg-white dark:bg-gray-800 p-3 flex flex-col items-center"
            >
              <div className="relative w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-700 overflow-hidden">
                {cat.icon ? (
                  <Image src={cat.icon} alt={cat.title} fill sizes="80px" className="object-contain" />
                ) : (
                  <span className="text-gray-400 text-sm grid place-items-center w-full h-full">
                    No Image
                  </span>
                )}
              </div>
              <div className="text-center text-sm font-medium text-gray-800 dark:text-gray-100 mt-1">
                {cat.title}
              </div>
            </Link>
          ))}
        </div>
        <button
          onClick={() => scrollByOne("right")}
          className="absolute -right-3 z-10 p-2 bg-white dark:bg-gray-700 rounded-full shadow"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  )
}