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
  const [step, setStep] = useState(0);
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
        setStep(0);
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

  const currentLabel = featureLabels[step];
  const isMultiSelect = true; // Always allow multi-select

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-lg w-full max-h-[90vh] flex flex-col p-0 rounded-2xl bg-white dark:bg-background shadow-lg">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl font-bold">{product.title}</DialogTitle>
          <DialogClose className="absolute top-3 right-3 p-1 bg-white text-foreground border border-border rounded-full shadow-md z-20 dark:bg-secondary dark:text-secondary-foreground">
            <XCircle size={24} />
          </DialogClose>
        </DialogHeader>

        <ScrollArea className="flex-grow">
          <div className="p-4 pt-2">
            <div className="relative rounded-lg overflow-hidden mb-4">
              <Image
                src={mainImage}
                alt={product.title || "Product"}
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                priority
              />
              <div className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-900 font-bold rounded-full px-4 py-1.5 shadow-lg text-lg dark:bg-destructive dark:text-destructive-foreground">
                <span>Total: </span>
                <span>₪{(totalPrice * quantity).toFixed(2)}</span>
              </div>
            </div>

            {product.desc && (
              <p className="text-sm text-muted-foreground mb-4">{product.desc}</p>
            )}

            {featureLabels.length > 0 && currentLabel ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    {currentLabel.label}
                  </h3>
                  <span className="text-sm font-medium text-muted-foreground bg-gray-100 px-2 py-1 rounded-md dark:bg-secondary">
                    {step + 1} / {featureLabels.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {currentLabel.values?.map((value) => {
                    const isSelected = (
                      selectedFeatures[currentLabel.id] || []
                    ).includes(value.id);
                    return (
                      <div
                        key={value.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected ? "border-primary bg-primary/10" : "border-border"} ${!value.available ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100 dark:hover:bg-secondary/50"}`}
                        onClick={() =>
                          value.available !== false &&
                          handleSelectFeature(currentLabel.id, value.id, isMultiSelect)
                        }
                      >
                        <div className="flex items-center gap-3">
                          {value.image && (
                            <Image
                              src={value.image}
                              alt={value.value}
                              width={40}
                              height={40}
                              className="rounded-md"
                            />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-black dark:text-white">
                              {value.value}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {value.price_addition > 0 && (
                            <span className="text-sm font-bold text-black dark:text-white">
                              +₪{value.price_addition.toFixed(2)}
                            </span>
                          )}
                          <Checkbox
                            checked={isSelected}
                            className="w-5 h-5"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground dark:text-white">
                No customization options available.
              </div>
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

            {/* Stepper/Add to Cart Button */}
            <div className="flex-grow">
              {featureLabels.length > 0 ? (
                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => setStep((s) => s - 1)}
                      className="w-full"
                    >
                      Back
                    </Button>
                  )}
                  {step < featureLabels.length - 1 ? (
                    <Button
                      onClick={() => setStep((s) => s + 1)}
                      className="w-full"
                    >
                      Next <span className="ml-2">→</span>
                    </Button>
                  ) : (
                    <Button onClick={handleAddToCart} className="w-full">
                      <ShoppingBag size={20} className="mr-2" />
                      Add To Cart
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={handleAddToCart} className="w-full">
                  <ShoppingBag size={20} className="mr-2" />
                  Add To Cart
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}