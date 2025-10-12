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
  // selectionsPerUnit[index] = Record<labelId, valueIds[]>
  const [selectionsPerUnit, setSelectionsPerUnit] = useState<
    Record<number, number[]>[]
  >([{}]);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [totalPrice, setTotalPrice] = useState<number>(Number(product.price) || 0);
  const [featureLabels, setFeatureLabels] = useState<ProductFeatureLabel[]>([]);
  const { addItem } = useCart();
  const [activeLabelId, setActiveLabelId] = useState<number | null>(null);

  const mainImage = product.images?.[0] || "/placeholder.svg";
  const basePrice = Number(product.price) || 0;
  const discountedPrice = product.sale_price ?? basePrice;

  // compute price for the current unit whenever selections or labels change
  const computePriceForUnit = (index: number) => {
    let newTotal = discountedPrice;
    const unitSelections = selectionsPerUnit[index] || {};
    if (featureLabels.length > 0 && unitSelections) {
      Object.entries(unitSelections).forEach(([labelId, valueIds]) => {
        const label = featureLabels.find((l) => l.id === Number(labelId));
        if (label) {
          valueIds.forEach((valueId) => {
            const value = label.values?.find((v) => v.id === valueId);
            if (value) newTotal += value.price_addition;
          });
        }
      });
    }
    return newTotal;
  };

  useEffect(() => {
    // compute price for the current unit
    setTotalPrice(computePriceForUnit(currentUnitIndex));
  }, [selectionsPerUnit, currentUnitIndex, discountedPrice, featureLabels]);


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
          setSelectionsPerUnit(Array(quantity).fill(0).map(() => ({})));
        }
    }
    if (isOpen) {
      fetchFeatures();
    }
  }, [product.id, isOpen]);

  const handleSelectFeature = (labelId: number, valueId: number, isMultiSelect: boolean) => {
    setSelectionsPerUnit((prev) => {
      const copy = prev.map((p) => ({ ...p }));
      const unit = copy[currentUnitIndex] || {};
      const currentSelection = unit[labelId] || [];
      let newSelection: number[];
      if (isMultiSelect) {
        newSelection = currentSelection.includes(valueId)
          ? currentSelection.filter((id) => id !== valueId)
          : [...currentSelection, valueId];
      } else {
        newSelection = currentSelection.includes(valueId) ? [] : [valueId];
      }
      unit[labelId] = newSelection;
      copy[currentUnitIndex] = unit;
      return copy;
    });
  };

  const handleAddToCart = () => {
    // When user finishes configuring all units, add each unit separately with its computed price
    const unitsToAdd = Math.max(1, quantity);
    for (let i = 0; i < unitsToAdd; i++) {
      const priceForUnit = computePriceForUnit(i);
      addItem({
        id: Number(product.id),
        name: product.title,
        price: priceForUnit,
        image: mainImage,
        quantity: 1,
      });
    }
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
              <div className="absolute left-4 right-4 -bottom-1 gap-6 bg-white dark:bg-gray-900 rounded-t-3xl p-6 shadow-lg flex items-center justify-between z-20">
                <div className="text-left">
                  <div className="text-2xl font-extrabold text-yellow-500">{Math.round(totalPrice)}₪</div>
                </div>

                <div className="flex-1 text-right mr-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-2xl font-bold text-foreground min-w-0 truncate">{product.title}</div>
                    <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium flex-shrink-0">
                      {currentUnitIndex + 1} / {Math.max(1, quantity)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{height: 52}} />
            </div>

            {/* description is shown inside the overlapping panel above */}

            {featureLabels.length > 0 ? (
              <div className="bg-white rounded-xl border border-border p-4 mt-2">
                {/* Tabs for labels */}
                <div className="flex gap-2 overflow-x-auto pb-3">
                  {featureLabels.map((label) => {
                    const active = activeLabelId === label.id || (activeLabelId === null && featureLabels[0]?.id === label.id);
                    return (
                      <button
                        key={label.id}
                        onClick={() => setActiveLabelId(label.id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-lg border ${active ? "bg-primary/10 border-primary" : "border-border"}`}
                      >
                        {label.label}
                      </button>
                    );
                  })}
                </div>

                {/* Values for the active tab */}
                <div className="mt-3 space-y-3">
                  {featureLabels.filter(l => l.id === (activeLabelId ?? featureLabels[0]?.id)).map((label) => (
                    <div key={label.id}>
                      {label.values?.map((value) => {
                        const currentSelections = selectionsPerUnit[currentUnitIndex] || {};
                        const isSelected = (currentSelections[label.id] || []).includes(value.id);
                        return (
                          <div
                            key={value.id}
                            className={`flex items-center p-3 rounded-lg border transition-all ${isSelected ? "border-primary bg-primary/10" : "border-border"} ${!value.available ? "opacity-50" : ""}`}
                          >
                            <div className="flex items-center justify-center w-24 gap-2" onClick={() => value.available !== false && handleSelectFeature(label.id, value.id, isMultiSelect)}>
                              <Checkbox checked={isSelected} className="w-6 h-6" />
                              {value.price_addition ? (
                                <div className="text-sm font-semibold">{value.price_addition}₪</div>
                              ) : null}
                            </div>

                            <div className="flex-1 text-right pr-3" onClick={() => value.available !== false && handleSelectFeature(label.id, value.id, isMultiSelect)}>
                              <div className="font-semibold text-black dark:text-white">{value.value}</div>
                              {!value.available && <div className="text-sm text-red-500 mt-1">غير متوفر</div>}
                            </div>

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
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground dark:text-white">No customization options available.</div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-border bg-background sticky bottom-0">
          <div className="w-full flex items-center justify-between gap-4">
            {/* Left area: quantity + prev/next + unit indicator */}
            <div className="flex items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex items-center border border-border rounded-full overflow-hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newQ = Math.max(1, quantity - 1);
                    setQuantity(newQ);
                    setSelectionsPerUnit((prev) => prev.slice(0, newQ));
                    setCurrentUnitIndex((i) => Math.min(i, Math.max(0, newQ - 1)));
                  }}
                  className="rounded-none"
                >
                  <Minus size={16} />
                </Button>
                <span className="px-4 font-bold text-lg text-foreground">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newQ = quantity + 1;
                    setQuantity(newQ);
                    setSelectionsPerUnit((prev) => {
                      const copy = prev.slice();
                      while (copy.length < newQ) copy.push({});
                      return copy;
                    });
                  }}
                  className="rounded-none"
                >
                  <Plus size={16} />
                </Button>
              </div>

              {/* Prev / Next with unit indicator */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentUnitIndex((i) => Math.max(0, i - 1))}
                  disabled={currentUnitIndex === 0}
                >
                  Prev
                </Button>

                

              </div>
            </div>

            {/* Right area: Add / Next main action */}
            <div className="flex-1">
              <Button
                onClick={() => {
                  // if there are more units to configure, navigate to next; otherwise add to cart
                  if (currentUnitIndex < Math.max(0, quantity - 1)) {
                    setCurrentUnitIndex((i) => i + 1);
                  } else {
                    handleAddToCart();
                  }
                }}
                className="w-full"
              >
                <ShoppingBag size={20} className="ml-2" />
                <span>
                  {currentUnitIndex < Math.max(0, quantity - 1) ? `Next` : `Add To Cart`}
                </span>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}