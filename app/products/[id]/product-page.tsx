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

async function incrementProductCartCount(productId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("cart_count")
    .eq("id", productId)
    .single();

  if (error || !data) return;

  const newCount = (data.cart_count ?? 0) + 1;

  await supabase.from("products").update({ cart_count: newCount }).eq("id", productId);
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
    return <div className="p-4 text-red-500">المنتج غير موجود أو حدث خطأ.</div>;

  return (
    <div className="w-full max-w-[1000px] mx-auto py-4 px-2 xs:px-4 sm:px-6">
      {/* الصور + تفاصيل المنتج */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* صور المنتج */}
        <div>
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mb-4 h-64 sm:h-80 flex items-center justify-center relative cursor-pointer group"
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
            />
            <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              اضغط لتكبير الصورة
            </span>
          </div>

          {/* صور مصغرة قابلة للتمرير */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`flex-shrink-0 border-2 rounded-lg w-20 h-20 overflow-hidden transition ${
                  activeImage === idx
                    ? "border-blue-600 scale-105 shadow-md"
                    : "border-gray-200 dark:border-gray-700"
                }`}
                aria-label={`صورة ${idx + 1}`}
              >
                <img
                  src={img || "/placeholder.svg"}
                  alt={`${product.title} - صورة ${idx + 1}`}
                  className="object-contain w-full h-full"
                />
              </button>
            ))}
          </div>

          {/* أزرار المشاركة */}
          <div className="flex gap-2 mt-3 justify-center sm:justify-start flex-wrap">
            {[
              { title: "طباعة", icon: Printer, type: "print" },
              { title: "واتساب", icon: MessageCircle, type: "whatsapp" },
              { title: "نسخ الرابط", icon: Copy, type: "copy" },
              { title: "مشاركة", icon: Share2, type: "share" },
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.title}
                  title={btn.title}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare(btn.type);
                  }}
                  className="bg-white/80 dark:bg-gray-900/60 rounded-full p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                >
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
        </div>

        {/* تفاصيل المنتج */}
        <div className="flex flex-col justify-between gap-4">
          <div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">
              {product.title}
            </h1>
            <p className="text-sm xs:text-base text-gray-500 dark:text-gray-400 mb-1">
              المتجر:{" "}
              <span className="font-semibold">{product.shops?.shop_name ?? ""}</span>
            </p>

            <ProductRating
              rating={product.rating ?? 0}
              reviews={product.reviews ?? 0}
            />

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
              <span className="text-2xl xs:text-3xl font-bold text-primary">
                ₪{product.sale_price ?? product.price}
              </span>
              {product.sale_price &&
                product.sale_price !== Number(product.price) && (
                  <span className="text-gray-400 line-through text-lg">
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

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
              {product.desc}
            </p>

            {product.categories?.title && (
              <div className="mt-2 text-sm text-gray-500">
                التصنيف:{" "}
                <span className="font-semibold">{product.categories.title}</span>
              </div>
            )}

            {/* خيارات السعة واللون */}
            <div className="flex flex-wrap gap-2 mt-4">
              {["128GB", "256GB", "512GB"].map((capacity) => (
                <button
                  key={capacity}
                  onClick={() => setSelectedCapacity(capacity)}
                  className={`px-3 py-1 border rounded-md text-sm font-medium transition ${
                    selectedCapacity === capacity
                      ? "border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                      : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  {capacity}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {["Black", "White", "Blue", "Red"].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1 border rounded-md text-sm font-medium transition ${
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

      {/* الكمية + السلة + المفضلة */}
<div className="flex gap-2 w-full justify-center items-center mt-4 flex-nowrap">
  {/* الكمية */}
  <div className="flex border border-gray-300 dark:border-gray-600 rounded-full overflow-hidden w-max bg-gray-50 dark:bg-gray-800">
    <button
      className="h-10 w-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      onClick={() => setQuantity(Math.max(1, quantity - 1))}
      aria-label="إنقاص الكمية"
    >
      <Minus size={16} />
    </button>
    <div className="h-10 w-12 flex items-center justify-center font-semibold text-lg select-none bg-transparent">
      {quantity}
    </div>
    <button
      className="h-10 w-10 flex items-center justify-center text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      onClick={() => setQuantity(quantity + 1)}
      aria-label="زيادة الكمية"
    >
      <Plus size={16} />
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
      await incrementProductCartCount(product.id);
    }}
    className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
    aria-label="أضف إلى السلة"
  >
    <ShoppingCart className="h-5 w-5" />
  </button>

  {/* المفضلة */}
  <button
    className={`h-10 w-10 flex items-center justify-center rounded-full border transition-all duration-200 ${
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
      size={16}
      fill={isFavorite?.(Number(product.id)) ? "currentColor" : "none"}
      className={
        isFavorite?.(Number(product.id)) ? "text-white" : "text-red-500"
      }
    />
  </button>
</div>

        </div>
      </div>

      {/* التبويبات */}
      <div className="mt-6">
        <ProductTabs
          description={product.desc}
          specifications={[]}
          reviewsCount={product.reviews ?? 0}
        />
      </div>

      منتجات مشابهة
      {similarProducts.length > 0 && (
        <div className="mt-6">
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

      {/* عداد المشاهدات */}
      <ProductViewCounter productId={product.id} currentCount={product.view_count} />
    </div>
  );
}
