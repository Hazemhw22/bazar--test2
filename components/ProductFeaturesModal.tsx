"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "./cart-provider";
import { supabase } from "@/lib/supabase";
import { Product, ProductFeatureLabel } from "@/lib/type";
import { XCircle, Minus, Plus, ShoppingBag } from "lucide-react";

interface ProductFeaturesModalProps {
  product: Product;
  onClose: () => void;
  isOpen: boolean;
}

export default function ProductFeaturesModal({
  product,
  onClose,
  isOpen,
}: ProductFeaturesModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<number, number[]>
  >({});
  const [totalPrice, setTotalPrice] = useState<number>(
    Number(product.price) || 0
  );
  const [featureLabels, setFeatureLabels] = useState<ProductFeatureLabel[]>([]);
  const { addItem } = useCart();

  const mainImage = product.images?.[0] || "/placeholder.svg";
  const basePrice = Number(product.price) || 0;
  const discountedPrice = product.sale_price ?? basePrice;

  useEffect(() => {
    let newTotal = discountedPrice;

    if (featureLabels.length > 0) {
      Object.entries(selectedFeatures).forEach(([labelId, valueIds]) => {
        const label = featureLabels.find((l) => l.id === Number(labelId));
        if (label) {
          valueIds.forEach((valueId) => {
            const value = label.values?.find((v) => v.id === valueId);
            if (value) {
              newTotal += value.price_addition;
            }
          });
        }
      });
    }

    setTotalPrice(newTotal);
  }, [selectedFeatures, discountedPrice, featureLabels]);

  useEffect(() => {
    async function fetchFeatures() {
      if (!product.id) return;
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
          // Reset selections when product changes
          setSelectedFeatures({});
        }
    }
    if (isOpen) {
      fetchFeatures();
    }
  }, [product.id, isOpen]);

  const handleSelectFeature = (labelId: number, valueId: number, isMultiSelect: boolean) => {
    setSelectedFeatures((prev) => {
      const currentSelection = prev[labelId] || [];
      if (isMultiSelect) {
        // For multi-select (checkboxes)
        const newSelection = currentSelection.includes(valueId)
          ? currentSelection.filter((id) => id !== valueId)
          : [...currentSelection, valueId];
        return { ...prev, [labelId]: newSelection };
      } else {
        // For single-select (radio), allow deselecting
        const newSelection = currentSelection.includes(valueId)
          ? []
          : [valueId];
        return { ...prev, [labelId]: newSelection };
      }
    });
  };

  const handleAddToCart = () => {
    addItem({
      id: Number(product.id),
      name: product.title,
      price: totalPrice,
      image: mainImage,
      quantity,
    });
    onClose();
  };

  const isMultiSelect = true; // Always allow multi-select

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent dir="rtl" className="max-w-lg w-full max-h-[90vh] flex flex-col p-0 rounded-2xl bg-white dark:bg-background shadow-lg">
        <DialogHeader className="p-4 pb-0">
          <DialogClose className="absolute top-3 right-3 p-1 bg-white text-foreground border border-border rounded-full shadow-md z-20 dark:bg-secondary dark:text-secondary-foreground">
            <XCircle size={24} />
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-grow">
          <div className="p-4 pt-2">
            <div className="relative mb-6">
              <div className="rounded-t-2xl overflow-hidden h-64">
                <Image
                  src={mainImage}
                  alt={product.title || "Product"}
                  width={1200}
                  height={640}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {/* overlapping header panel like the screenshot */}
              <div className="absolute left-4 right-4 -bottom-1 bg-white dark:bg-gray-900 rounded-t-3xl p-6 shadow-lg flex items-center justify-between z-20">
                <div className="text-left">
                  <div className="text-2xl font-extrabold text-yellow-500">{Math.round(totalPrice)}₪</div>
                </div>

                <div className="flex-1 text-right mr-6">
                  <div className="text-2xl font-bold text-foreground">{product.title}</div>
                  {product.desc && <div className="text-sm text-muted-foreground mt-1">{product.desc}</div>}
                </div>
              </div>

              <div style={{height: 52}} />
            </div>

            {/* description is shown inside the overlapping panel above */}

            {featureLabels.length > 0 ? (
              <div className="bg-white rounded-xl border border-border p-4 mt-2 space-y-6">
                {featureLabels.map((label, idx) => (
                  <div key={label.id} className="">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-foreground w-full text-right">{label.label}</h3>
                    </div>

                    <div className="space-y-3 mt-3">
                      {label.values?.map((value) => {
                        const isSelected = (selectedFeatures[label.id] || []).includes(value.id);
                        return (
                          <div
                            key={value.id}
                            className={`flex items-center p-3 rounded-lg border transition-all ${isSelected ? "border-primary bg-primary/10" : "border-border"} ${!value.available ? "opacity-50" : ""}`}
                          >
                            {/* checkbox + price (side-by-side) */}
                            <div className="flex items-center justify-center w-24 gap-2" onClick={() => value.available !== false && handleSelectFeature(label.id, value.id, isMultiSelect)}>
                              <Checkbox checked={isSelected} className="w-6 h-6" />
                              {value.price_addition ? (
                                <div className="text-sm font-semibold">{value.price_addition}₪</div>
                              ) : null}
                            </div>

                            {/* label + availability under the name */}
                            <div className="flex-1 text-right pr-3" onClick={() => value.available !== false && handleSelectFeature(label.id, value.id, isMultiSelect)}>
                              <div className="font-semibold text-black dark:text-white">{value.value}</div>
                              {!value.available && <div className="text-sm text-red-500 mt-1">غير متوفر</div>}
                            </div>

                            {/* thumbnail */}
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                              {value.image ? (
                                <Image src={value.image} alt={value.value} width={48} height={48} className="object-cover" />
                              ) : (
                                <div className="w-full h-full" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {idx < featureLabels.length - 1 && <div className="border-t border-border my-4" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground dark:text-white">No customization options available.</div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-border bg-background sticky bottom-0">
          <div className="w-full flex items-center justify-between gap-4">
            {/* Quantity Selector */}
            <div className="flex items-center border border-border rounded-full overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded-none"
              >
                <Minus size={16} />
              </Button>
              <span className="px-4 font-bold text-lg text-foreground">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="rounded-none"
              >
                <Plus size={16} />
              </Button>
            </div>

            {/* Add to Cart Button */}
            <div className="flex-grow">
              <Button onClick={handleAddToCart} className="w-full">
                <ShoppingBag size={20} className="mr-2" />
                Add To Cart
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}