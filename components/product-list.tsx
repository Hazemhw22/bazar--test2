import { ProductCard } from "./ProductCard"

interface Product {
  id: number
  created_at: string
  shop: number
  title: string
  desc: string
  price: number
  images: string[]
  category: number | null
  sale_price?: number | null
  discount_type?: "fixed" | "percentage" | null
  active: boolean
  rating?: number
  shops?: { shop_name: string }
  categories?: { id: number; title: string; desc: string }
  reviews?: number
}

interface ProductsListProps {
  products: Product[]
}

export function ProductsList({ products }: ProductsListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
