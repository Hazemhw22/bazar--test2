"use client"

import Link from "next/link"
import Image from "next/image"

export function GiftSection() {
  return (
    <section className="py-6 px-4 sm:px-6 md:px-8">
      <div
        className="
          mx-auto max-w-screen-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl
          px-8 sm:px-6 md:px-8
          rounded-xl shadow-md border border-gray-300 dark:border-gray-600
          bg-pink-100 dark:bg-pink-900
          transition-colors duration-500
        "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center py-6 sm:py-8">
          {/* Text */}
          <div className="order-2 md:order-1 pl-2 transform transition-transform duration-300 hover:scale-105">
            <h2 className="text-lg sm:text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              When Words aren&apos;t Enough
            </h2>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">Say It with Gifts!</p>
            <Link
              href="/products/gifts"
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors text-xs sm:text-sm"
            >
              Shop Now
            </Link>
          </div>

          {/* Image */}
          <div className="order-1 md:order-2 flex justify-center transform transition-transform duration-300 hover:scale-105">
            <Image
              src="/pngtree-portrait-of-pretty-girl-holding-gift-box-in-hands-png-image_13968885.png?height=260&width=220"
              alt="Woman holding a gift"
              width={220}
              height={260}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
