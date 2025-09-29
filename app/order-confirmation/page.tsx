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
          setErrorMsg("Order not found");
          setLoading(false);
          return;
        }

        const items: OrderItem[] = orders.products
          ? [
              {
                id: orders.products.id,
                name: orders.products.title,
                price: orders.products.price,
                quantity: 1,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg p-4 sticky top-0 z-10">
        <div className="container mx-auto flex justify-center items-center">
          <h1 className="text-2xl font-bold text-center">Order Confirmation</h1>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 mobile:max-w-[480px]">
        <div className="max-w-4xl mx-auto">
          {/* Success message for mobile */}
          <div className="md:hidden w-full flex items-center justify-center mb-6">
            <div className="bg-gradient-to-b from-purple-800/80 to-indigo-900/80 rounded-2xl shadow-2xl p-6 w-full text-center border border-purple-700/50">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                <CheckCircle size={28} className="text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-white">Order Successful!</h3>
              <p className="text-sm text-gray-300 mb-4">You have successfully placed your order</p>
              <div className="flex flex-col gap-2">
                <Link href="/orders"><Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">View Order</Button></Link>
                <Link href={`/orders/track/${orderData.id}`}><Button variant="outline" className="rounded-full border-purple-500 text-purple-200 hover:bg-purple-800/50">Track Order</Button></Link>
              </div>
            </div>
          </div>

          {/* Desktop Card */}
          <div className="hidden md:block">
            <Card className="mx-auto max-w-2xl mt-8 bg-gradient-to-b from-purple-800/80 to-indigo-900/80 border border-purple-700/50 text-white shadow-xl">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle size={32} className="text-green-400" />
                  <CardTitle className="text-white">Order Confirmed</CardTitle>
                </div>
                <div className="text-sm text-gray-300 mt-2">
                  Order #{orderData.id} • {formattedDate}
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="my-4 bg-purple-600/50" />
                <div className="mb-4">
                  <div className="font-semibold mb-2 text-white">Order Items</div>
                  <div className="flex flex-col gap-3">
                    {orderData.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-purple-900/30 p-3 rounded-lg">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-purple-700/50 bg-purple-800/50 flex items-center justify-center">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover" />
                          ) : (
                            <Package size={32} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-white">{item.name}</div>
                          <div className="text-xs text-gray-300">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-semibold text-blue-400">₪{item.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="my-4 bg-purple-600/50" />
                <div className="mb-4">
                  <div className="font-semibold mb-2 text-white">Shipping</div>
                  <div className="text-sm text-gray-300">
                    {orderData.shipping_method.type} • {orderData.shipping_method.duration} • ₪{orderData.shipping_method.cost}
                  </div>
                  <div className="text-sm mt-1 text-gray-300">
                    <span className="font-medium text-white">Address:</span> {orderData.shipping_address.address}, {orderData.shipping_address.city}
                  </div>
                </div>
                <Separator className="my-4 bg-purple-600/50" />
                <div className="mb-4">
                  <div className="font-semibold mb-2 text-white">Payment</div>
                  <div className="text-sm text-gray-300">
                    {orderData.payment_method.type}
                    {orderData.payment_method.provider && <> • {orderData.payment_method.provider}</>}
                  </div>
                </div>
                <Separator className="my-4 bg-purple-600/50" />
                <div className="flex items-center justify-between font-bold text-lg">
                  <span className="text-white">Total</span>
                  <span className="text-blue-400">₪{orderData.total}</span>
                </div>
                <div className="flex gap-3 mt-6">
                  <Link href="/orders"><Button className="rounded-full flex-1 bg-blue-600 hover:bg-blue-700 text-white">View Orders</Button></Link>
                  <Link href={`/orders/track/${orderData.id}`}><Button variant="outline" className="rounded-full flex-1 border-purple-500 text-purple-200 hover:bg-purple-800/50">Track Order</Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
