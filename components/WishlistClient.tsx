"use client"

import { useFavorites } from "@/components/favourite-items"
import { useCart } from "@/components/cart-provider"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, Trash2, Eye, Star } from "lucide-react"

interface WishlistClientProps {
  favorites: any[]
}

export default function WishlistClient({ favorites }: WishlistClientProps) {
  const { removeFromFavorites } = useFavorites()
  const { addItem } = useCart()

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.discountedPrice,
      image: item.image,
      quantity: 1,
    })
  }

  if (favorites.length === 0)
    return (
      <div className="text-center py-12">
        <Heart size={48} className="mx-auto text-gray-400 mb-4" />
        <p>No favorites yet</p>
      </div>
    )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((item) => (
        <div key={item.id} className="group bg-white dark:bg-gray-800 border rounded-xl overflow-hidden shadow-sm">
          <div className="relative aspect-square">
            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-3 right-3 h-8 w-8 p-0"
              onClick={() => removeFromFavorites(item.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          <div className="p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => handleAddToCart(item)}>
                <ShoppingBag size={16} /> Add to Cart
              </Button>
              <Button variant="outline" size="sm">
                <Eye size={16} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
