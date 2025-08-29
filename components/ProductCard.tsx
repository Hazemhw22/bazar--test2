"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Heart, Plus, ShoppingBag, Eye } from "lucide-react";
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
  const basePrice = Number(product.price) || 0;
  const discountedPrice = product.sale_price ?? basePrice;
  const category_name = product.categories?.title;
  const [activeImage, setActiveImage] = useState(mainImage);

  const handleAddToCart = async () => {
    addItem({
      id: Number(product.id),
      name: product.title,
      price: discountedPrice,
      image: mainImage,
      quantity,
    });
    setQuantity(1);
    await incrementProductCartCount(product.id);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite({
      id: Number(product.id),
      name: product.title,
      price: basePrice,
      discountedPrice,
      image: mainImage,
      store: product.shops?.shop_name || "",
      inStock: product.active,
      rating: product.rating ?? 0,
      reviews: product.reviews ?? 0,
    });
  };

  const additionalImages =
    product.images.length > 0 ? product.images : [mainImage];

  useEffect(() => {
    if (isModalOpen) {
      setActiveImage(mainImage);
    }
  }, [isModalOpen, mainImage]);

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

          {/* Shop & Category فوق السعر مباشرة */}
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

          {/* Price & Add to Cart */}
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
                    src={activeImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {additionalImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(image || "/placeholder.svg")}
                      className={`relative aspect-square rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 ring-2 transition-all ${
                        activeImage === image
                          ? "ring-blue-500"
                          : "ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.title} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Details */}
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {product.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {product.desc || "لا يوجد وصف"}
                  </p>
                </div>

                {/* Shop & Category */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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

                {/* ✅ القسم السفلي المثبت في المودال */}
                <div className="mt-auto sticky bottom-0 left-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 h-[30%] flex flex-col justify-between space-y-3 overflow-y-auto">

                  {/* Price */}
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      {discountedPrice !== basePrice && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ₪{basePrice.toFixed(2)}
                        </p>
                      )}
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ₪{discountedPrice.toFixed(2)}
                      </p>
                    </div>
                    {product.sale_price && discountedPrice < basePrice && (
                      <p className="text-green-600 dark:text-green-400 text-xs font-medium">
                        You save ₪{(basePrice - discountedPrice).toFixed(2)} (
                        {Math.round(
                          ((basePrice - discountedPrice) / basePrice) * 100
                        )}
                        % off)
                      </p>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md border w-full text-sm ${
                      isFavorite(Number(product.id))
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    } transition-colors`}
                  >
                    <Heart
                      size={14}
                      fill={isFavorite(Number(product.id)) ? "currentColor" : "none"}
                    />
                    {isFavorite(Number(product.id))
                      ? "Remove from Favorites"
                      : "Add to Favorites"}
                  </button>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>
                    <Link
                      href={`/products/${product.id}`}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
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
