"use client";

import Image from "next/image";
import { Heart, Plus, Eye, Star } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { useFavorites } from "@/components/favourite-items";
import { useI18n } from "../lib/i18n";
import type { Product } from "@/lib/types";

function formatPrice(amount: number | string | null | undefined): string {
  if (amount == null) return "";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "";
  return ` ${num.toFixed(2)} ₪`;
}

export default function ProductRowCard({ product }: { product: Product }) {
  const { t } = useI18n();
  // Prefer canonical `image_url`, fall back to first item in `images` array, then placeholder
  const imageSrc = (product.image_url ?? (product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg")) as string;
  // use product.rating rounded, default to 3/5 as requested
  const rating = Math.round((product as any).rating ?? 3);
  const priceNum = typeof product.price === "string" ? parseFloat(String(product.price)) : (product.price as number);
  const salePriceNum = product.sale_price != null ? (typeof product.sale_price === "string" ? parseFloat(String(product.sale_price)) : (product.sale_price as number)) : null;
  const hasSale = salePriceNum != null && salePriceNum > 0 && salePriceNum < priceNum;

  const discountLabel = (() => {
    if (!hasSale) return null;
    const pct = Math.round(((priceNum - (salePriceNum ?? 0)) / priceNum) * 100);
    return `-${pct}%`;
  })();

  // Cart & Favorites
  const { addItem } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();

  const handleAddToCart = () => {
    addItem({
      id: Number(product.id),
      name: String(product.name ?? ""),
      price: hasSale ? (salePriceNum ?? priceNum) : priceNum,
  image: String(imageSrc ?? "/placeholder.svg"),
      quantity: 1,
    });
  };

  const isFavorite = favorites.some(fav => fav.id === Number(product.id));

  const handleWishlist = () => {
  const favoriteItem = {
    id: Number(product.id),
    name: String(product.name ?? ""),
    price: hasSale ? Number(product.sale_price) : Number(product.price as any),
    discountedPrice: product.sale_price ?? product.price,
  image: String(imageSrc ?? "/placeholder.svg"),
    store: (product.shops as any)?.name ?? (product.shops as any)?.shop_name ?? t("common.unknown"),
    rating: (product as any).rating ?? 0,
    reviews: (product as any).reviews ?? 0,
  };

  if (isFavorite) removeFromFavorites(Number(product.id));
  else addToFavorites(favoriteItem as any);
};


  return (
  <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1 hover:shadow-md transition-shadow relative overflow-hidden" dir="ltr">
      {/* Discount ribbon (top-left) */}
      {hasSale && discountLabel && (
        <div className="absolute top-2 left-0 transform -translate-x-1/2 -rotate-45 origin-top-left bg-red-500 text-white text-xs font-semibold px-3 py-1 shadow-lg">
          {discountLabel}
        </div>
      )}

      <div className="flex items-center gap-4">
        {/* small spacer so heart and plus can be positioned opposite image */}
        <div className="flex-shrink-0 w-2" />

        {/* Middle area: vertical stack - title, shop name, views, price */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-2 text-right hover:underline">
              {String( product.name ?? "")}
            </h3>
          </Link>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400  text-right">
            {(product.shops as any)?.shop_name ?? ""}
          </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-right flex items-center justify-end gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span>{(product as any).view_count ?? 0}</span>
            </div>

            <div className=" text-right">
              <div className="flex items-center justify-end gap-1">
                {Array.from({ length: 5 }).map((_, i) => {
                    const idx = 4 - i; // reverse so rating fills from right to left
                    const filled = idx < rating;
                    return (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
                        {...(filled ? { fill: 'currentColor', stroke: 'none' } : {})}
                      />
                    );
                  })}
              </div>
            </div>

              <div className="text-base font-bold text-gray-900 dark:text-gray-100 text-right">
              {formatPrice(hasSale ? Number(product.sale_price) : product.price)}
            </div>
          {hasSale && (
            <div className="text-sm text-gray-400">
              <span className="line-through">{formatPrice(product.price)}</span>
            </div>
          )}
        </div>

        {/* Right - Image */}
        <div className="flex-shrink-0 w-24">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
            <Link href={`/products/${product.id}`}>
              <Image src={imageSrc} alt={String( product.name ?? "")} fill className="object-cover" />
            </Link>
          </div>
        </div>
      </div>

      {/* Heart icon at top-left opposite the image */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 left-2 bg-white/90 backdrop-blur rounded-full p-1 shadow z-10"
          aria-label={t("product.toggleFavorite")}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500' : 'text-green-600'}`} />
        </button>

        <button
          aria-label={t("product.addToCart")}
          onClick={handleAddToCart}
          className="absolute bottom-3 left-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 z-20"
        >
          <Plus className="w-5 h-5 text-green-600" />
        </button>
    </div>
  );
}
