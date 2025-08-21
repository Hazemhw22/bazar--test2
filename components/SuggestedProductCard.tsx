"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import * as Dialog from "@radix-ui/react-dialog"
import { Heart, Plus, Star, ShoppingBag, Eye, Minus } from "lucide-react"
import { useCart } from "./cart-provider"
import { useFavorites } from "./favourite-items"
import { Button } from "./ui/button"

type SuggestedProduct = {
  id: number
  name: string
  price: number
  discountedPrice: number
  rating: number
  reviews: number
  image: string
  store?: string
  category?: string
  description?: string
}

interface SuggestedProductCardProps {
  product: SuggestedProduct
}

const SuggestedProductCard = ({ product }: SuggestedProductCardProps) => {
  const [quantity, setQuantity] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.discountedPrice,
      image: product.image,
      quantity,
    })
    setQuantity(1)
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discountedPrice,
      image: product.image,
      store: product.store || "Unknown Store",
      rating: product.rating,
      reviews: product.reviews,
      inStock: true,
    })
  }

  const discountPercentage = Math.round(((product.price - product.discountedPrice) / product.price) * 100)

  return (
    <>
      <div
        className="flex-none w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div className="relative h-32 bg-gray-50 dark:bg-gray-900 overflow-hidden">
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
              -{discountPercentage}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isFavorite(product.id)
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
            }`}
          >
            <Heart size={12} fill={isFavorite(product.id) ? "currentColor" : "none"} />
          </button>

          {/* Product Image */}
          <Image
            src={product.image || "/placeholder.svg?height=128&width=128"}
            alt={product.name}
            fill
            className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
          />

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-black/20 flex items-center justify-center gap-1 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsModalOpen(true)
              }}
              className="p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Eye size={14} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3">
          {/* Store Name */}
          {product.store && (
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-1">
              {product.store}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }
              />
            ))}
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({product.rating})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              {product.price !== product.discountedPrice && (
                <span className="text-xs text-gray-500 dark:text-gray-400 line-through">${product.price}</span>
              )}
              <p className="font-bold text-sm text-gray-900 dark:text-white">${product.discountedPrice}</p>
            </div>

            {/* Quick Add Button */}
            <Button
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation()
                handleAddToCart()
              }}
            >
              <Plus size={12} className="mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Product Quick View Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-w-3xl w-[90vw] max-h-[85vh] overflow-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transform -translate-x-1/2 -translate-y-1/2 focus:outline-none border border-gray-200 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Product Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                <Image
                  src={product.image || "/placeholder.svg?height=400&width=400"}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                <div>
                  {product.store && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-2">
                      {product.store}
                    </p>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{product.category || "Electronics"}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {product.rating}.0 ({product.reviews || 42} reviews)
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description ||
                    "Experience premium quality with this exceptional product. Crafted with attention to detail and designed for modern lifestyles, this item combines functionality with style to deliver outstanding value."}
                </p>

                {/* Price */}
                <div className="space-y-2">
                  {product.price !== product.discountedPrice && (
                    <p className="text-lg text-gray-500 dark:text-gray-400 line-through">${product.price.toFixed(2)}</p>
                  )}
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${product.discountedPrice.toFixed(2)}
                  </p>
                  {discountPercentage > 0 && (
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      You save ${(product.price - product.discountedPrice).toFixed(2)} ({discountPercentage}% off)
                    </p>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                    isFavorite(product.id)
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                  } transition-colors`}
                >
                  <Heart size={16} fill={isFavorite(product.id) ? "currentColor" : "none"} />
                  {isFavorite(product.id) ? "Remove from Favorites" : "Add to Favorites"}
                </button>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900 dark:text-white">Quantity:</span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={18} />
                    Add to Cart
                  </button>
                  <Link
                    href={`/products/${product.id}`}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <Dialog.Close className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

export default SuggestedProductCard
