"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  ShoppingBag,
  Trash2,
  Filter,
  Grid3X3,
  List,
  Star,
  Search,
  SortAsc,
  SortDesc,
  ArrowLeft,
  Share2,
  Eye,
} from "lucide-react"
import { useFavorites } from "@/components/favourite-items"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function FavouritePage() {
  const { favorites, removeFromFavorites } = useFavorites()
  const { addItem } = useCart()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filterBy, setFilterBy] = useState("all")

  // Get unique stores for filtering
  const uniqueStores = Array.from(new Set(favorites.map((item) => item.store)))

  // Filter and sort favorites
  const filteredAndSortedFavorites = favorites
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterBy === "all" || item.store === filterBy
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "price":
          comparison = a.discountedPrice - b.discountedPrice
          break
        case "rating":
          comparison = a.rating - b.rating
          break
        case "store":
          comparison = a.store.localeCompare(b.store)
          break
        default:
          comparison = 0
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  const handleAddToCart = (item: any) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.discountedPrice,
      image: item.image,
      quantity: 1,
    })
  }

  const handleRemoveFromFavorites = (id: number) => {
    removeFromFavorites(id)
  }

  const handleShare = (item: any) => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `Check out this ${item.name} for $${item.discountedPrice}`,
        url: `/products/${item.id}`,
      })
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/products/${item.id}`)
    }
  }

  const addAllToCart = () => {
    filteredAndSortedFavorites.forEach((item) => {
      if (item.inStock) {
        handleAddToCart(item)
      }
    })
  }

  const clearAllFavorites = () => {
    if (window.confirm("Are you sure you want to remove all items from your favorites?")) {
      favorites.forEach((item) => removeFromFavorites(item.id))
    }
  }

  return (
    <div className="page-background">
      <div className="container mx-auto px-4 py-8 mobile:max-w-[480px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-blue-200 dark:border-blue-800 pb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">My Favorites</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {favorites.length} {favorites.length === 1 ? "item" : "items"} saved
              </p>
            </div>
            {favorites.length > 0 && (
              <div className="flex gap-2">
                <Button onClick={addAllToCart} className="flex items-center gap-2">
                  <ShoppingBag size={16} />
                  Add All to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAllFavorites}
                  className="text-red-600 hover:text-red-700 border-2 border-blue-200 dark:border-blue-800"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>

        {favorites.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 rounded-2xl bg-card">
            <Heart size={80} className="mx-auto text-gray-400 mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">No favorites yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start adding products to your favorites by clicking the heart icon on any product you love.
            </p>
            <Link href="/products">
              <Button size="lg">
                <ShoppingBag size={20} className="mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Filters and Controls */}
            <div className="bg-card rounded-2xl border border-border/50 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search favorites..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-2 border-blue-200 dark:border-blue-800"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-40 border-2 border-blue-200 dark:border-blue-800">
                      <Filter size={16} className="mr-2" />
                      <SelectValue placeholder="Filter by store" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stores</SelectItem>
                      {uniqueStores.map((store) => (
                        <SelectItem key={store} value={store}>
                          {store}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32 border-2 border-blue-200 dark:border-blue-800">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="store">Store</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="px-3 border-2 border-blue-200 dark:border-blue-800"
                  >
                    {sortOrder === "asc" ? <SortAsc size={16} /> : <SortDesc size={16} />}
                  </Button>

                  <div className="flex border-2 border-blue-200 dark:border-blue-800 rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none"
                    >
                      <Grid3X3 size={16} />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-none"
                    >
                      <List size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            {searchQuery || filterBy !== "all" ? (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredAndSortedFavorites.length} of {favorites.length} favorites
                </p>
              </div>
            ) : null}

            {/* Favorites Grid/List */}
            {filteredAndSortedFavorites.length === 0 ? (
              <div className="text-center py-12 border border-border/50 rounded-2xl bg-card">
                <Search size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No results found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedFavorites.map((item) => (
                  <Card
                    key={item.id}
                    className="group hover:shadow-lg transition-shadow duration-300 border-2 border-blue-200 dark:border-blue-800"
                  >
                    <CardContent className="p-4">
                      {/* Product Image */}
                      <div className="relative aspect-square mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden border border-blue-200 dark:border-blue-800">
                        <Image
                          src={item.image || "/placeholder.svg?height=200&width=200"}
                          alt={item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
                            onClick={() => handleShare(item)}
                          >
                            <Share2 size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleRemoveFromFavorites(item.id)}
                          >
                            <Heart size={14} fill="currentColor" />
                          </Button>
                        </div>
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="secondary">Out of Stock</Badge>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide">
                          {item.store}
                        </p>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                          {item.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`${
                                  i < item.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({item.reviews})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          {item.price !== item.discountedPrice && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ${item.discountedPrice.toFixed(2)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button className="flex-1" onClick={() => handleAddToCart(item)} disabled={!item.inStock}>
                            <ShoppingBag size={16} className="mr-2" />
                            Add to Cart
                          </Button>
                          <Link href={`/products/${item.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-3 border-2 border-blue-200 dark:border-blue-800"
                            >
                              <Eye size={16} />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredAndSortedFavorites.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow border-2 border-blue-200 dark:border-blue-800"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 border border-blue-200 dark:border-blue-800">
                          <Image
                            src={item.image || "/placeholder.svg?height=96&width=96"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge variant="secondary" className="text-xs">
                                Out of Stock
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wide mb-1">
                                {item.store}
                              </p>
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                            </div>
                            <div className="flex gap-1 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleShare(item)}
                                className="h-8 w-8 p-0"
                              >
                                <Share2 size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveFromFavorites(item.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Heart size={14} fill="currentColor" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              {/* Rating */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      className={`${
                                        i < item.rating
                                          ? "text-yellow-400 fill-yellow-400"
                                          : "text-gray-300 dark:text-gray-600"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">({item.reviews})</span>
                              </div>

                              {/* Price */}
                              <div className="flex items-center gap-2">
                                {item.price !== item.discountedPrice && (
                                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                    ${item.price.toFixed(2)}
                                  </span>
                                )}
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                  ${item.discountedPrice.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Link href={`/products/${item.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-2 border-blue-200 dark:border-blue-800"
                                >
                                  <Eye size={16} className="mr-2" />
                                  View
                                </Button>
                              </Link>
                              <Button onClick={() => handleAddToCart(item)} disabled={!item.inStock}>
                                <ShoppingBag size={16} className="mr-2" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
