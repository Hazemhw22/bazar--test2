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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full mb-6">
              <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-green-800 dark:text-green-200 mb-3">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package size={20} />
                    Order Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Number</p>
                    <p className="font-mono font-semibold text-lg">{orderData.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
                      <p className="font-medium">{formattedDate}</p>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Estimated Delivery</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{formattedDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-base">{orderData.shipping_address.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">{orderData.shipping_address.address}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {orderData.shipping_address.city}, {orderData.shipping_address.district}{" "}
                      {orderData.shipping_address.zip}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">{orderData.shipping_address.phone}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link href="/products" className="block">
                  <Button className="w-full" size="lg">
                    Continue Shopping
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>

                <Link href="/orders" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    View All Orders
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-4">
                    {orderData.items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image
                            src={item.image || "/placeholder.svg?height=64&width=64"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ${item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${(orderData.total - orderData.shipping_method.cost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping & Tax</span>
                      <span>${orderData.shipping_method.cost.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${orderData.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">What's Next?</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• You'll receive an email confirmation shortly</li>
                      <li>• We'll send tracking information when your order ships</li>
                      <li>• Estimated delivery: {formattedDate}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
