"use client"

import Link from "next/link"
import Image from "next/image"

interface CategoryItem {
  title: string
  image: string
  href: string
}

const DEFAULTS: CategoryItem[] = [
  { title: "Health & Beauty", image: "/pngtree-portrait-of-pretty-girl-holding-gift-box-in-hands-png-image_13968885.png", href: "/categories" },
  { title: "Groceries", image: "/pazar.png", href: "/categories" },
  { title: "Sneakers", image: "/pngimg.com - sony_playstation_PNG17546.png", href: "/categories" },
  { title: "Phone", image: "/pngimg.com - iphone16_PNG35.png", href: "/categories" },
  { title: "Sports", image: "/Huawei-Logo.jpg", href: "/categories" },
  { title: "School & Office", image: "/logo.svg", href: "/categories" },
  { title: "Shoe", image: "/KFC_logo.svg.png", href: "/categories" },
]

export default function HomeCategories({ items = DEFAULTS }: { items?: CategoryItem[] }) {
  return (
    <section className="px-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl sm:text-2xl font-bold">Explore Popular Categories</h2>
        <Link href="/categories" className="text-blue-600 hover:underline text-sm">View All</Link>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
        {items.map((cat) => (
          <Link
            key={cat.title}
            href={cat.href}
            className="group rounded-xl bg-white dark:bg-gray-800  p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
          >
            <div className="relative w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-700 overflow-hidden">
              <Image src={cat.image} alt={cat.title} fill sizes="80px" className="object-contain" />
            </div>
            <div className="text-center text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-100">
              {cat.title}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}


