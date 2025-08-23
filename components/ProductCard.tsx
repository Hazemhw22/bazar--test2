"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import * as Dialog from "@radix-ui/react-dialog"
import { Heart, Plus, Star, ShoppingBag, Eye } from "lucide-react"
import { useCart } from "./cart-provider"
import { useFavorites } from "./favourite-items"
import { supabase } from "@/lib/supabase"

interface Category {
  id: number
  desc: string
  title: string
}

interface ProductCardProps {
  product: {
    id: number
    created_at: string
    shop: number
    title: string
    desc: string
    price: number
    images: string[]
    category: number | null
    sale_price?: number | null
    discount_type?: "percentage" | "fixed" | null
    discount_value?: number | null
    discount_start?: string | null
    discount_end?: string | null
    active: boolean
    shops?: {
      shop_name: string
    }
    categories?: Category
    rating?: number
    reviews?: number
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const mainImage = product.images?.[0] || "/placeholder.svg"
  const discountedPrice = product.sale_price ?? product.price
  const discountPercentage =
    product.sale_price && product.price ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0

  const handleAddToCart = async () => {
    addItem({
      id: product.id,
      name: product.title,
      price: discountedPrice,
      image: mainImage,
      quantity,
    })
    setQuantity(1)
    await incrementProductCartCount(product.id.toString())
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite({
      id: product.id,
      name: product.title,
      price: product.price,
      discountedPrice: discountedPrice,
      image: mainImage,
      store: product.shops?.shop_name || "",
      inStock: true,
      rating: product.rating ?? 0,
      reviews: product.reviews ?? 0,
    })
  }

  // صور إضافية للمعاينة
  const additionalImages = product.images.length > 0 ? product.images : [mainImage]

  return (
    <>
      <div
        className="
          group relative bg-white dark:bg-gray-900 
          border border-gray-200 dark:border-gray-700 
          rounded-2xl overflow-hidden 
          shadow-sm hover:shadow-xl 
          transition-all duration-300 ease-out
          cursor-pointer
          w-full h-full
          hover:scale-[1.02] hover:-translate-y-1
        "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          {discountPercentage > 0 && (
            <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-base font-bold px-4 py-2 rounded-full shadow-lg">
              -{discountPercentage}%
            </div>
          )}

          <button
            onClick={handleToggleFavorite}
            className={`absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isFavorite(product.id)
                ? "bg-red-500 text-white shadow-lg scale-110"
                : "bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:scale-110"
            }`}
          >
            <Heart size={22} fill={isFavorite(product.id) ? "currentColor" : "none"} />
          </button>

          {/* Product Image */}
          <Image
            src={mainImage || "/placeholder.svg"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            priority
          />

          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-center justify-center gap-4 transition-all duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsModalOpen(true)
              }}
              className="p-4 bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-white rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            >
              <Eye size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart()
              }}
              className="p-4 bg-blue-600/95 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            >
              <ShoppingBag size={24} />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6 space-y-4 flex-1 flex flex-col">
          {/* Store Name */}
          <p className="text-base text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
            {product.shops?.shop_name || ""}
          </p>

          {/* Product Name */}
          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug text-xl flex-1">
            {product.title}
          </h3>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.round(product.rating ?? 0)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300 dark:text-gray-600"
                }
              />
            ))}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({product.reviews ?? 0})</span>
          </div>

          <div className="flex items-center justify-between pt-3 mt-auto">
            <div className="space-y-1">
              {product.price !== discountedPrice && (
                <p className="text-base text-gray-500 dark:text-gray-400 line-through">{product.price.toFixed(2)} ₪</p>
              )}
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{discountedPrice.toFixed(2)} ₪</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart()
              }}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
              title="إضافة للسلة"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Product Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-w-6xl w-[95vw] max-h-[90vh] overflow-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transform -translate-x-1/2 -translate-y-1/2 focus:outline-none border border-gray-200 dark:border-gray-700">
            <Dialog.Title className="sr-only">تفاصيل المنتج</Dialog.Title>
            <div className="grid md:grid-cols-2 gap-10 p-8">
              {/* Product Images */}
              <div className="space-y-6">
                {/* Main Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <Image src={mainImage || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
                </div>

                {/* Additional Images Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.title} - Image ${index + 2}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-8">
                <div>
                  <p className="text-base text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-3">
                    {product.shops?.shop_name || ""}
                  </p>
                  <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">{product.title}</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">{product.categories?.title || ""}</p>
                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={24}
                        className={
                          i < Math.round(product.rating ?? 0) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                        }
                        fill={i < Math.round(product.rating ?? 0) ? "currentColor" : "none"}
                      />
                    ))}
                    <span className="ml-3 text-gray-500 dark:text-gray-400 text-base">({product.reviews ?? 0})</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.desc || "لا يوجد وصف"}
                </p>

                {/* Price */}
                <div className="space-y-3">
                  {product.price !== discountedPrice && (
                    <p className="text-xl text-gray-500 dark:text-gray-400 line-through">₪{product.price.toFixed(2)}</p>
                  )}
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">₪{discountedPrice.toFixed(2)}</p>
                  {discountPercentage > 0 && (
                    <p className="text-lg text-green-600 dark:text-green-400 font-medium">
                      You save ₪{(product.price - discountedPrice).toFixed(2)} ({discountPercentage}% off)
                    </p>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-3 px-6 py-3 rounded-lg border text-lg ${
                    isFavorite(product.id)
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                  } transition-colors`}
                >
                  <Heart size={20} fill={isFavorite(product.id) ? "currentColor" : "none"} />
                  {isFavorite(product.id) ? "Remove from Favorites" : "Add to Favorites"}
                </button>

                {/* Quantity Selector */}
                <div className="flex items-center gap-6">
                  <span className="font-medium text-lg text-gray-900 dark:text-white">Quantity:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg"
                    >
                      -
                    </button>
                    <span className="px-6 py-3 font-medium min-w-[4rem] text-center text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-8 rounded-xl font-medium text-lg transition-colors flex items-center justify-center gap-3"
                  >
                    <ShoppingBag size={24} />
                    Add to Cart
                  </button>
                  <Link
                    href={`/products/${product.id}`}
                    className="px-8 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
            {/* Close Button */}
            <Dialog.Close className="absolute top-6 right-6 p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

// Supabase function to increment product cart count
async function incrementProductCartCount(productId: string) {
  const { data, error } = await supabase.from("products").select("cart_count").eq("id", productId).single()

  if (error || !data) return

  const newCount = (data.cart_count ?? 0) + 1

  await supabase.from("products").update({ cart_count: newCount }).eq("id", productId)
}
