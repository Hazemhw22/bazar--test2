"use client";

import type { Product } from "../../../lib/type";
import { useCart } from "../../../components/cart-provider";
import { useFavorites } from "../../../components/favourite-items";
import { ImageLightbox } from "@/components/image-lightbox";
import ProductTabs from "@/components/ProductTabs";
import ProductRating from "@/components/ProductRating";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Heart,
  Minus,
  Plus,
  Printer,
  Share2,
  Copy,
  MessageCircle,
} from "lucide-react";
import SuggestedProduct from "../../../components/SuggestedProductsCarousel";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { ProductViewCounter } from "@/components/ProductViewCounter";

// دالة زيادة عدد مرات الإضافة للسلة
// Supabase function to increment product cart count
async function incrementProductCartCount(productId: string) {
  const { data, error } = await supabase.from("products").select("cart_count").eq("id", productId).single()

  if (error || !data) return

  const newCount = (data.cart_count ?? 0) + 1

  await supabase.from("products").update({ cart_count: newCount }).eq("id", productId)
}

type ProductDetailProps = {
  params: { id: string };
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem: addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites?.() ?? {
    isFavorite: () => false,
    toggleFavorite: () => {},
  };
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedCapacity, setSelectedCapacity] = useState("128GB");
  const [selectedColor, setSelectedColor] = useState("Black");

  useEffect(() => {
    if (!product.category) return;
    supabase
      .from("products")
      .select("*")
      .eq("category", product.category)
      .neq("id", product.id)
      .limit(8)
      .then(({ data }) => setSimilarProducts(data || []));
  }, [product.category, product.id]);

  const handleShare = (type: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = `شاهد هذا المنتج: ${product.title} - ₪${
      product.sale_price ?? product.price
    }`;
    switch (type) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        break;
      case "print":
        window.print();
        break;
      case "share":
        if (navigator.share) {
          navigator.share({ title: product.title, text, url });
        }
        break;
    }
  };

  if (!product)
    return <div className="p-6 text-red-500">المنتج غير موجود أو حدث خطأ.</div>;

  return (
    <div className="w-full max-w-3xl mx-auto py-6 px-2 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* صور المنتج */}
        <div>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-6 h-96 flex items-center justify-center relative cursor-pointer group"
            onClick={() => setLightboxOpen(true)}
          >
            <ImageLightbox
              images={product.images}
              currentIndex={activeImage}
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
              productName={product.title}
            />
            <img
              src={product.images[activeImage] || "/placeholder.svg"}
              alt={product.title}
              className="object-contain h-full w-full transition-transform duration-300 group-hover:scale-105"
              style={{ maxHeight: 380 }}
            />
            <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
              اضغط لتكبير الصورة
            </span>
          </div>
          {/* أزرار المشاركة أسفل الصورة في كل الشاشات */}
          <div className="flex gap-2 justify-center mb-4">
            <button
              title="طباعة"
              onClick={(e) => {
                e.stopPropagation();
                handleShare("print");
              }}
              className="bg-white/80 dark:bg-gray-900/60 rounded-full p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
            >
              <Printer size={18} />
            </button>
            <button
              title="واتساب"
              onClick={(e) => {
                e.stopPropagation();
                handleShare("whatsapp");
              }}
              className="bg-white/80 dark:bg-gray-900/60 rounded-full p-2 hover:bg-green-100 dark:hover:bg-green-900/40 transition"
            >
              <MessageCircle size={18} />
            </button>
            <button
              title="نسخ الرابط"
              onClick={(e) => {
                e.stopPropagation();
                handleShare("copy");
              }}
              className="bg-white/80 dark:bg-gray-900/60 rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-800/40 transition"
            >
              <Copy size={18} />
            </button>
            <button
              title="مشاركة"
              onClick={(e) => {
                e.stopPropagation();
                handleShare("share");
              }}
              className="bg-white/80 dark:bg-gray-900/60 rounded-full p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
            >
              <Share2 size={18} />
            </button>
          </div>
          <div className="flex gap-2 justify-center">
            {product.images.map((image, index) => (
              <button
                key={index}
                className={`border-2 rounded-lg overflow-hidden w-16 h-16 transition-all duration-200 ${
                  activeImage === index
                    ? "border-blue-600 scale-110 shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400"
                }`}
                onClick={() => setActiveImage(index)}
                aria-label={`صورة ${index + 1}`}
              >
                <img
                  src={image || "/placeholder.svg"}
                  alt={`${product.title} - صورة ${index + 1}`}
                  className="object-contain w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* تفاصيل المنتج */}
        <div className="flex flex-col justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold mb-3 text-gray-900 dark:text-white">
              {product.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-2 text-lg">
              المتجر:{" "}
              <span className="font-semibold">
                {product.shops?.shop_name ?? ""}
              </span>
            </p>
            <ProductRating
              rating={product.rating ?? 0}
              reviews={product.reviews ?? 0}
            />
            <div className="flex items-center gap-4 my-6">
              <span className="text-3xl font-bold text-primary">
                ₪{product.sale_price ?? product.price}
              </span>
              {product.sale_price &&
                product.sale_price !== Number(product.price) && (
                  <span className="text-gray-400 line-through text-xl">
                    ₪{product.price}
                  </span>
                )}
              {product.discount_type && product.discount_value && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  خصم{" "}
                  {product.discount_type === "percentage"
                    ? `${product.discount_value}%`
                    : `₪${product.discount_value}`}
                </span>
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {product.desc}
            </p>
            {product.categories?.title && (
              <div className="mt-2 text-sm text-gray-500">
                التصنيف:{" "}
                <span className="font-semibold">
                  {product.categories.title}
                </span>
              </div>
            )}

            {/* خيارات المنتج (سعة/لون) - عدل حسب بياناتك الفعلية */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  اختر السعة:
                </label>
                <div className="flex gap-2">
                  {["128GB", "256GB", "512GB"].map((capacity) => (
                    <button
                      key={capacity}
                      onClick={() => setSelectedCapacity(capacity)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedCapacity === capacity
                          ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      {capacity}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  اختر اللون:
                </label>
                <div className="flex gap-2">
                  {["Black", "White", "Blue", "Red"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                        selectedColor === color
                          ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الكمية + السلة + المفضلة في صف واحد دائماً وبنفس تصميم الكارت */}
          <div className="flex gap-3 w-full justify-center sm:justify-start mt-4 items-center">
            {/* الكمية */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-full overflow-hidden w-max bg-gray-50 dark:bg-gray-800">
              <button
                className="h-12 w-12 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="إنقاص الكمية"
              >
                <Minus size={20} />
              </button>
              <div className="h-12 w-16 flex items-center justify-center font-semibold text-lg select-none bg-transparent">
                {quantity}
              </div>
              <button
                className="h-12 w-12 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="زيادة الكمية"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* زر السلة */}
            <button
              onClick={async () => {
                addToCart({
                  id: Number(product.id),
                  name: product.title,
                  price: Number(product.sale_price ?? product.price),
                  image: product.images?.[0] || "",
                  quantity,
                });
                await incrementProductCartCount((product.id));
              }}
              className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
              aria-label="أضف إلى السلة"
            >
              <ShoppingCart className="h-6 w-6" />
            </button>

            {/* زر المفضلة */}
            <button
              className={`h-12 w-12 flex items-center justify-center rounded-full border transition-all duration-200 ${
                isFavorite?.(Number(product.id))
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
              }`}
              onClick={() =>
                toggleFavorite?.({
                  id: Number(product.id),
                  name: product.title,
                  price: Number(product.price),
                  discountedPrice: Number(product.sale_price ?? product.price),
                  rating: Number(product.rating ?? 0),
                  reviews: Number(product.reviews ?? 0),
                  image: product.images?.[0] || "",
                  store: product.shops?.shop_name ?? "",
                })
              }
              aria-label={
                isFavorite?.(Number(product.id))
                  ? "إزالة من المفضلة"
                  : "إضافة إلى المفضلة"
              }
            >
              <Heart
                size={20}
                fill={isFavorite?.(Number(product.id)) ? "currentColor" : "none"}
                className={
                  isFavorite?.(Number(product.id)) ? "text-white" : "text-red-500"
                }
              />
            </button>
          </div>
        </div>
      </div>

      {/* استخدم فقط ProductTabs لعرض التبويبات والمحتوى */}
      <div className="mb-16">
        <ProductTabs
          description={product.desc}
          specifications={[]}
          reviewsCount={product.reviews ?? 0}
        />
      </div>

      {/* منتجات مشابهة */}
      {similarProducts.length > 0 && (
        <div className="mt-20">
          <SuggestedProduct
            products={similarProducts.map((p) => ({
              id: Number(p.id),
              name: p.title,
              price: Number(p.price),
              discountedPrice: Number(p.sale_price ?? p.price),
              rating: Number(p.rating ?? 0),
              reviews: Number(p.reviews ?? 0),
              image: p.images?.[0] || "",
              store: p.shops?.shop_name ?? "",
              category: String(p.category ?? ""),
              description: p.desc,
            }))}
            title="منتجات مشابهة"
          />
        </div>
      )}

      {/* عداد المشاهدات - ضعها في النهاية حتى لا تؤثر على التخطيط */}
      <ProductViewCounter productId={product.id} currentCount={product.view_count} />
    </div>
  );
}
