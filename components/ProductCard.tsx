"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Heart, Plus, ShoppingBag, Eye, XCircle, Star, ChevronRight, ChevronLeft } from "lucide-react";
import { useCart } from "./cart-provider";
import { useFavorites } from "./favourite-items";
import { Product } from "@/lib/type";
import { incrementProductCartCount } from "@/lib/tracking";

// Custom scrollbar and animation styles
const customStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  /* Card hover animations */
  .product-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .product-card:hover {
    transform: translateY(-8px);
  }
  
  .product-card:hover .card-image img {
    transform: scale(1.08);
  }
  
  .card-image img {
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .price-tag {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 10% 100%);
  }
  
  /* Slide animations */
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .slide-in {
    animation: slideIn 0.3s forwards;
  }
  
  /* Pulse animation for buttons */
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .pulse-on-hover:hover {
    animation: pulse 0.6s infinite;
  }
`;

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Apply custom styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
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
        <div className="p-2 sm:p-4 flex flex-col flex-1 justify-between">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2">
            {product.title}
          </h3>

          {/* Shop & Category فوق السعر مباشرة */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
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
              {discountedPrice.toFixed()} ₪
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
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300" />
          <Dialog.Content className="fixed z-50 top-1/2 left-1/2 max-w-5xl w-[90vw] max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl transform -translate-x-1/2 -translate-y-1/2 focus:outline-none border border-gray-200 dark:border-gray-700 transition-all duration-300 scale-100 opacity-100 animate-in fade-in-90 zoom-in-90">
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
                <div className="relative aspect-[4/3]">
                  <Image
                    src={activeImage}
                    alt={product.title}
                    fill
                    className="object-contain"
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
          <div className="border-t border-gray-200 dark:border-gray-700 p-2.5 bg-white dark:bg-gray-900 sticky bottom-0 shadow-md">
            <div className="flex items-center justify-between mb-2">
              {/* Compact Quantity Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Qty:</span>
                <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-r-lg"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Favorite Button */}
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center justify-center p-2.5 rounded-lg text-sm transition-colors ${
                  isFavorite(Number(product.id))
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
                title={isFavorite(Number(product.id)) ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart
                  size={18}
                  fill={isFavorite(Number(product.id)) ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>
              <Link
                href={`/products/${product.id}`}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex items-center justify-center shadow-sm"
              >
                View Details
              </Link>
            </div>
          </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex h-full">
              {/* Desktop Product Images - Reduced padding */}
              <div className="w-1/2 p-4 space-y-3 border-r border-gray-200 dark:border-gray-700">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 shadow-sm">
                  <Image
                    src={activeImage}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                  
                  {/* Floating close button */}
                  <Dialog.Close className="absolute top-3 right-3 p-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white rounded-full transition-colors shadow-sm">
                    <XCircle size={18} />
                  </Dialog.Close>
                </div>

                {additionalImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {additionalImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(image || "/placeholder.svg")}
                        className={`relative aspect-square rounded-md overflow-hidden bg-gray-50 dark:bg-gray-800 ring-1 transition-all ${
                          activeImage === image
                            ? "ring-blue-500 scale-105 shadow-md z-10"
                            : "ring-gray-200 dark:ring-gray-700 hover:ring-blue-300 dark:hover:ring-blue-700"
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

              {/* Desktop Product Details - Streamlined layout */}
              <div className="w-1/2 p-4 flex flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {product.title}
                    </h2>
                    
                    {/* Shop & Category */}
                    <div className="flex items-center gap-2 mb-3">
                      {product.shops?.shop_name && (
                        <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2.5 py-0.5 rounded-md text-xs font-medium border border-blue-100 dark:border-blue-800">
                          {product.shops.shop_name}
                        </span>
                      )}
                      {category_name && (
                        <span className="bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-2.5 py-0.5 rounded-md text-xs font-medium border border-green-100 dark:border-green-800">
                          {category_name}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                      {product.desc || "لا يوجد وصف"}
                    </p>
                  </div>

                  {/* Desktop Price - Modern card style */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        {discountedPrice !== basePrice && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            {basePrice.toFixed()} ₪
                          </p>
                        )}
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {discountedPrice.toFixed()} ₪
                        </p>
                      </div>
                      {product.sale_price && discountedPrice < basePrice && (
                        <span className="bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-md text-sm font-medium">
                          {Math.round(((basePrice - discountedPrice) / basePrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Actions - Compact layout */}
                <div className="space-y-3 pt-3 mt-auto border-t border-gray-200 dark:border-gray-700">
                  {/* Quantity and Favorite in one row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                      <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="px-2 py-1 text-xs font-medium min-w-[2rem] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-r-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={handleToggleFavorite}
                      className={`flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${
                        isFavorite(Number(product.id))
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      } transition-colors`}
                    >
                      <Heart
                        size={14}
                        fill={isFavorite(Number(product.id)) ? "currentColor" : "none"}
                      />
                      {isFavorite(Number(product.id)) ? "Remove" : "Favorite"}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ShoppingBag size={15} />
                      Add to Cart
                    </button>
                    <Link
                      href={`/products/${product.id}`}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* No need for additional close button as we have floating close buttons in both mobile and desktop views */}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
