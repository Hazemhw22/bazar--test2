import { ProductCard } from "./ProductCard"
import { Product as LibProduct } from "@/lib/type"

// Extend the shared Product type with optional shop relation fields we may receive from Supabase
type Product = LibProduct & {
  shops?: { id?: number; shop_name?: string; category_shop_id?: number }
}

interface ProductsListProps {
  products: Product[]
}

export function ProductsList({ products }: ProductsListProps) {
  // Exclude products whose related shop belongs to category_shop_id = 15
  const EXCLUDED_CATEGORY_SHOP_ID = 15
  const EXCLUDED_SHOP_NAME = "מסעדות"

  const filtered = products.filter((p) => {
    const shopRel: any = p.shops || null
    if (!shopRel) return true

    // Exclude by category_shop_id
    if (typeof shopRel.category_shop_id === "number" && shopRel.category_shop_id === EXCLUDED_CATEGORY_SHOP_ID) {
      return false
    }

    // Also exclude exact shop name match (in case the relation didn't include category id)
    if (typeof shopRel.shop_name === "string" && shopRel.shop_name === EXCLUDED_SHOP_NAME) {
      return false
    }

    return true
  })

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
      {filtered.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
