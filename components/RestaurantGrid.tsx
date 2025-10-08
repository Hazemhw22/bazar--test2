"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, Heart } from "lucide-react"
import type { Shop } from "@/lib/type"

interface Props {
  shops: Shop[]
}

export default function RestaurantGrid({ shops }: Props) {
  if (!shops || shops.length === 0) return null

  // Only show shops that belong to category_shop_id = 15 (safety filter)
  const restaurants = shops.filter((s: any) => Number(s.category_shop_id) === 15)
  if (restaurants.length === 0) return null

  const palette = [
    { bg: "bg-rose-50", text: "text-rose-700" },
    { bg: "bg-amber-50", text: "text-amber-700" },
    { bg: "bg-emerald-50", text: "text-emerald-700" },
    { bg: "bg-cyan-50", text: "text-cyan-700" },
    { bg: "bg-violet-50", text: "text-violet-700" },
    { bg: "bg-pink-50", text: "text-pink-700" },
  ]

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Resturants</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((s, idx) => {
          const color = palette[idx % palette.length]
          return (
            <Link
              key={s.id}
              href={`/shops/${s.id}`}
              className="block rounded-2xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="rounded-2xl overflow-hidden">
                <div className={`${color.bg} relative h-28`}> 
                  {/* overlapping image */}
                  <div className="absolute left-4 top-4 w-20 h-20 rounded-full overflow-hidden border-white shadow-sm ">
                    <Image src={(s.logo_url as string) || "/placeholder.svg"} alt={s.shop_name} fill className="object-cover" />
                  </div>

                  {/* heart button top-right */}
                  <div className="absolute right-4 top-4">
                    <button aria-label="favorite" className="w-8 h-8 rounded-full  flex items-center justify-center ">
                      <Heart className="h-4 w-4 text-rose-500" />
                    </button>
                  </div>

                  {/* title placed next to the image */}
                  <div className="h-full flex items-center pl-28 pr-4">
                    <div className="text-left">
                      <h3 className={`${color.text} font-semibold text-lg leading-tight`}>{s.shop_name}</h3>
                      {s.desc && <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 text-white p-4 pt-6">
                  <div className="text-sm font-semibold">{s.shop_name}</div>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">{s.address}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-green-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-300" />
                      <span className="text-xs">HURA</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-green-300" />
                      <span className="text-xs">30-40 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
