"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, ShoppingBag, Eye } from "lucide-react";
import { useCart } from "./cart-provider";
import { useFavorites } from "./favourite-items";
import { Product } from "@/lib/types";
import { incrementProductCartCount } from "@/lib/tracking";
import ProductFeaturesModal from "./ProductFeaturesModal";
import { useI18n } from "../lib/i18n";

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
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { t } = useI18n();
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

  // Prefer canonical `image_url`, fall back to first `images` entry, then placeholder
  const mainImage = String(product.image_url ?? product.images?.[0] ?? "/placeholder.svg");
  const basePrice = Number(product.price) || 0;
  const discountedPrice = Number(product.sale_price ?? basePrice);
  const category_name = (product as any).products_categories?.name ?? (product as any).category_name ?? undefined;
  const [activeImage, setActiveImage] = useState(mainImage);

  const handleAddToCart = async () => {
    addItem({
      id: Number(product.id),
      // prefer canonical `name`
  name: String(product.name ?? ""),
      price: discountedPrice,
      image: String(mainImage ?? "/placeholder.svg"),
      quantity,
    });
    setQuantity(1);
    await incrementProductCartCount(String(product.id));
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
      toggleFavorite({
      id: Number(product.id),
        name: String(product.name ??  ""),
      price: basePrice,
      discountedPrice,
      image: String(mainImage ?? "/placeholder.svg"),
        // prefer shops.name but keep legacy shop_name if present
        store: (product.shops as any)?.name ?? (product.shops as any)?.shop_name ?? "",
  inStock: (product as any).active ?? product.onsale ?? true,
  rating: (product as any).rating ?? 0,
  reviews: (product as any).reviews ?? 0,
    });
  };

  const additionalImages = (() => {
    const imgs: string[] = [];
    if (product.image_url) imgs.push(String(product.image_url));
    if (product.images && product.images.length > 0) imgs.push(...(product.images as any[]).map((i: any) => String(i)));
    if (imgs.length === 0) imgs.push("/placeholder.svg");
    return imgs;
  })();

  useEffect(() => {
    if (isModalOpen) {
      setActiveImage(mainImage);
    }
  }, [isModalOpen, mainImage]);

  return (
    <>
      {/* Product Card */}
      <div
        className="group relative bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Image Container */}
        <div
          className={
            compact
              ? "relative h-28 sm:h-32 overflow-hidden bg-gray-50 dark:bg-gray-800"
              : "relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800"
          }
        >
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

          {/* Sales Tag (بدل عداد المشاهدات القديم) */}
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow">
              {t("product.salesTag")}
            </span>
          </div>

          {/* Product Image */}
          <Image
            src={String(mainImage)}
            alt={String(product.name ?? "")}
            fill
            className={`object-cover transition-transform duration-500 ${compact ? '' : 'group-hover:scale-110'}`}
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
          {/* Product Name + View Count */}
          <div className="flex items-center justify-between mb-2 gap-4">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight flex-1">
              {String(product.name ?? "")}
            </h3>
            {/* View Count (Eye icon) */}
            <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full shadow">
              <Eye size={16} />
              <span className="text-xs font-medium">{(product as any).view_count ?? 0}</span>
            </div>
          </div>

          {/* Shop & Category */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1 sm:mb-2">
            {((product.shops as any)?.name ?? (product.shops as any)?.shop_name) && (
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                {(product.shops as any).name ?? (product.shops as any).shop_name}
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
              <p className={`${compact ? 'text-sm font-semibold' : 'text-lg font-bold'} text-gray-900 dark:text-white`}>
              {discountedPrice.toFixed()} ₪
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors"
              title={t("product.addToCart")}
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Features Modal */}
      <ProductFeaturesModal 
        product={product} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}

