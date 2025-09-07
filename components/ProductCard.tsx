"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Heart, Plus, ShoppingBag, Eye, XCircle } from "lucide-react";
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
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-w-6xl w-[95vw] max-h-[95vh] overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl transform -translate-x-1/2 -translate-y-1/2 focus:outline-none border border-gray-200 dark:border-gray-700">
            <Dialog.Title className="sr-only">تفاصيل المنتج</Dialog.Title>
            
            {/* Mobile Layout */}
            <div className="lg:hidden flex flex-col h-[90vh]">
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-2">
                  {product.title}
                </h2>
                <Dialog.Close className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                </Dialog.Close>
              </div>

              {/* Mobile Image Section */}
              <div className="flex-1 overflow-y-auto">
                <div className="relative aspect-square bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={activeImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Mobile Thumbnail Images */}
                {additionalImages.length > 1 && (
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {additionalImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImage(image || "/placeholder.svg")}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 ring-2 flex-shrink-0 transition-all ${
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
                )}

                {/* Mobile Product Details */}
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                      {product.desc || "لا يوجد وصف"}
                    </p>
                  </div>

                  {/* Shop & Category */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.shops?.shop_name && (
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs">
                        {product.shops.shop_name}
                      </span>
                    )}
                    {category_name && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs">
                        {category_name}
                      </span>
                    )}
                  </div>

                  {/* Mobile Price */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      {discountedPrice !== basePrice && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                          ₪{basePrice.toFixed(2)}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₪{discountedPrice.toFixed(2)}
                      </p>
                    </div>
                    {product.sale_price && discountedPrice < basePrice && (
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                        You save ₪{(basePrice - discountedPrice).toFixed(2)} (
                        {Math.round(((basePrice - discountedPrice) / basePrice) * 100)}% off)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Fixed Bottom Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900">
            <div className="flex items-center gap-2">
              {/* Quantity Selector */}
              <span className="text-sm font-medium text-gray-900 dark:text-white"> Quantity : </span>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-l-xl"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm font-medium min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-r-xl"
                >
                  +
                </button>
              </div>
              {/* Favorite Button صغير */}
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center p-2 rounded-xl border text-sm transition-colors ${
                  isFavorite(Number(product.id))
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                }`}
                title={isFavorite(Number(product.id)) ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart
                  size={16}
                  fill={isFavorite(Number(product.id)) ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>
              <Link
                href={`/products/${product.id}`}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium flex items-center justify-center"
              >
                View Details
              </Link>
            </div>
          </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 h-full">
              {/* Desktop Product Images */}
              <div className="p-6 space-y-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                  <Image
                    src={activeImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {additionalImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {additionalImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(image || "/placeholder.svg")}
                        className={`relative aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 ring-2 transition-all ${
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
                )}
              </div>

              {/* Desktop Product Details */}
              <div className="p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                      {product.title}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {product.desc || "لا يوجد وصف"}
                    </p>
                  </div>

                  {/* Shop & Category */}
                  <div className="flex items-center gap-3">
                    {product.shops?.shop_name && (
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium">
                        {product.shops.shop_name}
                      </span>
                    )}
                    {category_name && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-full text-sm font-medium">
                        {category_name}
                      </span>
                    )}
                  </div>

                  {/* Desktop Price */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      {discountedPrice !== basePrice && (
                        <p className="text-lg text-gray-500 dark:text-gray-400 line-through">
                          ₪{basePrice.toFixed(2)}
                        </p>
                      )}
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        ₪{discountedPrice.toFixed(2)}
                      </p>
                    </div>
                    {product.sale_price && discountedPrice < basePrice && (
                      <p className="text-green-600 dark:text-green-400 text-sm font-medium">
                        You save ₪{(basePrice - discountedPrice).toFixed(2)} (
                        {Math.round(((basePrice - discountedPrice) / basePrice) * 100)}% off)
                      </p>
                    )}
                  </div>
                </div>

                {/* Desktop Actions */}
                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {/* Favorite Button */}
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border w-full text-sm font-medium ${
                      isFavorite(Number(product.id))
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                    } transition-colors`}
                  >
                    <Heart
                      size={16}
                      fill={isFavorite(Number(product.id)) ? "currentColor" : "none"}
                    />
                    {isFavorite(Number(product.id)) ? "Remove from Favorites" : "Add to Favorites"}
                  </button>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Quantity:
                    </span>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-l-xl"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-r-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={16} />
                      Add to Cart
                    </button>
                    <Link
                      href={`/products/${product.id}`}
                      className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <Dialog.Close className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <XCircle size={20} />
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
