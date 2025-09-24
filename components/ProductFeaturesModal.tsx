"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, XCircle, Check, Plus, ShoppingBag, Minus, Eye } from "lucide-react";
import { Product, ProductFeatureLabel, ProductFeatureValue } from "@/lib/type";
import { useCart } from "./cart-provider";
import { supabase } from "@/lib/supabase";

interface ProductFeaturesModalProps {
  product: Product;
  onClose: () => void;
  isOpen: boolean;
}

export default function ProductFeaturesModal({ product, onClose, isOpen }: ProductFeaturesModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState<Record<number, number[]>>({});
  const [totalPrice, setTotalPrice] = useState<number>(Number(product.price) || 0);
  const [featureLabels, setFeatureLabels] = useState<ProductFeatureLabel[]>([]);
  const [step, setStep] = useState(0);
  const { addItem } = useCart();
  
  const mainImage = product.images?.[0] || "/placeholder.svg";
  const basePrice = Number(product.price) || 0;
  const discountedPrice = product.sale_price ?? basePrice;

  useEffect(() => {
    // Calculate total price based on selected features
    let newTotal = discountedPrice;
    
    if (product.feature_labels) {
      Object.entries(selectedFeatures).forEach(([labelId, valueId]) => {
        const label = product.feature_labels?.find(l => l.id === Number(labelId));
        const value = label?.values?.find(v => (Array.isArray(valueId) ? valueId.includes(v.id) : v.id === valueId));
        if (value) {
          newTotal += value.price_addition;
        }
      });
    }
    
    setTotalPrice(newTotal);
  }, [selectedFeatures, discountedPrice, product.feature_labels]);

  useEffect(() => {
    // حساب السعر بناءً على الميزات المختارة من featureLabels
    let newTotal = discountedPrice;

    featureLabels.forEach(label => {
      const valueIds = selectedFeatures[label.id] || [];
      valueIds.forEach(valueId => {
        const value = label.values?.find(v => v.id === valueId);
        if (value) {
          newTotal += value.price_addition;
        }
      });
    });

    setTotalPrice(newTotal);
  }, [selectedFeatures, discountedPrice, featureLabels]);

  useEffect(() => {
    async function fetchFeatures() {
      // جلب جميع labels للمنتج
      const { data: labels } = await supabase
        .from("products_features_labels")
        .select("*")
        .eq("product_id", product.id);

      if (labels) {
        // جلب جميع values لكل label
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
    if (isOpen) fetchFeatures();
  }, [product.id, isOpen]);

  const handleSelectFeature = (labelId: number, valueId: number) => {
    setSelectedFeatures(prev => {
      const current = prev[labelId] || [];
      // إذا كان موجود احذفه، إذا غير موجود أضفه
      if (current.includes(valueId)) {
        return { ...prev, [labelId]: current.filter(id => id !== valueId) };
      } else {
        return { ...prev, [labelId]: [...current, valueId] };
      }
    });
  };

  const handleAddToCart = () => {
    // Create a features string to display in cart
    const featuresText = Object.entries(selectedFeatures).map(([labelId, valueIds]) => {
      const label = featureLabels.find(l => l.id === Number(labelId));
      const values = label?.values?.filter(v => (valueIds as number[]).includes(v.id));
      return `${label?.label}: ${values?.map(v => v.value).join(", ")}`;
    }).join(", ");

    addItem({
      id: Number(product.id),
      name: product.title,
      price: totalPrice,
      image: mainImage,
      quantity,
      // selectedFeatures: selectedFeatures
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[95vh] p-0 overflow-hidden rounded-xl mobile:rounded-lg mobile:max-w-full mobile:w-full mobile:p-0 dark:bg-gray-900">
        <DialogTitle className="sr-only">{product.title}</DialogTitle>
        
        {/* Close button in top right */}
        <div className="w-full relative">
          {/* السعر الإجمالي أعلى الصورة */}
          <span className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900 text-red-600 dark:text-red-400 font-bold rounded-full px-4 py-2 shadow-lg text-lg z-10">
            ₪{(totalPrice * quantity).toFixed(2)}
          </span>
          <Image
            src={mainImage}
            alt={product.title || "Product"}
            width={600}
            height={400}
            className="w-full h-auto object-contain rounded-t-2xl"
            priority
          />
          <DialogClose className="absolute top-3 right-3 p-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100 hover:text-gray-900 rounded-full shadow z-10">
            <XCircle size={24} />
          </DialogClose>
        </div>

        {/* Product Content */}
        <div className="flex flex-col p-0">
          {/* Product Title and Price Bar */}
          <div className="bg-red-600 dark:bg-red-800 rounded-b-2xl px-4 pt-4 pb-2 text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold truncate">{product.title}</h2>
              <div className="flex items-center bg-white/90 dark:bg-gray-900 rounded-md overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-1 text-red-600"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <span className="px-3 py-1 text-base font-bold min-w-[2rem] text-center text-red-600 bg-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2 py-1 text-red-600"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div className="mt-1 text-sm opacity-90">{product.desc}</div>
          </div>

          {/* Features Section */}
          {featureLabels.length > 0 ? (
            <div className="px-3 py-3 mobile:px-2 mobile:py-2">
              <div className="bg-white dark:bg-gray-900 px-4 py-4 rounded-b-2xl">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{featureLabels[step].label}</h3>
                  <span className="text-gray-500 dark:text-gray-400 text-base">{step + 1}/{featureLabels.length}</span>
                </div>
                <div className="space-y-3">
                  {featureLabels[step].values?.map((value) => {
                    const isSelected = (selectedFeatures[featureLabels[step].id] || []).includes(value.id);
                    return (
                      <div
                        key={value.id}
                        className={`flex items-center justify-between py-2 ${!value.available ? "opacity-60" : ""}`}
                        onClick={() => value.available !== false && handleSelectFeature(featureLabels[step].id, value.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={value.image || "/placeholder.svg"}
                            alt={value.value}
                            width={36}
                            height={36}
                            className="rounded-md"
                          />
                          <span className="font-semibold text-base text-gray-900 dark:text-gray-100">{value.value}</span>
                          {value.price_addition > 0 && (
                            <span className="text-base text-gray-500 font-bold">₪{value.price_addition}</span>
                          )}
                          {!value.available && (
                          <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 font-bold rounded text-xs shadow">Available</span> )}
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-6 h-6 accent-red-600 rounded-md border-2 border-gray-300"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Stepper Buttons */}
              <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-gray-900 rounded-b-2xl">
                <Button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-2 bg-red-600 dark:bg-red-800 text-white rounded-full px-6 py-3 text-base font-bold"
                >
                  <span>Back</span>
                  <span className="text-xl">←</span>
                </Button>
                {step < featureLabels.length - 1 ? (
                  <Button
                    onClick={() => setStep((s) => Math.min(featureLabels.length - 1, s + 1))}
                    className="flex items-center gap-2 bg-red-600 dark:bg-red-800 text-white rounded-full px-6 py-3 text-base font-bold"
                  >
                    <span>Next</span>
                    <span className="text-xl">→</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 bg-red-600 dark:bg-red-800 text-white rounded-full px-6 py-3 text-base font-bold"
                  >
                    <span>Add To Cart</span>
                    <ShoppingBag size={20} />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No customization options available for this product.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}