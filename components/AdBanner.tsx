"use client"

import Image from "next/image"
import Link from "next/link"

export interface AdBannerProps {
  imageSrc: string
  href?: string
  title?: string
  subtitle?: string
}

export default function AdBanner({ imageSrc, href = "/products", title, subtitle }: AdBannerProps) {
  return (
    <div className="col-span-2 md:col-span-4">
      <Link
        href={href}
        className="block w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-shadow"
      >
       <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96">
          <Image
            src={imageSrc}
            alt={title || "Advertisement"}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover w-full "
          />
          {(title || subtitle) && (
            <div className="absolute inset-0 bg-black/20 flex py-8">
              <div className="px-4 sm:px-8">
                {title && (
                  <div className="text-white text-lg sm:text-6xl font-bold drop-shadow mb-4">
                    {title}
                  </div>
                )}
                {subtitle && (
                  <div className="text-white/90 text-lg sm:text-4xl ">
                    {subtitle}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}


