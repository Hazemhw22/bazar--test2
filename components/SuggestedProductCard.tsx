"use client";

import { Star } from "lucide-react";

type SuggestedProduct = {
  id: number;
  name: string;
  price: number;
  discountedPrice: number;
  rating: number;
  reviews: number;
  image: string;
  store?: string;
};

interface SuggestedProductCardProps {
  product: SuggestedProduct;
}

export default function SuggestedProductCard({ product }: SuggestedProductCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition p-3 flex flex-col justify-between h-full">
      <div className="flex justify-center items-center h-40 mb-3">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="object-contain h-full w-full"
        />
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2">{product.name}</h3>

        {product.store && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{product.store}</p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            ₪{product.discountedPrice}
          </span>
          {product.discountedPrice !== product.price && (
            <span className="text-xs line-through text-gray-400 dark:text-gray-500">
              ₪{product.price}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1">
          <Star size={14} className="text-yellow-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {product.rating.toFixed(1)} ({product.reviews})
          </span>
        </div>
      </div>
    </div>
  );
}
