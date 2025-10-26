import { ProductCard } from "./ProductCard"
import { Product as LibProduct } from "@/lib/types"

// Extend the shared Product type with optional shop relation fields we may receive from Supabase
type Product = LibProduct & {
  // migrate to the canonical shop relation shape (prefer `name`)
  shops?: { id?: number; name?: string; category_shop_id?: number; shop_name?: string }
}

interface ProductsListProps {
  products: Product[]
}

export function ProductsList({ products }: ProductsListProps) {
  // Render all products as passed in (no client-side exclusions)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
