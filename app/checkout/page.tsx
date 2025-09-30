"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  User,
  MapPin,
  Clock,
  Calendar,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

// Mock data - replace with actual data fetching
const deliveryOptions = [
  {
    id: "priority",
    title: "Priority",
    description: "Delivered directly to you",
    time: "20-30 min",
    price: 1.99,
    icon: Zap,
  },
  {
    id: "standard",
    title: "Standard",
    description: "20-30 min",
    time: "20-30 min",
    price: 0,
    icon: Clock,
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Choose a time",
    time: "",
    price: 0,
    icon: Calendar,
  },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [user, setUser] = useState<{
    name: string;
    address: string;
    deliveryNote: string;
  } | null>(null);

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, address")
          .eq("id", session.user.id)
          .single();
        if (profile) {
          setUser({
            name: profile.full_name || "Name Last name",
            address: profile.address || "address",
            deliveryNote: "Add delivery note",
          });
        }
      } else {
        setUser({
          name: "Name Last name",
          address: "address",
          deliveryNote: "Add delivery note",
        });
      }
    };
    fetchUser();
  }, []);

  const deliveryFee =
    deliveryOptions.find((opt) => opt.id === selectedDelivery)?.price || 0;
  const total = totalPrice + deliveryFee;

  const handlePlaceOrder = async () => {
    // Simplified order placement logic
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // In a real app, you would save the order to the database here
      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearCart();
      router.push("/order-confirmation?orderId=12345");
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#110e24] text-white flex flex-col items-center justify-center text-center p-4">
        <ShoppingCart size={60} className="mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">
          Add items to your cart to proceed to checkout.
        </p>
        <Link href="/products">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#110e24] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a0b2e]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Checkout</h1>
          <button className="p-2">
            <MoreVertical size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* User Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-4">
              <User size={20} className="text-muted-foreground" />
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.address}</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
            <div className="flex items-center gap-4">
              <MapPin size={20} className="text-muted-foreground" />
              <div>
                <p className="font-semibold">Meet at door</p>
                <p className="text-sm text-muted-foreground">
                  {user?.deliveryNote}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
        </div>

        {/* Delivery Time */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Delivery Time</h2>
          <div className="space-y-3">
            {deliveryOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedDelivery(option.id)}
                className={`p-4 rounded-lg border-2 flex items-center gap-4 transition-all cursor-pointer ${
                  selectedDelivery === option.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-transparent bg-white/5"
                }`}
              >
                <option.icon
                  size={24}
                  className={
                    selectedDelivery === option.id
                      ? "text-blue-500"
                      : "text-muted-foreground"
                  }
                />
                <div className="flex-1">
                  <p className="font-semibold">{option.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                {option.price > 0 ? (
                  <span className="font-semibold">
                    +₪{option.price.toFixed(2)}
                  </span>
                ) : (
                  selectedDelivery === option.id && (
                    <CheckCircle size={20} className="text-blue-500" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Your Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Items</h2>
            <Link href="/cart">
              <Button variant="link" className="text-blue-400">
                See menu
              </Button>
            </Link>
          </div>
          <div className="p-4 bg-white/5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-sm font-bold">
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </div>
              <p className="font-semibold">order</p>
            </div>
            <span className="font-bold text-lg">₪{totalPrice.toFixed(2)}</span>
          </div>
        </div>
        {errorMsg && (
          <p className="mt-4 text-sm text-red-400 text-center">{errorMsg}</p>
        )}
      </main>

      {/* Footer Button */}
      <footer className="fixed bottom-[70px] md:bottom-4 left-0 w-full p-4 bg-gradient-to-t from-[#110e24] via-[#110e24]/90 to-transparent pointer-events-none">
        <div className="container mx-auto px-4 pointer-events-auto">
          <Button
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-full text-lg"
          >
            {isLoading ? "Processing..." : `Continue (₪${total.toFixed(2)})`}
          </Button>
        </div>
      </footer>
    </div>
  );
}
