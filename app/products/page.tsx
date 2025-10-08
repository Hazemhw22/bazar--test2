"use client"

import { useMemo, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { HeroSales } from "../../components/hero-sales"
import { Dialog } from "@headlessui/react"
import { supabase } from "../../lib/supabase"
import { ProductsList } from "../../components/product-list"
import ProductRowCard from "../../components/ProductRowCard"
import { DualRangeSlider } from "../../components/ui/dualrangeslider"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { ChevronDown, SlidersHorizontal, Grid3X3, List } from "lucide-react"
import SortIcon from "../../components/SortIcon"
import { Category } from "../../lib/type"

export default function Products() {
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [rating, setRating] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState<Category[]>([{ id: 0, title: "All", desc: "", created_at: "" }])
  const [brands, setBrands] = useState<string[]>(["All"])
  const [brandSearch, setBrandSearch] = useState("")
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [subcategories, setSubcategories] = useState<{ id: number; title: string }[]>([])

  // Fetch categories and brands
  useQuery({
    queryKey: ["categories-brands"],
    queryFn: async () => {
      const { data: cats } = await supabase.from("categories").select("title, id, image_url")
      const { data: shops } = await supabase.from("shops").select("shop_name")

      setCategories([
        { id: 0, title: "All", desc: "", created_at: "" },
        ...((cats ?? []).map((cat: any) => ({
          id: cat.id,
          title: cat.title,
          image_url: cat.image_url,
          desc: cat.desc ?? "",
          created_at: cat.created_at ?? "",
        })))
      ])
      setBrands(["All", ...(shops?.map((s: any) => s.shop_name).filter(Boolean) ?? [])])

      return null
    },
  })

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory !== "All") {
      const catObj = categories.find((cat) => cat.title === selectedCategory)
      if (catObj) {
        supabase
          .from("categories_sub")
          .select("id, title")
          .eq("category_id", catObj.id)
          .then(({ data }) => setSubcategories(data ?? []))
      }
    } else {
      setSubcategories([])
      setSelectedSubcategory(null)
    }
  }, [selectedCategory, categories])

  // Fetch products
  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, shops:shops(id, shop_name, category_shop_id), categories:categories(title), categories_sub:categories_sub(title)")
        .order("created_at", { ascending: false })
      if (error) throw error

      const mapped = (data ?? []).map((product: any) => ({
        ...product,
        shops: product.shops && Array.isArray(product.shops) ? product.shops[0] : product.shops,
        categories:
          product.categories && Array.isArray(product.categories) ? product.categories[0] : product.categories,
        categories_sub:
          product.categories_sub && Array.isArray(product.categories_sub) ? product.categories_sub[0] : product.categories_sub,
      }))

      // Exclude products whose related shop belongs to category_shop_id = 15 or has shop_name 'מסעדות'
      const excludedCategoryId = 15
      const excludedShopName = "מסעדות"
      const filtered = mapped.filter((product: any) => {
        const shop = product.shops
        if (!shop) return true
        if (typeof shop.category_shop_id === "number" && shop.category_shop_id === excludedCategoryId) return false
        if (typeof shop.shop_name === "string" && shop.shop_name === excludedShopName) return false
        return true
      })

      return filtered
    },
    refetchInterval: 5000,
  })

  const filteredProducts = useMemo(() => {
    return products
      .filter((product: any) =>
        search
          ? product.title?.toLowerCase().includes(search.toLowerCase()) ||
            product.desc?.toLowerCase().includes(search.toLowerCase())
          : true,
      )
      .filter((product: any) => (selectedCategory !== "All" ? product.categories?.title === selectedCategory : true))
      .filter((product: any) => (selectedSubcategory ? product.categories_sub?.title === selectedSubcategory : true))
      .filter((product: any) => (selectedBrand !== "All" ? product.shops?.shop_name === selectedBrand : true))
      .filter((product: any) => Number(product.price) >= minPrice && Number(product.price) <= maxPrice)
      .filter((product: any) => (rating.length > 0 ? rating.includes(Math.round(product.rating || 0)) : true))
      .filter((product: any) =>
        selectedSizes.length > 0 && product.size ? selectedSizes.includes(String(product.size)) : true,
      )
      .filter((product: any) =>
        selectedColors.length > 0 && product.color ? selectedColors.includes(String(product.color)) : true,
      )
  }, [products, search, selectedCategory, selectedSubcategory, selectedBrand, minPrice, maxPrice, rating, selectedSizes, selectedColors])

  const toggleRating = (star: number) => {
    setRating((prev) => (prev.includes(star) ? prev.filter((r) => r !== star) : [...prev, star]))
  }


  return (
    <div className="mx-auto w-full max-w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 mobile:max-w-[480px] page-background text-foreground">
      {/* Hero */}
      <HeroSales />

      {/* Category Pills Section */}
      <div className="mb-8 relative">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Categories</h2>

        <div className="relative">
          {/* Left Arrow */}
          <button
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              const el = document.getElementById("category-scroll")
              if (el) el.scrollBy({ left: -150, behavior: "smooth" })
            }}
            aria-label="Scroll Left"
          >
            <ChevronDown className="rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Scrollable Pills */}
          <div
            id="category-scroll"
            className="flex overflow-x-auto gap-3 scrollbar-hide pb-2 scroll-smooth"
          >
            {categories.map((cat: Category | string) => {
              const isCategoryObject = typeof cat !== "string"
              const title = isCategoryObject ? (cat as Category).title : (cat as string)

              return (
                <button
                  key={isCategoryObject ? (cat as Category).id : (cat as string)}
                  onClick={() => {
                    setSelectedCategory(title)
                    setSelectedSubcategory(null)
                  }}
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all"
                >
                  {/* صورة الكاتيجوري */}
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                      selectedCategory === title ? "border-blue-600" : "border-transparent"
                    }`}
                  >
                    {isCategoryObject && (cat as any).image_url ? (
                      <Image
                        src={(cat as any).image_url}
                        alt={title}
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                        {title[0]}
                      </div>
                    )}
                  </div>

                  <span
                    className={`text-sm font-medium mt-1 ${
                      selectedCategory === title ? "text-blue-600" : ""
                    }`}
                  >
                    {title}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right Arrow */}
          <button
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              const el = document.getElementById("category-scroll")
              if (el) el.scrollBy({ left: 150, behavior: "smooth" })
            }}
            aria-label="Scroll Right"
          >
            <ChevronDown className="-rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Subcategory Pills */}
        {subcategories.length > 0 && (
          <div className="flex overflow-x-auto gap-2 mt-3 pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                !selectedSubcategory
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
              }`}
            >
              All
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.title)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  selectedSubcategory === sub.title
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                }`}
              >
                {sub.title}
              </button>
            ))}
          </div>
        )}

        {/* Custom scrollbar hide */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>

      {/* Mobile filter button (moved next to view toggle) */}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block lg:w-1/5 sticky top-20 self-start bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <SlidersHorizontal size={20} />
            <span>Filters</span>
          </h2>

          {/* Brands searchable */}
          <div className="mb-6">
            <label className="font-semibold block mb-2">Shops</label>
            <Input
              placeholder="Search Shops"
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="mb-3 text-sm"
            />
            <div className="max-h-56 overflow-auto pr-1 space-y-2">
              {brands
                .filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()))
                .map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(b)}
                    className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      selectedBrand === b
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                        : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBrand === b && <span className="text-blue-600">✓</span>}
                  </button>
                ))}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-4 mb-6">
            <h3 className="font-medium">Price Range</h3>
            <div className="flex justify-between text-sm">
              <span>{minPrice} ₪</span>
              <span>{maxPrice} ₪</span>
            </div>
            <div className="px-2">
              <DualRangeSlider
                min={0}
                max={10000}
                minValue={minPrice}
                maxValue={maxPrice}
                step={10}
                onChange={({ min, max }) => {
                  setMinPrice(min)
                  setMaxPrice(max)
                }}
              />
            </div>
          </div>

          {/* Color */}
          <div className="mb-2">
            <label className="font-semibold block mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {["#111827", "#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#e5e7eb", "#a855f7"].map((c) => {
                const active = selectedColors.includes(c)
                return (
                  <button
                    key={c}
                    onClick={() =>
                      setSelectedColors((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
                    }
                    aria-label={`color-${c}`}
                    className={`h-6 w-6 rounded-full border-2 ${
                      active ? "border-blue-600" : "border-gray-300 dark:border-gray-700"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                )
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="mt-4">
            <label className="font-semibold block mb-2">Rating</label>
            <div className="flex flex-col gap-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <label key={star} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rating.includes(star)}
                    onChange={() => toggleRating(star)}
                    className="accent-yellow-400"
                  />
                  <span className="text-yellow-400 text-3xl">{"★".repeat(star)}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Products content */}
        <section className="w-full lg:w-4/5">
          {/* View Toggle */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show by:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  New items
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>New items</DropdownMenuItem>
                <DropdownMenuItem>Popular items</DropdownMenuItem>
                <DropdownMenuItem>On sale</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-2">
              {/* Mobile-only Filters button */}
              <div className="md:hidden">
                <Button
                  onClick={() => setFilterOpen(true)}
                  variant="outline"
                  size="sm"
                  className="px-3"
                  aria-label="Filters / الفلاتر"
                  title="Filters / الفلاتر"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden={true} />
                  <span className="ml-2 text-sm">Filters</span>
                </Button>
              </div>
              <div className="flex rounded-md">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-r-none border-r border-gray-300 dark:border-gray-600"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-l-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

          {isLoading && <div className="text-xl text-center py-12">Loading...</div>}
          {error && <div className="text-xl text-center py-12 text-red-500">An error occurred while fetching products</div>}
          
          {/* Products Display */}
          {viewMode === "list" ? (
            <div className="space-y-4">
              {filteredProducts.map((p: any) => (
                <ProductRowCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <ProductsList products={filteredProducts} />
          )}

          {/* Show More Button */}
          {filteredProducts.length > 0 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="flex items-center gap-2 mx-auto">
                Show more products
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          )}

        </section>
      </div>

      {/* Mobile filter modal */}
      <Dialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      >
        <Dialog.Panel className="bg-card rounded-t-3xl p-5 w-full max-w-[520px] text-sm relative shadow-2xl">
          <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/40 mb-4" />
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <SlidersHorizontal size={20} />
            Filters
          </h2>
          <div className="space-y-4 mb-4">
                <label className="font-semibold block mb-1">Shops</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between rounded-lg border px-3 py-2"
                    >
                      {selectedBrand}
                      <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    sideOffset={4}
                    className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-60 overflow-y-auto rounded-lg border bg-card p-0"
                    style={{ "--radix-dropdown-menu-trigger-width": "100%" } as any} // force full width
                  >
                    {brands.map((option) => (
                      <DropdownMenuItem
                        key={option}
                        onClick={() => setSelectedBrand(option)}
                        className={`flex justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          selectedBrand === option ? "bg-blue-100 dark:bg-blue-900/40" : ""
                        }`}
                      >
                        <span>{option}</span>
                        {selectedBrand === option && <span className="text-blue-600">✓</span>}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
           </div>



          <div className="space-y-4 mb-4">
            <h3 className="font-medium">Price Range</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={10000}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-1/2  px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border"
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                min={minPrice}
                max={10000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-1/2 rounded-lg border px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Max"
              />
              <span className="text-xs text-gray-500">₪</span>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2">Rating</label>
            <div className="flex flex-col gap-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <label key={star} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rating.includes(star)}
                    onChange={() => toggleRating(star)}
                    className="accent-yellow-400"
                  />
                  <span className="text-yellow-400 text-lg">{"★".repeat(star)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="sticky bottom-0 pt-3">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setFilterOpen(false)}>
                Close
              </Button>
              <Button className="flex-1 rounded-full" onClick={() => setFilterOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
