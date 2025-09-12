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
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
  Truck,
  Info,
} from "lucide-react";
import SuggestedProductCard from "@/components/SuggestedProductCard";
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
  const [selectedColor, setSelectedColor] = useState("Purple");
  const [expandedSections, setExpandedSections] = useState({
    description: false,
    shipping: false,
    details: false,
  });

  // Function to render product content based on type
  const renderProductContent = () => {
    if (!product) return null;
    
    // For now, show default content since type field is not in database yet
    return <DefaultProductContent product={product} />;
  };

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!product)
    return <div className="p-4 text-red-500">المنتج غير موجود أو حدث خطأ.</div>;

  return (
    <div className="w-full max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8 mobile:max-w-[480px]">
      {/* Product Type Header */}
      {renderProductContent()}

      {/* Main Product Layout - Nike Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section - Product Images (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="flex gap-6">
            {/* Thumbnail Gallery */}
            <div className="hidden lg:flex flex-col gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 border-2 rounded-lg overflow-hidden transition-all ${
                    activeImage === idx
                      ? "border-blue-600 scale-105 shadow-lg"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`${product.title} - صورة ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main Product Image */}
            <div className="flex-1 relative">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-8">
                <div className="relative aspect-square max-h-[600px] flex items-center justify-center">
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
                    className="object-contain h-full w-full transition-transform duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                  />

                  {/* Navigation Arrows */}
                  <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                    <button
                      onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                      className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                      className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:bg-white dark:hover:bg-gray-800 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Product Details (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl p-6 shadow-lg">
            {/* Product Title & Rating */}
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium">5.0</span>
                </div>
                <span className="text-sm text-gray-500">(0 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                ₪{product.sale_price ?? product.price}
              </div>
              {product.sale_price && product.sale_price !== Number(product.price) && (
                <div className="text-lg text-gray-500 line-through">
                  ₪{product.price}
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Pay in 4 interest-free installments for orders over ₪50.00 with{" "}
                <span className="text-blue-600 dark:text-blue-400 font-medium">Shop Pay</span>{" "}
                <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer">Learn more</span>
              </p>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Color
              </label>
              <div className="flex gap-3">
                {["Purple", "Dark Green", "Black", "Pink"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? "border-blue-600 scale-110 shadow-lg"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                    }`}
                    style={{
                      backgroundColor: color === "Purple" ? "#8b5cf6" : 
                                   color === "Dark Green" ? "#059669" : 
                                   color === "Black" ? "#000000" : "#ec4899"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Size
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["S", "M", "L", "XL", "XXL", "3XL"].map((size) => (
                  <button
                    key={size}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden w-max">
                <button
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="px-4 py-2 min-w-[60px] text-center font-medium">
                  {quantity.toString().padStart(2, '0')}
                </div>
                <button
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
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
                className="w-full py-3 px-6 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Add to cart
              </button>
              <button className="w-full py-3 px-6 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                Buy it now
              </button>
            </div>

            {/* Product Description */}
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.desc || "Celebrate the power and simplicity of the Swoosh. This warm, brushed fleece hoodie is made with some extra room through the shoulder."}
              </p>
            </div>

            {/* Collapsible Sections */}
            <div className="space-y-3">
              {[
                { key: 'description', title: 'Description', icon: Info },
                { key: 'shipping', title: 'Shipping & Returns', icon: Truck },
                { key: 'details', title: 'Details', icon: Package }
              ].map(({ key, title, icon: Icon }) => (
                <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    onClick={() => toggleSection(key as keyof typeof expandedSections)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                    </div>
                    <ChevronRight 
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedSections[key as keyof typeof expandedSections] ? 'rotate-90' : ''
                      }`} 
                    />
                  </button>
                  {expandedSections[key as keyof typeof expandedSections] && (
                    <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-400">
                      {key === 'description' && (
                        <p>Detailed product description and features will be displayed here.</p>
                      )}
                      {key === 'shipping' && (
                        <p>Shipping information, delivery times, and return policy details.</p>
                      )}
                      {key === 'details' && (
                        <p>Product specifications, materials, care instructions, and other technical details.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-12">
        <ProductTabs
          description={product.desc}
          specifications={[]}
          reviewsCount={product.reviews ?? 0}
        />
      </div>

      {/* View Counter */}
      <ProductViewCounter productId={product.id} currentCount={product.view_count} />
    </div>
  );
}

// Product Type Components
interface ProductContentProps {
  product: Product;
}

// Default Product Content
function DefaultProductContent({ product }: ProductContentProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🏪</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">منتج عام</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">منتج متنوع</p>
        </div>
      </div>
    </div>
  );
}
