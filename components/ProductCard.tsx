"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Heart, Plus, Star, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "./cart-provider";
import { useFavorites } from "./favourite-items";
import { Product } from "@/lib/type";
import { incrementProductCartCount } from "@/lib/tracking";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const mainImage = product.images?.[0] || "/placeholder.svg";
  const discountedPrice = product.sale_price ?? Number(product.price);
  const category_name = product.categories?.title;

  const handleAddToCart = async () => {
    addItem({
      id: Number(product.id),
      name: product.title,
      price: discountedPrice,
      image: mainImage,
      quantity,
    });
    setQuantity(1);
    await incrementProductCartCount(product.id.toString());
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      id: Number(product.id),
      name: product.title,
      price: Number(product.price),
      discountedPrice: discountedPrice,
      image: mainImage,
      store: product.shops?.shop_name || "",
      inStock: true,
      rating: product.rating ?? 0,
      reviews: product.reviews ?? 0,
    });
  };

  const additionalImages = product.images.length > 0 ? product.images : [mainImage];

  return (
    <>
      {/* Card */}
      <div
        className="group relative bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isFavorite(Number(product.id))
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700"
            }`}
          >
            <Heart
              size={16}
              fill={isFavorite(Number(product.id)) ? "currentColor" : "none"}
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
        <div className="p-4 flex flex-col flex-1 justify-between">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2">
            {product.title}
          </h3>

          {/* Shop & Category */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
            {product.shops?.shop_name && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {product.shops.shop_name}
              </span>
            )}
            {category_name && (
              <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                {category_name}
              </span>
            )}
          </div>

          {/* Price & Add to Cart - fixed at bottom */}
          <div className="flex items-center justify-between mt-auto">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {discountedPrice.toFixed(2)} ₪
            </p>
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

      {/* Product Modal */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-w-5xl w-[95vw] max-h-[90vh] overflow-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transform -translate-x-1/2 -translate-y-1/2 focus:outline-none border border-gray-200 dark:border-gray-700">
            <Dialog.Title className="sr-only">تفاصيل المنتج</Dialog.Title>

            <div className="grid md:grid-cols-2 gap-8 p-6">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={mainImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {additionalImages.slice(1).map((image, index) => (
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
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {product.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.desc || "لا يوجد وصف"}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <Dialog.Close className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              ✕
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
