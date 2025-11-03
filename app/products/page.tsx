"use client"

import { useMemo, useState, useEffect } from "react"
import { useI18n } from "../../lib/i18n"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { HeroSales } from "../../components/hero-sales"
import { Dialog } from "@headlessui/react"
import { supabase } from "../../lib/supabase"
import { 
  getProducts, 
  getCategories, 
  getSubcategories 
} from "../../lib/actions/products"
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
import { Category } from "../../lib/types"

export default function Products() {
  const { t, direction } = useI18n()
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(10000)
  const [rating, setRating] = useState<number[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState("All")
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState<Category[]>([{ id: 0, name: "All", description: "", shop_id: 0, created_at: "", updated_at: "" }])
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
  // fetch product categories and shops using server actions to bypass RLS
  const [cats, shops] = await Promise.all([
    getCategories(),
    supabase.from("shops").select("name")
  ]);

      setCategories([
        { id: 0, name: "All", description: "", shop_id: 0, created_at: "", updated_at: "" },
        ...((cats ?? []).map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          image_url: cat.image_url,
          description: cat.description ?? "",
          created_at: cat.created_at ?? "",
          updated_at: cat.updated_at ?? "",
          shop_id: cat.shop_id ?? 0,
        })))
      ])
      setBrands(["All", ...(shops?.data?.map((s: any) => s.name).filter(Boolean) ?? [])])

      return null
    },
  })

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory !== "All") {
      const catObj = categories.find((cat) => cat.name === selectedCategory)
      if (catObj) {
        getSubcategories(catObj.id)
          .then((data) => setSubcategories(data ?? []))
          .catch(console.error);
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
      // Use server action to bypass RLS
      const prods = await getProducts({ limit: 200, orderBy: { column: "created_at", ascending: false }, onlyActive: false, excludeShopCategoryId: 15 });
      return prods as any[];
    },
    refetchInterval: 5000,
  })

  const filteredProducts = useMemo(() => {
    // Find selected category object (if any) to compare by id first
    const selCat = selectedCategory !== "All" ? categories.find((c) => String(c.name) === String(selectedCategory)) : null
    return products
      .filter((product: any) =>
        search
          ? product.name?.toLowerCase().includes(search.toLowerCase()) ||
            product.description?.toLowerCase().includes(search.toLowerCase())
          : true,
      )
      .filter((product: any) => {
        if (selectedCategory === "All") return true
        // if we found the category object, prefer comparing by category_id
        if (selCat) {
          const catId = Number(selCat.id)
          if (Number(product.category_id) === catId) return true
          // product may include a joined category under different keys
          if (product.products_categories) {
            // could be object or array
            if (Array.isArray(product.products_categories)) {
              if (product.products_categories.some((pc: any) => Number(pc.id) === catId || String(pc.name) === String(selectedCategory))) return true
            } else if (Number(product.products_categories.id) === catId || String(product.products_categories.name) === String(selectedCategory)) {
              return true
            }
          }
          return false
        }
        // fallback: compare by joined names if category object not found
        return (
          (product.products_categories && (String(product.products_categories.name) === String(selectedCategory))) ||
          (product.categories && String(product.categories.name) === String(selectedCategory)) ||
          false
        )
      })
      .filter((product: any) => {
        if (!selectedSubcategory) return true
        // فلترة حسب السوب كاتيجوري الجديد
        if (product.sub_category_id) {
          // البحث عن السوب كاتيجوري المحدد في قائمة السوب كاتيجوريز
          const selectedSubcategoryObj = subcategories.find(sub => sub.title === selectedSubcategory)
          if (selectedSubcategoryObj) {
            return Number(product.sub_category_id) === Number(selectedSubcategoryObj.id)
          }
        }
        // التحقق من الجوين إذا كان موجود
        if (product.products_sub_categories) {
          if (Array.isArray(product.products_sub_categories)) {
            return product.products_sub_categories.some((sc: any) => String(sc.name) === String(selectedSubcategory))
          }
          return String(product.products_sub_categories.name) === String(selectedSubcategory)
        }
        return false
      })
      .filter((product: any) => (selectedBrand !== "All" ? product.shops?.name === selectedBrand : true))
      .filter((product: any) => Number(product.price) >= minPrice && Number(product.price) <= maxPrice)
      .filter((product: any) => (rating.length > 0 ? rating.includes(Math.round(product.rating || 0)) : true))
      .filter((product: any) => (selectedSizes.length > 0 && product.size ? selectedSizes.includes(String(product.size)) : true))
      .filter((product: any) => (selectedColors.length > 0 && product.color ? selectedColors.includes(String(product.color)) : true))
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t("categories.title")}</h2>

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
              const title = isCategoryObject ? (cat as Category).name : (cat as string)

              return (
                  <button
                  key={isCategoryObject ? (cat as Category).id : (cat as string)}
                  onClick={() => {
                    setSelectedCategory(String(title))
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
                        src={String((cat as any).image_url)}
                        alt={String(title ?? "")}
                        fill
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                        {String(title ?? "").charAt(0)}
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

        {/* Subcategory Pills - نفس تصميم الكاتيجوري */}
        {subcategories.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">{t("subcategories.title")}</h3>
            <div className="relative">
              {/* Left Arrow */}
              <button
                className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  const el = document.getElementById("subcategory-scroll")
                  if (el) el.scrollBy({ left: -150, behavior: "smooth" })
                }}
                aria-label="Scroll Left"
              >
                <ChevronDown className="rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Scrollable Pills */}
              <div
                id="subcategory-scroll"
                className="flex overflow-x-auto gap-3 scrollbar-hide pb-2 scroll-smooth"
              >
                {/* زر الكل */}
                <button
                  onClick={() => setSelectedSubcategory(null)}
                  className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all"
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                      !selectedSubcategory ? "border-blue-600" : "border-transparent"
                    }`}
                  >
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                      A
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium mt-1 ${
                      !selectedSubcategory ? "text-blue-600" : ""
                    }`}
                  >
                    {t("common.all")}
                  </span>
                </button>

                {/* السوب كاتيجوريز */}
                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubcategory(sub.title)}
                    className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl whitespace-nowrap transition-all"
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 relative rounded-full overflow-hidden border-2 transition-colors ${
                        selectedSubcategory === sub.title ? "border-blue-600" : "border-transparent"
                      }`}
                    >
                      {(sub as any).image_url ? (
                        <Image
                          src={(sub as any).image_url}
                          alt={sub.title}
                          fill
                          className="object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                          {sub.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium mt-1 ${
                        selectedSubcategory === sub.title ? "text-blue-600" : ""
                      }`}
                    >
                      {sub.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  const el = document.getElementById("subcategory-scroll")
                  if (el) el.scrollBy({ left: 150, behavior: "smooth" })
                }}
                aria-label="Scroll Right"
              >
                <ChevronDown className="-rotate-90 h-4 w-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
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
            <span>{t("shops.filters")}</span>
          </h2>

          {/* Brands searchable */}
          <div className="mb-6">
            <label className="font-semibold block mb-2">{t("shops.searchPlaceholder")}</label>
            <Input
              placeholder={t("shops.searchPlaceholder")}
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
            <h3 className="font-medium">{t("product.priceRange")}</h3>
            <div className="flex justify-between text-sm">
              <span>{minPrice} {t("currency.symbol")}</span>
              <span>{maxPrice} {t("currency.symbol")}</span>
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
            <label className="font-semibold block mb-2">{t("product.color")}</label>
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
            <label className="font-semibold block mb-2">{t("products.rating")}</label>
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
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("products.showBy")}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {t("products.sort.new")}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>{t("products.sort.new")}</DropdownMenuItem>
                <DropdownMenuItem>{t("products.sort.popular")}</DropdownMenuItem>
                <DropdownMenuItem>{t("products.sort.sale")}</DropdownMenuItem>
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
                  aria-label={t("shops.filters")}
                  title={t("shops.filters")}
                >
                  <SlidersHorizontal className="h-4 w-4 gap-2" aria-hidden={true} />
                  <span className="ml-2 text-sm ">{t("shops.filters")}</span>
                </Button>
              </div>
                <div className="flex rounded-md" dir="rtl">
                  {/* Always render Grid | List (same order for all locales) */}
                  <>
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-l-none"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-r-none border-r border-gray-300 dark:border-gray-600"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </>
                </div>
             
            </div>
          </div>

          {isLoading && <div className="text-xl text-center py-12">{t("common.loading")}</div>}
          {error && <div className="text-xl text-center py-12 text-red-500">{t("products.fetchError")}</div>}
          
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
                {t("products.showMore")}
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
            {t("shops.filters")}
          </h2>
      <div className="space-y-4 mb-4">
        <label className="font-semibold block mb-1">{t("filters.shops")}</label>
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
            <h3 className="font-medium">{t("product.priceRange")}</h3>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={10000}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-1/2  px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg border"
                placeholder={t("filters.min")}
              />
              <span>-</span>
              <input
                type="number"
                min={minPrice}
                max={10000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-1/2 rounded-lg border px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder={t("filters.max")}
              />
              <span className="text-xs text-gray-500">{t("currency.symbol")}</span>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-2">{t("products.rating")}</label>
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
                {t("common.close")}
              </Button>
              <Button className="flex-1 rounded-full" onClick={() => setFilterOpen(false)}>
                {t("common.apply")}
              </Button>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
