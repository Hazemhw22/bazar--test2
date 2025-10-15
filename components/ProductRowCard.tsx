"use client";

import Image from "next/image";
import { Heart, Plus, Eye, Star } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { useFavorites } from "@/components/favourite-items";

type RowProduct = {
  id: number;
  title: string;
  desc: string;
  price: number;
  sale_price?: number | null;
  discount_type?: "fixed" | "percentage" | null;
  images?: string[];
  shops?: { shop_name: string } | null;
  rating?: number | null;
  reviews?: number | null;
  view_count?: number | null;
};

function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "";
  // use a simple dollar format to match the design screenshots
  return ` ${amount.toFixed(2)} ₪`;
}

export default function ProductRowCard({ product }: { product: RowProduct }) {
  const imageSrc = product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg";
  // use product.rating rounded, default to 3/5 as requested
  const rating = Math.round(product.rating ?? 3);
  const hasSale = product.sale_price != null && Number(product.sale_price) > 0 && Number(product.sale_price) < product.price;

  const discountLabel = (() => {
    if (!hasSale) return null;
    if (product.discount_type === "percentage") {
      const pct = Math.round(((product.price - Number(product.sale_price)) / product.price) * 100);
      return `-${pct}%`;
    }
    return "-";
  })();

  // Cart & Favorites
  const { addItem } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: hasSale ? Number(product.sale_price) : product.price,
      image: imageSrc,
      quantity: 1,
    });
  };

  const isFavorite = favorites.some(fav => fav.id === product.id);

 const handleWishlist = () => {
  const favoriteItem = {
    id: product.id,
    name: product.title,
    price: hasSale ? Number(product.sale_price) : product.price,
    discountedPrice: product.sale_price ?? product.price,
    image: imageSrc,
    store: product.shops?.shop_name ?? "Unknown",
    rating: product.rating ?? 0,
    reviews: product.reviews ?? 0,
  };

  if (isFavorite) removeFromFavorites(product.id);
  else addToFavorites(favoriteItem);
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
              {product.title}
            </h3>
          </Link>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400  text-right">
            {product.shops?.shop_name ?? ""}
          </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-right flex items-center justify-end gap-2">
              <Eye className="w-4 h-4 text-gray-500" />
              <span>{product.view_count ?? 0}</span>
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
              <Image src={imageSrc} alt={product.title} fill className="object-cover" />
            </Link>
          </div>
        </div>
      </div>

      {/* Heart icon at top-left opposite the image */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 left-2 bg-white/90 backdrop-blur rounded-full p-1 shadow z-10"
          aria-label="Toggle favorite"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'text-red-500' : 'text-green-600'}`} />
        </button>

        <button
          aria-label="Add to cart"
          onClick={handleAddToCart}
          className="absolute bottom-3 left-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 z-20"
        >
          <Plus className="w-5 h-5 text-green-600" />
        </button>
    </div>
  );
}
