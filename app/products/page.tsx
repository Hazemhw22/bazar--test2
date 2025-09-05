"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { ChevronDown, SlidersHorizontal, X, Grid3X3, List } from "lucide-react"
import SortIcon from "../../components/SortIcon"
import { Category } from "../../lib/type" // عدّل المسار حسب مكان الملف

export default function Products() {
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(1000)
  const [rating, setRating] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState<string[]>(["All"])
  const [brands, setBrands] = useState<string[]>(["All"])
  const [brandSearch, setBrandSearch] = useState("")
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  // Fetch categories and brands
  useQuery({
    queryKey: ["categories-brands"],
    queryFn: async () => {
      const { data: cats } = await supabase.from("categories").select("title, id, image_url")
      const { data: shops } = await supabase.from("shops").select("shop_name")
      setCategories(["All", ...(cats?.map((c: any) => c) ?? [])])
      setBrands(["All", ...(shops?.map((s: any) => s.shop_name).filter(Boolean) ?? [])])
      return null
    },
  })

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
        .select("*, shops:shops(shop_name), categories:categories(title)")
        .order("created_at", { ascending: false })
      if (error) throw error
      return (data ?? []).map((product: any) => ({
        ...product,
        shops: product.shops && Array.isArray(product.shops) ? product.shops[0] : product.shops,
        categories:
          product.categories && Array.isArray(product.categories) ? product.categories[0] : product.categories,
      }))
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
      .filter((product: any) => (selectedBrand !== "All" ? product.shops?.shop_name === selectedBrand : true))
      .filter((product: any) => Number(product.price) >= minPrice && Number(product.price) <= maxPrice)
      .filter((product: any) => (rating.length > 0 ? rating.includes(Math.round(product.rating || 0)) : true))
      .filter((product: any) =>
        selectedSizes.length > 0 && product.size ? selectedSizes.includes(String(product.size)) : true,
      )
      .filter((product: any) =>
        selectedColors.length > 0 && product.color ? selectedColors.includes(String(product.color)) : true,
      )
  }, [products, search, selectedCategory, selectedBrand, minPrice, maxPrice, rating, selectedSizes, selectedColors])

  const toggleRating = (star: number) => {
    setRating((prev) => (prev.includes(star) ? prev.filter((r) => r !== star) : [...prev, star]))
  }

  return (
    <div className="mx-auto w-full max-w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6">
      {/* Hero */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8">
        <Image
          src="/stylish-asian-senior-woman-going-shopping-wearing-trendy-clothes-sunglasses-holding-store-bags-w.jpg"
          alt="Collection hero"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute left-8 top-8 text-white">
          <div className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4">Simple is More</div>
          <div className="text-lg md:text-xl lg:text-2xl opacity-90">Discover fresh arrivals and best deals</div>
        </div>
      </div>

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
              const title = isCategoryObject ? cat.title : cat

              return (
                <button
                  key={isCategoryObject ? cat.id : cat}
                  onClick={() => setSelectedCategory(title)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border whitespace-nowrap transition-all ${
                    selectedCategory === title
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {/* صورة الكاتيجوري */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 relative">
                    {isCategoryObject && cat.image_url ? (
                      <Image
                        src={cat.image_url}
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

                  <span className="text-sm font-medium mt-1">{title}</span>
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

      {/* Mobile filter button */}
      <div className="md:hidden mb-6 flex justify-end">
        <Button onClick={() => setFilterOpen(true)} variant="outline" size="lg">
          <SlidersHorizontal size={20} />
          <span className="ml-2 text-base">Filters</span>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block lg:w-1/5 sticky top-20 self-start bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-400 dark:border-blue-800">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <SlidersHorizontal size={20} />
            Filters
          </h2>

          {/* Category */}
          <div className="mb-6">
            <label className="font-semibold block mb-1">Category</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-700 focus:outline-none"
                >
                  {selectedCategory}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command className="w-full">
                  <CommandInput placeholder="Search categories..." className="w-full px-3 py-2" />
                  <CommandList>
                    <CommandEmpty>No categories found.</CommandEmpty>
                    <CommandGroup className="w-full">
                      {categories.map((option) => (
                        <CommandItem
                          key={option}
                          onSelect={() => setSelectedCategory(option)}
                          className="w-full text-sm text-gray-900 dark:text-gray-100 hover:bg-white dark:hover:bg-gray-700"
                        >
                          {option}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

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
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-6">
            <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-2">Products Page</h1>
            <div className="flex items-center gap-6 w-full md:w-auto">
              <Input
                type="text"
                placeholder="Search products..."
                className="w-full md:w-96 h-12 text-lg border border-gray-400 dark:border-blue-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 whitespace-nowrap border border-gray-400 dark:border-blue-800 h-12 px-6 bg-transparent"
                  >
                    <SortIcon className="w-6 h-6 text-gray-500 dark:text-gray-200" />
                    <span className="text-base">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Most Popular</DropdownMenuItem>
                  <DropdownMenuItem>Newest</DropdownMenuItem>
                  <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

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
            
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
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

          {isLoading && <div className="text-xl text-center py-12">جاري التحميل...</div>}
          {error && <div className="text-xl text-center py-12 text-red-500">حدث خطأ أثناء جلب المنتجات</div>}
          
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
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black bg-opacity-50 p-4"
      >
        <Dialog.Panel className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-sm text-sm relative">
          <button
            onClick={() => setFilterOpen(false)}
            className="absolute top-4 right-4 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <SlidersHorizontal size={20} />
            Filters
          </h2>

          <div className="mb-6">
            <label className="font-semibold block mb-1">Category</label>
            <select
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="font-semibold block mb-1">Shops</label>
            <select
              className="w-full rounded border px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              {brands.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-medium">Price Range</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={10000}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-1/2 rounded border px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                min={minPrice}
                max={10000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-1/2 rounded border px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
