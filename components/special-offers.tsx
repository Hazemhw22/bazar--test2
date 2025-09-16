"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Heart, Plus, Star, Eye } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/type";
import { useFavorites } from "./favourite-items";
import { useCart } from "./cart-provider";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";

export function SpecialOffers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addItem } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchSpecialOfferProducts();
  }, []);

  const fetchSpecialOfferProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          id,
          title,
          price,
          sale_price,
          discount_type,
          discount_value,
          images,
          view_count,
          created_at
        `)
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        console.error('Supabase error:', fetchError.message);
        setError('Failed to fetch special offer products.');
        return;
      }

      if (!data || data.length === 0) {
        setProducts([]);
        return;
      }

      const transformedProducts = data.map((product: any) => ({
        ...product,
        price: product.price || "0",
        images: product.images || [],
        view_count: product.view_count || 0
      }));

      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching special offer products:', err);
      setError('Something went wrong while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  const getDiscountText = (product: Product) => {
    if (product.sale_price && product.price) {
      const originalPrice = parseFloat(product.price);
      const salePrice = product.sale_price;
      if (originalPrice > salePrice) {
        const discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
        return `${discountPercent}% OFF`;
      }
    }
    if (product.discount_type === 'percentage' && product.discount_value) {
      return `${product.discount_value}% OFF`;
    }
    if (product.discount_type === 'fixed' && product.discount_value) {
      return `$${product.discount_value} OFF`;
    }
    return '';
  };

  const getDisplayPrice = (product: Product) => {
    if (product.sale_price && product.price) {
      const originalPrice = parseFloat(product.price);
      return product.sale_price < originalPrice ? product.sale_price : originalPrice;
    }
    return parseFloat(product.price || "0");
  };

  const getOriginalPrice = (product: Product) => {
    if (product.sale_price && product.price) {
      const originalPrice = parseFloat(product.price);
      return product.sale_price < originalPrice ? originalPrice : null;
    }
    return null;
  };

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("special-offers-container");
    if (container) {
      const scrollAmount = 300;
      const newScrollLeft = direction === "left" 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth"
      });

      setTimeout(() => {
        if (container) {
          setShowLeftArrow(container.scrollLeft > 0);
          setShowRightArrow(
            container.scrollLeft < container.scrollWidth - container.clientWidth - 10
          );
        }
      }, 300);
    }
  };

  const checkScrollPosition = () => {
    const container = document.getElementById("special-offers-container");
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  if (loading) {
    return (
      <section className="w-full py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Special Offer
              </h2>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-64 sm:w-72 md:w-80">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-4 sm:py-8 px-2 sm:px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Special Offer
              </h2>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">%</span>
              </div>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={fetchSpecialOfferProducts}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Special Offer
              </h2>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">%</span>
              </div>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">No special offers available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-3 sm:py-4 px-2 sm:px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Special Offers
            </h2>
          </div>
          <Link href="/products?filter=special-offers" className="text-sm text-gray-600 dark:text-gray-400 font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            See All
          </Link>
        </div>

        {/* Special Offers Container */}
        <div className="relative group">
          {showLeftArrow && (
            <button
              onClick={() => handleScroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 opacity-0 group-hover:opacity-100 hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => handleScroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 opacity-0 group-hover:opacity-100 hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Special Offer Card - Based on the image */}
          <div className="w-full bg-gray-800 dark:bg-gray-900 rounded-xl overflow-hidden">
            <div className="flex flex-row">
              <div className="w-1/2 p-6 flex flex-col justify-center">
                <div className="text-5xl font-bold text-white mb-2">30%</div>
                <div className="text-xl font-semibold text-white mb-4">Today's Special!</div>
                <p className="text-sm text-gray-300 mb-4">Get discount for every order, only valid for today</p>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
              </div>
              <div className="w-1/2 relative">
                <img 
                  src="/shopping-concept-close-up-portrait-young-beautiful-attractive-redhair-girl-smiling-looking-camera.jpg" 
                  alt="Special Offer" 
                  className="h-full w-full object-cover object-center"
                />
              </div>
            </div>
          </div>
          
          {/* Regular Products */}
          <div
            id="special-offers-container"
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 mt-4"
            onScroll={checkScrollPosition}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-40 sm:w-48 md:w-56"
              >
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow relative">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <span className="text-4xl">🛍️</span>
                      </div>
                    )}

                    {getDiscountText(product) && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                        {getDiscountText(product)}
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite({
                        id: Number(product.id),
                        name: product.title,
                        price: Number(product.price),
                        discountedPrice: product.sale_price ?? Number(product.price),
                        image: product.images?.[0] || "",
                        store: "",
                        inStock: true,
                        rating: product.rating ?? 0,
                        reviews: product.reviews ?? 0,
                      })}
                      className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors ${
                        isFavorite(Number(product.id))
                          ? "bg-red-500 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      title={isFavorite(Number(product.id)) ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                    >
                      <Heart className="w-4 h-4" fill={isFavorite(Number(product.id)) ? "currentColor" : "none"} />
                    </button>

                    {/* Quick View Button */}
                    <button
                      onClick={() => setQuickViewProduct(product)}
                      className="absolute bottom-2 left-2 w-7 h-7 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="عرض سريع"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addItem({
                        id: Number(product.id),
                        name: product.title,
                        price: product.sale_price ?? Number(product.price),
                        image: product.images?.[0] || "",
                        quantity: 1,
                      })}
                      className="absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-blue-600 text-white shadow hover:bg-blue-700 transition-colors"
                      title="إضافة للسلة"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        ₪{getDisplayPrice(product).toFixed(2)}
                      </span>
                      {getOriginalPrice(product) && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                          ₪{getOriginalPrice(product)?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Modal */}
          <Dialog.Root open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
              <Dialog.Content className="fixed z-50 top-1/2 left-1/2 w-[90vw] max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 transform -translate-x-1/2 -translate-y-1/2">
                {quickViewProduct && (
                  <>
                    <div className="flex flex-col items-center">
                      <Image
                        src={quickViewProduct.images?.[0] || "/placeholder.svg"}
                        alt={quickViewProduct.title}
                        width={200}
                        height={200}
                        className="object-cover rounded-lg mb-4"
                      />
                      <h2 className="text-lg font-bold mb-2">{quickViewProduct.title}</h2>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">{quickViewProduct.desc}</p>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-blue-600">
                          ₪{getDisplayPrice(quickViewProduct).toFixed(2)}
                        </span>
                        {getOriginalPrice(quickViewProduct) && (
                          <span className="text-xs text-gray-500 line-through">
                            ₪{getOriginalPrice(quickViewProduct)?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Dialog.Close className="absolute top-2 right-2 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                      إغلاق
                    </Dialog.Close>
                  </>
                )}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

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
    </section>
  );
}
