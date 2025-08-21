"use client"

import { ProductCard } from "./ProductCard";

// Define Category type or import it if defined elsewhere
export interface Category {
  id: number;
  name: string;
  desc: string;
  title: string;
  created_at: string;
  // Add other fields as needed
}

export interface Product {
  id: number;
  created_at: string;
  shop: number;
  title: string;
  desc: string;
  price: number;
  images: string[];
  category: number | null;
  sale_price?: number | null;
  discount_type?: "percentage" | "fixed" | null;
  discount_value?: number | null;
  discount_start?: string | null;
  discount_end?: string | null;
  active: boolean;
  shops?: {
    shop_name: string;
  };
  categories?: Category;
}

export function ProductsList({ products }: { products: Product[] }) {
  return (
    <section className="py-6">
      <div className="max-w-screen-8xl 8xl:max-w-[1680px] mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
