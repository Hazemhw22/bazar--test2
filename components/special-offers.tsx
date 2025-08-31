"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Heart, Plus, Star } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/type";

export function SpecialOffers() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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
          shop,
          title,
          desc,
          category,
          price,
          sale_price,
          discount_type,
          discount_value,
          images,
          view_count,
          active,
          created_at
        `)
        .or('sale_price.not.is.null,discount_type.not.is.null')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        setError("فشل تحميل المنتجات.");
        return;
      }

      const transformedProducts: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        shop: p.shop || "Unknown Shop",
        title: p.title,
        desc: p.desc || "",
        category: p.category ?? null,
        price: p.price || "0",
        sale_price: p.sale_price ?? null,
        discount_type: p.discount_type ?? null,
        discount_value: p.discount_value ?? null,
        images: p.images || [],
        view_count: p.view_count || 0,
        active: p.active,
        created_at: p.created_at,
      }));

      setProducts(transformedProducts);

    } catch (err) {
      console.error('Error fetching special offer products:', err);
      setError("حدث خطأ غير متوقع.");
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
    if (!container) return;

    const scrollAmount = 300;
    const newScrollLeft = direction === "left" 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });

    setTimeout(() => checkScrollPosition(), 300);
  };

  const checkScrollPosition = () => {
    const container = document.getElementById("special-offers-container");
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
  };

  if (loading) return <p className="p-6 text-center">جارٍ تحميل المنتجات...</p>;
  if (error) return (
    <div className="p-6 text-center text-red-500">
      {error} <button onClick={fetchSpecialOfferProducts} className="ml-2 underline">إعادة المحاولة</button>
    </div>
  );
  if (products.length === 0) return <p className="p-6 text-center">لا توجد عروض خاصة حالياً.</p>;

  return (
    <section className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Special Offer</h2>
          <Link href="/products?filter=special-offers" className="text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors">
            See All
          </Link>
        </div>

        {/* Products Scroll */}
        <div className="relative group">
          {showLeftArrow && (
            <button onClick={() => handleScroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-opacity opacity-0 group-hover:opacity-100">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          {showRightArrow && (
            <button onClick={() => handleScroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-opacity opacity-0 group-hover:opacity-100">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          <div id="special-offers-container" className="flex gap-4 overflow-x-auto scrollbar-hide pb-4" onScroll={checkScrollPosition}>
            {products.map(product => (
              <div key={product.id} className="flex-shrink-0 w-64 sm:w-72 md:w-80">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                    )}

                    {getDiscountText(product) && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-full">
                        {getDiscountText(product)}
                      </div>
                    )}

                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <button className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Heart className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      <button className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">{product.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">${getDisplayPrice(product).toFixed(2)}</span>
                      {getOriginalPrice(product) && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">${getOriginalPrice(product)?.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{product.view_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}
