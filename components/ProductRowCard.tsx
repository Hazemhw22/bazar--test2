"use client";

import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
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
};

function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "";
  return `$${amount.toFixed(2)}`;
}

export default function ProductRowCard({ product }: { product: RowProduct }) {
  const imageSrc = product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg";
  const rating = Math.round(product.rating || 0);
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
    <div className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Left - Product Image */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
          <Link href={`/products/${product.id}`}>
            <Image 
              src={imageSrc} 
              alt={product.title} 
              fill 
              className="object-cover rounded-md"
            />
          </Link>
          {hasSale && (
            <Badge className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1">
              New
            </Badge>
          )}
        </div>

        {/* Center - Product Details */}
        <div className="flex-1 min-w-0 space-y-2">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base line-clamp-2 hover:underline">
              {product.title}
            </h3>
          </Link>
          
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.desc}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <div className="text-yellow-400">
                {"★".repeat(rating)}
                <span className="text-gray-300 dark:text-gray-600">{"★".repeat(5 - rating)}</span>
              </div>
              <span className="ml-1">({product.reviews ?? 0} reviews)</span>
            </div>
            {product.shops?.shop_name && (
              <span className="text-blue-600 dark:text-blue-400">
                Seller: {product.shops.shop_name}
              </span>
            )}
          </div>
        </div>

        {/* Right - Price and Actions */}
        <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
          <div className="text-right">
            <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(hasSale ? Number(product.sale_price) : product.price)}
            </div>
            {hasSale && (
              <div className="flex items-center gap-2 justify-end">
                <span className="text-sm line-through text-gray-400">
                  {formatPrice(product.price)}
                </span>
                {discountLabel && (
                  <Badge variant="destructive" className="text-xs">
                    {discountLabel}
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              size="sm" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to cart
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleWishlist}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "text-red-500" : ""}`} />
              {isFavorite ? "Remove from Wishlist" : "Wishlist"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
