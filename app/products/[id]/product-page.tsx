"use client";

import type { Product, ProductFeatureLabel, ProductFeatureValue } from "../../../lib/types";
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
import { useI18n } from "../../../lib/i18n";
import { supabase } from "../../../lib/supabase";
import { ProductViewCounter } from "@/components/ProductViewCounter";

async function incrementProductCartCount(productId: string) {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("cart_count")
      .eq("id", productId)
      .single();

    if (error || !data) return;

    const newCount = (data.cart_count ?? 0) + 1;

    await supabase.from("products").update({ cart_count: newCount }).eq("id", productId);
  } catch (error) {
    // Silently fail if cart_count column doesn't exist
    console.warn("Could not increment cart count:", error);
  }
}

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const { t } = useI18n()
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
  const [selectedSize, setSelectedSize] = useState<number | null>(37);
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
    if (!product.category_id) return;
    supabase
      .from("products")
      .select("*")
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(8)
      .then(({ data }) => setSimilarProducts((data || []) as unknown as Product[]));
  }, [product.category_id, product.id]);

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
              // DB column is `feature_id` in the new schema
              .eq("feature_id", label.id);
            // normalize values to the UI shape used across the codebase
            const normalizedValues = (values || []).map((v: any) => ({
              ...v,
              // old UI expects `value` and `image` fields
              value: v.name ?? v.value ?? "",
              image: v.image_url ?? v.image ?? null,
            }));
            return { ...label, // preserve original fields
              // UI expects `label.label` in templates — mirror from `name`
              label: String((label as any).name ?? (label as any).label ?? ""),
              values: normalizedValues,
            };
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
      const labelId = Number(label.id ?? -1);
      const valueIds = selectedFeatures[labelId] || [];
      valueIds.forEach(valueId => {
        const value = label.values?.find((v: any) => v.id === valueId);
        if (value) sum += Number(value.price_addition ?? 0);
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
    const text = `شاهد هذا المنتج: ${product.name} - ₪${
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
          navigator.share({ title: product.name, text, url });
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

  /* Helper function to get the correct image based on priority */
  const getProductImages = (product: Product) => {
    // Main image: prioritize image_url, then first image from images array
    const mainImage = product.image_url || (product.images && product.images[0]) || "/pngimg.com - sony_playstation_PNG17546.png";
    
    // Gallery images: use images array if available, otherwise create array with main image
    const galleryImages = product.images && product.images.length > 0 
      ? product.images 
      : [mainImage];
    
    return { mainImage, galleryImages };
  };

  const { mainImage, galleryImages } = getProductImages(product);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1f1530] via-[#281a39] to-[#2a2340] text-white flex flex-col items-center py-6 px-4">

      {/* Product Card */}
      <div className="w-full max-w-md  p-4 mb-4">
        {/* Main image */}
        <div className="relative ">
          <div className="rounded-xl ">
            <img src={String(galleryImages[activeImage] ?? mainImage)} alt={String(product.name ?? "")} className="w-full h-64 object-contain rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]" />
          </div>

          {/* small thumbnails (moved below image) */}
          <div className="mt-3 flex justify-center gap-3">
            {galleryImages.slice(0,3).map((img: any, idx: number) => (
              <button key={idx} onClick={() => setActiveImage(idx)} className={`w-14 h-14 rounded-lg p-1 bg-[rgba(0,0,0,0.35)] border ${activeImage===idx? 'border-white':'border-[rgba(255,255,255,0.06)]'}`}>
                <img src={String(img ?? '/placeholder.svg')} alt={`thumb-${idx}`} className="w-full h-full object-contain rounded-md" />
              </button>
            ))}
          </div>

          {/* Actions under images: WhatsApp, Share, Favorite */}
      <div className="w-full max-w-md mb-4 mt-4 flex justify-center">
        <div className="bg-[rgba(0,0,0,0.28)] border border-[rgba(255,255,255,0.08)] rounded-2xl p-2 flex items-center gap-3">
          <button
            onClick={() => handleShare('whatsapp')}
            aria-label="Share on WhatsApp"
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-white"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.52 3.478A11.955 11.955 0 0012 0C5.373 0 .001 5.373 0 12c0 2.12.555 4.184 1.606 6.008L0 24l6.144-1.61A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12 0-3.207-1.247-6.213-3.48-8.522zM12 21.6c-1.95 0-3.86-.52-5.53-1.5l-.4-.24-3.64.95.97-3.55-.26-.41A9.6 9.6 0 012.4 12c0-5.31 4.29-9.6 9.6-9.6 2.56 0 4.95.99 6.75 2.79A9.498 9.498 0 0121.6 12c0 5.31-4.29 9.6-9.6 9.6z" />
              <path d="M17.22 14.83c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.72.16-.23.32-.88 1.03-1.08 1.24-.2.2-.4.24-.73.08-.33-.16-1.39-.51-2.64-1.62-.98-.87-1.64-1.95-1.84-2.28-.2-.32-.02-.49.14-.65.15-.15.33-.4.5-.6.16-.2.22-.33.33-.55.11-.22.05-.41-.02-.57-.07-.16-.72-1.74-1-2.39-.26-.62-.52-.54-.72-.55-.18-.01-.39-.01-.59-.01-.2 0-.52.08-.79.39-.27.31-1.03 1.01-1.03 2.47 0 1.45 1.06 2.86 1.2 3.06.15.2 2.07 3.34 5.02 4.68 2.95 1.34 2.95.89 3.48.83.53-.06 1.72-.7 1.97-1.38.25-.68.25-1.27.18-1.38-.07-.11-.28-.17-.6-.33z" fill="#fff" />
            </svg>
            <span className="text-xs text-[rgba(255,255,255,0.85)]">{t("share.whatsapp")}</span>
          </button>

          <button
            onClick={() => handleShare('share')}
            aria-label="Share"
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-white"
          >
            <Share2 size={28} />
            <span className="text-xs text-[rgba(255,255,255,0.85)]">{t("share.share")}</span>
          </button>

          <button
            onClick={() =>
                toggleFavorite({
                id: Number(product.id),
                name: String(product.name ?? ""),
                price: Number(product.price) || 0,
                discountedPrice: Number(product.sale_price ?? product.price) || 0,
                image: mainImage,
                store: String(product.shops?.name ?? ""),
                rating: Number((product as any).rating ?? 0),
                reviews: Number((product as any).reviews ?? 0),
                inStock: Boolean(product.onsale),
              })
            }
            aria-label="Add to favorites"
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-white"
          >
            <Heart size={28} className={isFavorite(Number(product.id)) ? 'text-rose-400' : 'text-white'} fill={isFavorite(Number(product.id)) ? 'currentColor' : 'none'} />
            <span className="text-xs text-[rgba(255,255,255,0.85)]">{t("product.favorite")}</span>
          </button>
        </div>
      </div>
        </div>
      </div>

      {/* Title + Price */}
      <div className="w-full max-w-md flex items-center justify-between px-1 mb-3">
        <h3 className="text-xl font-semibold">{product.name}</h3>
            <div className="text-right">
          <div className="text-xl font-bold">{totalPrice}₪</div>
          <div className="text-sm text-[rgba(255,255,255,0.6)] mt-1">{String(product.shops?.name ?? '')}</div>
        </div>
      </div>

      {/* Feature labels (sizes, colors, etc.) rendered from featureLabels */}
      {featureLabels.map((label) => (
        <div key={label.id} className="w-full max-w-md mb-4 px-2">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-xl">{label.label}</span>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            {(label.values || []).map((v: any) => {
              const active = (selectedFeatures[label.id] || []).includes(v.id);
              const isNumber = /^\d+$/.test(String(v.value));

              // Numeric values: render as size-like square buttons
              if (isNumber) {
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelectFeature(label.id, v.id)}
                    className={`relative w-14 h-14 rounded-lg flex items-center justify-center text-white text-lg font-medium transition-all ${active ? 'bg-[rgba(59,52,112,0.18)] border-2 border-[#5a4aa3] shadow-[0_6px_20px_rgba(90,74,163,0.12)]' : 'bg-transparent border border-[rgba(255,255,255,0.06)]'}`}
                  >
                    <span>{v.value}</span>
                    {active && (v.price_addition ?? 0) > 0 && (
                      <span className="absolute -bottom-4 right-0 translate-y-1/2 bg-[#2f2f33] text-green-600 text-xs px-2 py-0.5 rounded">+{v.price_addition}₪</span>
                    )}
                  </button>
                );
              }

              // Non-numeric values: render as pill (color/option) buttons
              return (
                <button
                  key={v.id}
                  onClick={() => handleSelectFeature(label.id, v.id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all ${active ? 'bg-[rgba(255,255,255,0.03)] ring-1 ring-[rgba(90,74,163,0.28)] border border-[rgba(255,255,255,0.06)]' : 'bg-transparent border border-[rgba(255,255,255,0.06)]'}`}
                >
                  {v.image || /^#([A-Fa-f0-9]{3,6})$/.test(String(v.value)) ? (
                    <span className="w-4 h-4 rounded-full overflow-hidden" style={/^#([A-Fa-f0-9]{3,6})$/.test(String(v.value)) ? { background: String(v.value) } : undefined}>
                      {v.image ? <img src={v.image as string} alt={String(v.value)} className="w-full h-full object-cover" /> : null}
                    </span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-[rgba(255,255,255,0.06)]" />
                  )}

                  <span className={`text-sm ${active ? 'text-white' : 'text-[rgba(255,255,255,0.85)]'}`}>{v.value}</span>
                  {active && (v.price_addition ?? 0) > 0 && (
                    <span className="ml-2 inline-flex items-center bg-[#2f2f33] text-white text-xs px-2 py-0.5 rounded">₪{v.price_addition}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

    

      {/* overall featuresPrice (hidden here since per-label badges are shown) */}

      {/* Add to list button */}
        <div className="w-full max-w-md mb-6">
          <button onClick={async () => {
            addToCart({ id: Number(product.id), name: String(product.name ?? ''), price: Number(product.sale_price ?? product.price), image: mainImage, quantity });
              await incrementProductCartCount(String(product.id));
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#3b66ff] to-[#7c8ca2] text-white font-bold shadow-[0_10px_30px_rgba(59,102,255,0.3)]">
          {t("product.addToCart")}
        </button>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-md">
            <ProductTabs
          description={String(product.description ?? "")}
          specifications={featureLabels.map((label: any) => ({
            category: String(label.label ?? ""),
            features: (label.values || []).map((v: any) => String(v.value ?? "")),
          }))}
          reviewsCount={Number((product as any).reviews ?? 0)}
        />
      </div>
      

  <ProductViewCounter productId={String(product.id)} currentCount={(product as any).view_count} />
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
