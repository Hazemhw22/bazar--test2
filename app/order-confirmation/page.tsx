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
import { useI18n } from "@/lib/i18n";

interface OrderData {
  id: number;
  order_number: string;
  total_amount: number;
  subtotal: number;
  delivery_cost: number;
  estimatedTime: string;
  deliveryAddress: string;
  createdAt: string;
  order_type: string;
  payment_method: string;
  status: string;
  products?: Array<{
    id: number;
    product_name: string;
    final_unit_price: number;
    item_total: number;
    products?: {
      id: number;
      name: string;
      image_url?: string;
    };
  }>;
  shop?: {
    id: number;
    name: string;
    logo_url?: string;
  };
}

function OrderConfirmationContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("orderId");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noOrderFound, setNoOrderFound] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        let order: any = null;

        if (orderId) {
          // Fetch order by ID using API route (bypasses RLS)
          const response = await fetch(`/api/orders/${orderId}`);
          
          if (!response.ok) {
            console.warn("Order not found by id, will try latest order for user", { orderId });
            // fallback: try latest order for current user
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.session?.user?.id;
            if (userId) {
              const latestResponse = await fetch(`/api/orders/latest?userId=${userId}`);
              if (latestResponse.ok) {
                const latestData = await latestResponse.json();
                order = latestData.order;
              } else {
                console.warn("No latest order found for user", { userId });
              }
            }
            if (!order) {
              // instead of throwing, set a flag to show a friendly message in the UI
              setNoOrderFound(true);
              setLoading(false);
              return;
            }
          } else {
            const responseData = await response.json();
            order = responseData.order;
          }
        } else {
          // No orderId: fetch latest order for current user
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id;
          if (!userId) {
            // no user session – fallback to mock
            setOrderData({
              id: 0,
              order_number: "N/A",
              total_amount: 0,
              subtotal: 0,
              delivery_cost: 0,
              estimatedTime: "30mins",
              deliveryAddress: "Home",
              createdAt: new Date().toISOString(),
              order_type: "delivery",
              payment_method: "cash",
              status: "pending"
            });
            setLoading(false);
            return;
          }

          const response = await fetch(`/api/orders/latest?userId=${userId}`);
          if (!response.ok) throw new Error("Latest order not found");
          const responseData = await response.json();
          order = responseData.order;
        }

        // Debug: Log the raw order data
        console.log("Raw order data from API:", order);
        console.log("orders_products:", order.orders_products);
        if (order.orders_products && order.orders_products.length > 0) {
          console.log("First product:", order.orders_products[0]);
          console.log("First product.products:", order.orders_products[0].products);
        }

        // Prepare result object with new schema
        const result: OrderData = {
          id: order.id,
          order_number: order.order_number,
          total_amount: order.total_amount,
          subtotal: order.subtotal,
          delivery_cost: order.delivery_cost,
          estimatedTime: order.order_type === "delivery" ? "30-45 mins" : "15-20 mins",
          deliveryAddress: order.customer_address || (order.order_type === "pickup" ? "Pickup at store" : "Home"),
          createdAt: order.created_at,
          order_type: order.order_type,
          payment_method: order.payment_method,
          status: order.status,
          products: order.orders_products || [],
          shop: order.shops || undefined,
        };

        console.log("Mapped result:", result);
        console.log("Result products:", result.products);

        setOrderData(result);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setOrderData({
          id: Number(orderId) || 0,
          order_number: "N/A",
          total_amount: 0,
          subtotal: 0,
          delivery_cost: 0,
          estimatedTime: "30mins",
          deliveryAddress: "Home",
          createdAt: new Date().toISOString(),
          order_type: "delivery",
          payment_method: "cash",
          status: "pending"
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
        {t("orderConfirmation.loading")}
      </div>
    );
  }

  if (noOrderFound) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] via-[#1a0b2e] to-[#110e24] text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{t("orderConfirmation.noOrder.title")}</h2>
        <p className="text-muted-foreground mb-6">{t("orderConfirmation.noOrder.subtitle")}</p>
        <div className="flex gap-3">
          <Link href="/orders">
            <Button>{t("orderConfirmation.actions.myOrders")}</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">{t("orderConfirmation.actions.home")}</Button>
          </Link>
        </div>
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

        <h1 className="text-3xl font-bold mb-2">{t("orderConfirmation.title.line1")}</h1>
        <h1 className="text-3xl font-bold mb-4">{t("orderConfirmation.title.line2")}</h1>
        {orderData?.order_number && (
          <div className="text-sm text-muted-foreground mb-2">{t("orderConfirmation.labels.orderNumber")} <span className="font-semibold">{orderData.order_number}</span></div>
        )}
        {orderData?.createdAt && (
          <div className="text-sm text-muted-foreground mb-4">{t("orderConfirmation.labels.placedOn")} <span className="font-semibold">{new Date(orderData.createdAt).toLocaleString()}</span></div>
        )}

        <p className="text-gray-400 max-w-xs mx-auto mb-12">
          {t("orderConfirmation.notice.deliveryEstimate", { time: orderData?.estimatedTime })}
        </p>

        <div className="w-full max-w-sm space-y-4 text-left">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-gray-300">
              <Clock size={20} />
              <span>{t("orderConfirmation.estimatedTime.label")}</span>
            </div>
            <span className="font-semibold">{orderData?.estimatedTime}</span>
          </div>
          {/* Products List */}
          <div className="space-y-3">
            {orderData?.products && orderData.products.length > 0 ? (
              orderData.products.map((item, index) => (
                <div key={item.id || `product-${index}`} className="p-3 bg-white/5 rounded-lg flex items-center gap-4 border border-[#666665]">
                  <div className="w-16 h-16 rounded-md bg-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.products?.image_url ? (
                      <img 
                        src={item.products.image_url} 
                        alt={item.product_name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <ShoppingCart size={24} className="text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.product_name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {orderData?.shop?.name && (
                        <span className="text-xs px-2 py-1 rounded border border-blue-400 bg-blue-400/10 text-blue-300">
                          {orderData.shop.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₪{item.item_total.toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">{t("orderConfirmation.product.fallback")}</div>
            )}
          </div>

          {/* Order Summary */}
          <div className="border-t border-white/10 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span>₪{orderData?.subtotal.toFixed(2)}</span>
            </div>
            {orderData?.delivery_cost && orderData.delivery_cost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Delivery</span>
                <span>₪{orderData.delivery_cost.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-white/10 pt-2">
              <span>Total</span>
              <span>₪{orderData?.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin size={20} />
              <span>{t("orderConfirmation.deliverTo.label")}</span>
            </div>
            <span className="font-semibold">{orderData?.deliveryAddress}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 text-gray-300">
              <Wallet size={20} />
              <span>{t("orderConfirmation.payment.label")}</span>
            </div>
            <span className="font-semibold capitalize">{orderData?.payment_method || "—"}</span>
          </div>
        </div>
      </main>

      {/* Footer Button */}
      <footer className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-[#110e24] via-[#110e24]/90 to-transparent">
        <Link href={`/orders/track/${orderData?.id}`}>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg flex items-center justify-center gap-2">
            {t("orderConfirmation.actions.trackOrder")} <ArrowRight size={20} />
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
