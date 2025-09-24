"use client";

import type { Product, ProductFeatureLabel, ProductFeatureValue } from "../../../lib/type";
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
  Eye,
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
  const [featureLabels, setFeatureLabels] = useState<ProductFeatureLabel[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<Record<number, number[]>>({});
  const [featuresPrice, setFeaturesPrice] = useState(0);

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

  // جلب الميزات من Supabase
  useEffect(() => {
    async function fetchFeatures() {
      const { data: labels } = await supabase
        .from("products_features_labels")
        .select("*")
        .eq("product_id", product.id);

      if (labels) {
        const labelsWithValues = await Promise.all(
          labels.map(async (label: ProductFeatureLabel) => {
            const { data: values } = await supabase
              .from("products_features_values")
              .select("*")
              .eq("feature_label_id", label.id);
            return { ...label, values: values || [] };
          })
        );
        setFeatureLabels(labelsWithValues);
      }
    }
    if (product?.id) fetchFeatures();
  }, [product?.id]);

  // حساب سعر الميزات المختارة
  useEffect(() => {
    let sum = 0;
    featureLabels.forEach(label => {
      const valueIds = selectedFeatures[label.id] || [];
      valueIds.forEach(valueId => {
        const value = label.values?.find(v => v.id === valueId);
        if (value) sum += value.price_addition;
      });
    });
    setFeaturesPrice(sum);
  }, [selectedFeatures, featureLabels]);

  const handleSelectFeature = (labelId: number, valueId: number) => {
    setSelectedFeatures(prev => {
      const current = prev[labelId] || [];
      if (current.includes(valueId)) {
        return { ...prev, [labelId]: current.filter(id => id !== valueId) };
      } else {
        return { ...prev, [labelId]: [...current, valueId] };
      }
    });
  };

  const totalPrice = (Number(product.sale_price ?? product.price) + featuresPrice) * quantity;

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

      {/* Main Product Layout - Mobile First */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Product Images Section - Full width on mobile */}
        <div className="lg:col-span-2">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            {/* Main Product Image */}
            <div className="flex-1 relative order-1 lg:order-2">
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 lg:p-8">
                <div className="relative aspect-square max-h-[600px] flex items-center justify-center">
                  <ImageLightbox
                    images={product.images}
                    currentIndex={activeImage}
                    isOpen={lightboxOpen}
                    onClose={() => setLightboxOpen(false)}
                    productName={product.title}
                  />
                  
                  <div 
                    className="w-full h-full cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => {
                      const startX = e.clientX;
                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        if (deltaX > 50) {
                          setActiveImage(prev => prev > 0 ? prev - 1 : product.images.length - 1);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        } else if (deltaX < -50) {
                          setActiveImage(prev => prev < product.images.length - 1 ? prev + 1 : 0);
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        }
                      };
                      
                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                      };
                      
                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                    }}
                    onTouchStart={(e) => {
                      const startX = e.touches[0].clientX;
                      const handleTouchMove = (moveEvent: TouchEvent) => {
                        const deltaX = moveEvent.touches[0].clientX - startX;
                        if (deltaX > 50) {
                          setActiveImage(prev => prev > 0 ? prev - 1 : product.images.length - 1);
                          document.removeEventListener('touchmove', handleTouchMove);
                          document.removeEventListener('touchend', handleTouchEnd);
                        } else if (deltaX < -50) {
                          setActiveImage(prev => prev < product.images.length - 1 ? prev + 1 : 0);
                          document.removeEventListener('touchmove', handleTouchMove);
                          document.removeEventListener('touchend', handleTouchEnd);
                        }
                      };
                      
                      const handleTouchEnd = () => {
                        document.removeEventListener('touchmove', handleTouchMove);
                        document.removeEventListener('touchend', handleTouchEnd);
                      };
                      
                      document.addEventListener('touchmove', handleTouchMove);
                      document.addEventListener('touchend', handleTouchEnd);
                    }}
                  >
                    <img
                      src={product.images[activeImage] || "/placeholder.svg"}
                      alt={product.title}
                      className="object-contain h-full w-full transition-transform duration-300 hover:scale-105"
                      onClick={() => setLightboxOpen(true)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Mobile Image Indicator Dots */}
              <div className="flex justify-center mt-4 gap-2 lg:hidden">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeImage === idx
                        ? "bg-gray-900 dark:bg-white w-4"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Gallery - Hidden on mobile */}
            <div className="hidden lg:flex flex-col gap-3 order-1">
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
                    alt={`${product.title} - Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 lg:p-6 shadow-sm lg:shadow-lg">
            {/* Back Button - Mobile Only */}
            <button className="flex items-center text-gray-500 dark:text-gray-400 mb-4 lg:hidden">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Back</span>
            </button>
            
            {/* Product Title & Rating */}
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {product.title}
              </h1>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
  
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="ml-1 text-xs text-gray-500">{product.view_count ?? 0} </span>
                  </div>
                </div>
                {/* Favorite Button */} 
                <button 
                  onClick={() => toggleFavorite({
                    id: Number(product.id),
                    name: product.title,
                    price: Number(product.price),
                    discountedPrice: product.sale_price ?? Number(product.price),
                    image: product.images?.[0] || "",
                    store: product.shops?.shop_name || "",
                    rating: product.rating ?? 0,
                    reviews: product.reviews ?? 0,
                    inStock: product.active
                  })} 
                  className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${ 
                    isFavorite(Number(product.id)) 
                      ? "bg-red-500 text-white shadow-lg" 
                      : "bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700" 
                  }`} 
                > 
                  <Heart 
                    size={16} 
                    fill={isFavorite(Number(product.id)) ? "currentColor" : "none"} 
                  /> 
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ₪{product.sale_price ?? product.price}
              </div>
              {product.sale_price && product.sale_price !== Number(product.price) && (
                <div className="text-sm text-gray-500 line-through">
                  ₪{product.price}
                </div>
              )}
            </div>

            {/* Description - Mobile Only */}
            <div className="mb-5 lg:hidden">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.desc || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna."}
              </p>
            </div>

           

            {/* Feature Selection */}
            {featureLabels.length > 0 && (
              <div className="mb-5">
                {featureLabels.map(label => (
                  <div key={label.id} className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label.label}
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {label.values?.map(value => {
                        const isSelected = (selectedFeatures[label.id] || []).includes(value.id);
                        return (
                          <button
                            key={value.id}
                            onClick={() => (value.available === false ? null : handleSelectFeature(label.id, value.id))}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-all
                              ${isSelected ? "border-blue-600 bg-blue-50 dark:bg-blue-900/30 font-bold" : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"}
                              ${!value.available ? "opacity-60 cursor-not-allowed" : ""}
                            `}
                            disabled={value.available === false}
                          >
                            {value.image && (
                              <img src={value.image} alt={value.value} className="w-6 h-6 rounded-full" />
                            )}
                            <span>{value.value}</span>
                            {value.price_addition > 0 && (
                              <span className="text-xs text-gray-500">+₪{value.price_addition}</span>
                            )}
                            {value.available === false && (
                              <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">Not Available</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity
              </label>
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden w-max">
                <button
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="px-4 py-2 min-w-[40px] text-center font-medium">
                  {quantity}
                </div>
                <button
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Total Price - Mobile Only */}
            <div className="flex justify-between items-center mb-5 lg:hidden">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total price</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">₪{totalPrice.toFixed(2)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-5">
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
                className="flex-1 py-3 px-4 border-2 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                Add to cart
              </button>
              <button className="flex-1 py-3 px-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm">
                Buy it now
              </button>
            </div>

            {/* Product Description - Desktop Only */}
            <div className="hidden lg:block mb-6">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {product.desc || "Celebrate the power and simplicity of the Swoosh. This warm, brushed fleece hoodie is made with some extra room through the shoulder."}
              </p>
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
    <div className="mb-8">
     
    </div>
  );
}
