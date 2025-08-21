"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Heart, Plus, Star, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "./cart-provider";
import { useFavorites } from "./favourite-items";

interface Category {
  id: number;
  desc: string;
  title: string;
}

interface ProductCardProps {
  product: {
    id: number;
    created_at: string;
    shop: number;
    title: string;
    desc: string;
    price: number;
    images: string[];
    category: number | null;
    sale_price?: number | null;
    discount_type?: "percentage" | "fixed" | null;
    discount_value?: number | null;
    discount_start?: string | null;
    discount_end?: string | null;
    active: boolean;
    shops?: {
      shop_name: string;
    };
    categories?: Category;
    rating?: number;
    reviews?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const mainImage = product.images?.[0] || "/placeholder.svg";
  const discountedPrice = product.sale_price ?? product.price;
  const discountPercentage =
    product.sale_price && product.price
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: discountedPrice,
      image: mainImage,
      quantity,
    });
    setQuantity(1);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    });
  };

  // صور إضافية للمعاينة
  const additionalImages =
    product.images.length > 0 ? product.images : [mainImage];

  return (
    <>
      <div
        className="group relative bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              -{discountPercentage}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isFavorite(product.id)
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
            }`}
          >
            <Heart
              size={16}
              fill={isFavorite(product.id) ? "currentColor" : "none"}
            />
          </button>

          {/* Product Image */}
          <Image
            src={mainImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            priority
          />

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-black/20 flex items-center justify-center gap-2 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              className="p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          {/* Store Name */}
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
            {product.shops?.shop_name || ""}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {product.price !== discountedPrice && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                   {product.price.toFixed(2)} ₪
                </p>
              )}
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                 {discountedPrice.toFixed(2)} ₪
              </p>
            </div>
            {/* زر الإضافة السريعة للسلة */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors"
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
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-w-5xl w-[95vw] max-h-[90vh] overflow-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transform -translate-x-1/2 -translate-y-1/2 focus:outline-none border border-gray-200 dark:border-gray-700">
            <Dialog.Title className="sr-only">تفاصيل المنتج</Dialog.Title>{" "}
            {/* أضف هذا السطر */}
            <div className="grid md:grid-cols-2 gap-8 p-6">
              {/* Product Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={mainImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Additional Images Grid */}
                <div className="grid grid-cols-4 gap-2">
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
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-2">
                    {product.shops?.shop_name || ""}
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {product.categories?.title || ""}
                  </p>
                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={
                          i < Math.round(product.rating ?? 0)
                            ? "text-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }
                        fill={
                          i < Math.round(product.rating ?? 0)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                    <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">
                      ({product.reviews ?? 0})
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.desc || "لا يوجد وصف"}
                </p>

                {/* Price */}
                <div className="space-y-2">
                  {product.price !== discountedPrice && (
                    <p className="text-lg text-gray-500 dark:text-gray-400 line-through">
                      ₪{product.price.toFixed(2)}
                    </p>
                  )}
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ₪{discountedPrice.toFixed(2)}
                  </p>
                  {discountPercentage > 0 && (
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      You save ₪{(product.price - discountedPrice).toFixed(2)} (
                      {discountPercentage}% off)
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
                  <Heart
                    size={18}
                    fill={isFavorite(product.id) ? "currentColor" : "none"}
                  />
                  {isFavorite(product.id)
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </button>

                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900 dark:text-white">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={20} />
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
  );
}
