"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Menu,
  
  Clock,
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const { t } = useI18n();

  const subtotal = totalPrice;
  // Assuming a fixed discount for now as logic is not specified
  const discount = promoCode ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8 text-center">
          <ShoppingBag size={80} className="mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-3">{t("cart.empty_title")}</h1>
          <p className="text-muted-foreground mb-8">
            {t("cart.empty_subtitle")}
          </p>
          <Link href="/products">
            <Button size="lg" className="w-full max-w-sm mx-auto">
              {t("cart.continue_shopping")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#110e24] text-white">
      <div className="container mx-auto px-4 pt-4 pb-32">
        {/* Header */}
        <header className="flex items-center justify-between py-4">
          <h1 className="text-xl font-bold">Shopping list</h1>
          <Button variant="ghost" size="icon">
            <Menu />
          </Button>
        </header>

        {/* Cart Items */}
        <div className="space-y-4 my-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 rounded-2xl p-4 flex items-center gap-4"
            >
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-base truncate">
                    {item.name}
                  </h3>
                 
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock size={14} />
                  <span>08.09</span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-white/10 rounded-full px-2 py-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, Math.max(1, item.quantity - 1))
                      }
                      disabled={item.quantity <= 1}
                      className="disabled:opacity-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-medium text-base min-w-[1rem] text-center text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="font-bold text-lg">
                    ₪{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end justify-between h-full">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Discount Code */}
        <div className="relative my-8">
          <Input
            placeholder="Enter your discount code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="bg-white/5 border-white/10 rounded-full h-12 px-6 placeholder:text-muted-foreground"
          />
        </div>

        {/* Summary */}
        <div className="space-y-4 text-lg">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">₪{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-xl">
            <span>Total</span>
            <span>₪{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <footer className="fixed bottom-[70px] md:bottom-4 left-0 w-full p-4 bg-gradient-to-t from-[#110e24] via-[#110e24]/90 to-transparent pointer-events-none">
         <div className="container mx-auto px-4 pointer-events-auto">
            <Link href="/checkout" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-full text-lg">
                    Make a purchase
                </Button>
            </Link>
         </div>
      </footer>
    </div>
  );
}
