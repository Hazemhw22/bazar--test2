import { Star } from "lucide-react";

type ProductRatingProps = {
  rating: number;
  reviews?: number;
  size?: number;
};

export default function ProductRating({ rating, reviews = 0, size = 20 }: ProductRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
          fill={i < Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
      <span className="ml-2 text-gray-500 dark:text-gray-400 text-sm">
        ({reviews} تقييم)
      </span>
    </div>
  );
}