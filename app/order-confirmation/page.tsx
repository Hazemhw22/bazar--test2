"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  ChevronLeft,
  ShoppingCart,
  Clock,
  MapPin,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface OrderData {
  id: string;
  total: number;
  estimatedTime: string;
  deliveryAddress: string;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("orderId");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        // In a real app, you might want to redirect or show an error
        // For now, we'll use mock data if no ID is present.
        setOrderData({
          id: "12345",
          total: 32.12,
          estimatedTime: "30mins",
          deliveryAddress: "Home",
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*, products(price)")
          .eq("id", orderId)
          .single();

        if (error || !data) {
          throw new Error("Order not found");
        }

        // This is a simplified calculation. You'd likely have more complex logic.
        const total = data.products.price + (data.shipping_method?.cost || 0);

        setOrderData({
          id: data.id,
          total: total,
          estimatedTime: "30mins", // This would likely come from your shipping logic
          deliveryAddress: data.shipping_address?.city || "Home",
        });
      } catch (error) {
        console.error("Failed to fetch order:", error);
        // Fallback to mock data on error
        setOrderData({
          id: orderId,
          total: 32.12,
          estimatedTime: "30mins",
          deliveryAddress: "Home",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1a0b2e] text-white">
        Loading order confirmation...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] via-[#1a0b2e] to-[#110e24] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="p-2">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => router.push("/cart")} className="p-2">
            <ShoppingCart size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/30 flex items-center justify-center">
            <CheckCircle size={40} className="text-purple-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Yay! Your order</h1>
        <h1 className="text-3xl font-bold mb-4">has been placed.</h1>

        <p className="text-gray-400 max-w-xs mx-auto mb-12">
          Your order would be delivered in the 30 mins atmost
        </p>

        <div className="w-full max-w-sm space-y-4 text-left">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-gray-300">
              <Clock size={20} />
              <span>Estimated time</span>
            </div>
            <span className="font-semibold">{orderData?.estimatedTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin size={20} />
              <span>Deliver to</span>
            </div>
            <span className="font-semibold">{orderData?.deliveryAddress}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-gray-300">
              <Wallet size={20} />
              <span>Amount Paid</span>
            </div>
            <span className="font-semibold">₪{orderData?.total.toFixed(2)}</span>
          </div>
        </div>
      </main>

      {/* Footer Button */}
      <footer className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-[#110e24] via-[#110e24]/90 to-transparent">
        <Link href={`/orders/track/${orderData?.id}`}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center gap-2">
            Track your order <ArrowRight size={20} />
          </Button>
        </Link>
      </footer>
    </div>
  );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-[#1a0b2e] text-white">Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    )
}
