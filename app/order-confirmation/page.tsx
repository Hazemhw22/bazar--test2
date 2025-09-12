"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Package, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface OrderData {
  id: number;
  created_at: string;
  buyer_id: string;
  status: string;
  shipping_method: {
    type: string;
    duration: string;
    cost: number;
  };
  shipping_address: {
    name: string;
    address: string;
    city: string;
    zip: string;
    district: string;
    phone: string;
    email: string;
  };
  payment_method: {
    type: string;
    name_on_card?: string;
    card_number?: string;
    expiration_date?: string;
    provider?: string;
  };
  items: OrderItem[];
  total: number;
}

export default function OrderConfirmationPage() {
const searchParams = useSearchParams();
const orderId = searchParams?.get("orderId") ?? null;
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        // جلب الطلب
        const { data: orders, error } = await supabase
          .from("orders")
          .select(
            `
            *,
            products (
              id,
              title,
              price,
              images
            ),
            profiles (
              id,
              full_name,
              email
            )
          `
          )
          .eq("id", orderId)
          .maybeSingle();

        if (error || !orders) {
          console.error("❌ Error fetching order:", error);
          setErrorMsg("Order not found");
          setLoading(false);
          return;
        }

        // تحويل البيانات لتتناسب مع TypeScript
        const items: OrderItem[] = orders.products
          ? [
              {
                id: orders.products.id,
                name: orders.products.title,
                price: orders.products.price,
                quantity: 1, // لو لديك كمية لكل منتج يمكنك تعديلها
                image: orders.products.images?.[0] || null,
              },
            ]
          : [];

        const total =
          items.reduce((sum, i) => sum + i.price * i.quantity, 0) +
          (orders.shipping_method?.cost || 0);

        setOrderData({
          id: orders.id,
          created_at: orders.created_at,
          buyer_id: orders.buyer_id,
          status: orders.status,
          shipping_method: orders.shipping_method,
          shipping_address: orders.shipping_address,
          payment_method: orders.payment_method,
          items,
          total,
        });
      } catch (err) {
        console.error("❌ Error fetching order:", err);
        setErrorMsg("Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading order...</p>
      </div>
    );
  }

  if (!orderData || errorMsg) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{errorMsg || "Order not found"}</h1>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

      const orderDate = new Date(orderData.created_at);
      const formattedDate = orderDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });


console.log(formattedDate); // "05 September 2025"


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 mobile:max-w-[480px]">
        <div className="max-w-4xl mx-auto">
          {/* Success Modal Overlay for mobile */}
          <div className="md:hidden fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="bg-card rounded-2xl shadow-2xl p-6 w-[88%] text-center border border-border/60 pointer-events-auto">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-3">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Order Successful!</h3>
              <p className="text-sm text-muted-foreground mb-4">You have successfully made order</p>
              <div className="flex flex-col gap-2">
                <Link href="/orders"><Button className="rounded-full">View Order</Button></Link>
                <Link href={`/orders/track/${orderData.id}`}><Button variant="outline" className="rounded-full">Track Order</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
