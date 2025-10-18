"use client"

import Image from "next/image"
import Link from "next/link"
import { useI18n } from "../lib/i18n"

export interface AdBannerProps {
  imageSrc: string
  href?: string
  title?: string
  subtitle?: string
}

export default function AdBanner({ imageSrc, href = "/products", title, subtitle }: AdBannerProps) {
  const { t } = useI18n()
  return (
    <div className="col-span-2 md:col-span-4 mt-2 sm:mt-4">
      <Link
        href={href}
        className="block w-full overflow-hidden rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow hover:shadow-lg transition-shadow"
      >
        <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96">
          <Image
            src={imageSrc}
            alt={title || "Advertisement"}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover w-full h-full"
          />
          {(title || subtitle) && (
            // Anchor overlay panel to the left explicitly so it doesn't shift in RTL locales
            // Force LTR for this overlay so title/subtitle positions don't flip when document dir is RTL
            <div dir="ltr" className="absolute left-0 top-0 h-full bg-black/20 flex items-start justify-start py-8 w-full md:w-[60%]">
              <div className="px-4 sm:px-8 w-full text-left">
                {title && (
                  <div className="text-white text-lg sm:text-6xl font-bold drop-shadow mb-4">
                    {title}
                  </div>
                )}
                {subtitle && (
                  <div className="text-white/90 text-lg sm:text-4xl">
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


