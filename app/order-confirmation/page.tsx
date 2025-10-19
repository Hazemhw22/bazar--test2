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
  id: string;
  total: number;
  estimatedTime: string;
  deliveryAddress: string;
  number?: string | number;
  createdAt?: string;
  shipping?: any;
  paymentMethod?: string;
  product?: {
    id: number | string;
    title?: string;
    price?: number;
    images?: string[];
  };
  shop?: {
    id?: number | string;
    shop_name?: string;
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
          const { data, error } = await supabase
            .from("orders")
            .select("id, total, shipping_address, shipping_method, payment_method, created_at, product_id")
            .eq("id", orderId)
            .single();
          if (error || !data) {
            console.warn("Order not found by id, will try latest order for user", { orderId, error });
            // fallback: try latest order for current user
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.session?.user?.id;
            if (userId) {
              const { data: latest, error: latestErr } = await supabase
                .from("orders")
                .select("id, number, total, shipping_address, shipping_method, payment_method, created_at, product_id")
                .eq("buyer_id", userId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
              if (!latestErr && latest) {
                order = latest;
              } else {
                console.warn("No latest order found for user", { userId, latestErr });
              }
            }
            if (!order) {
              // instead of throwing, set a flag to show a friendly message in the UI
              setNoOrderFound(true);
              setLoading(false);
              return;
            }
          } else {
            order = data;
          }
        } else {
          // No orderId: fetch latest order for current user
          const { data: sessionData } = await supabase.auth.getSession();
          const userId = sessionData?.session?.user?.id;
          if (!userId) {
            // no user session – fallback to mock
            setOrderData({ id: "", total: 0, estimatedTime: "30mins", deliveryAddress: "Home" });
            setLoading(false);
            return;
          }

          const { data, error } = await supabase
            .from("orders")
            .select("id, total, shipping_address, shipping_method, payment_method, created_at, product_id")
            .eq("buyer_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error || !data) throw new Error("Latest order not found");
          order = data;
        }

        // normalize total
        const total = typeof order.total === "number" ? order.total : Number(order.total) || 0;

        // Prepare result object
        const result: OrderData = {
          id: order.id,
          total,
          estimatedTime: "30mins",
          deliveryAddress: order.shipping_address?.address || order.shipping_address?.city || "Home",
          number: order.number ?? order.id,
          createdAt: order.created_at,
          shipping: order.shipping_address,
          paymentMethod: order.payment_method?.type || (order.payment_method && typeof order.payment_method === "string" ? order.payment_method : "unknown"),
        };

        // Fetch product and shop details if we have product_id
        const productId = order.product_id ?? null;
        if (productId != null) {
          const { data: productData } = await supabase
            .from("products")
            .select("id, title, price, images, shop")
            .eq("id", productId)
            .maybeSingle();

          if (productData) {
            result.product = {
              id: productData.id,
              title: productData.title,
              price: typeof productData.price === "number" ? productData.price : Number(productData.price) || 0,
              images: productData.images || [],
            };

            // fetch shop
            const shopId = productData.shop;
            if (shopId) {
              const { data: shopData } = await supabase
                .from("shops")
                .select("id, shop_name, logo_url, address")
                .eq("id", shopId)
                .maybeSingle();
              if (shopData) result.shop = { id: shopData.id, shop_name: shopData.shop_name };
            }
          }
        }

        setOrderData(result);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        setOrderData({ id: orderId || "", total: 32.12, estimatedTime: "30mins", deliveryAddress: "Home" });
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
        {orderData?.number && (
          <div className="text-sm text-muted-foreground mb-2">{t("orderConfirmation.labels.orderNumber")} <span className="font-semibold">{orderData.number}</span></div>
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
          <div className="flex items-start gap-4">
            {orderData?.product?.images?.[0] ? (
              <div className="w-20 h-20 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                <img src={orderData.product.images[0]} alt={orderData.product.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-md bg-white/5 flex items-center justify-center text-muted-foreground">{t("orderConfirmation.product.noImage")}</div>
            )}

            <div className="flex-1">
              <div className="font-semibold">{orderData?.product?.title || t("orderConfirmation.product.fallback")}</div>
              <div className="text-sm text-muted-foreground">{orderData?.shop?.shop_name || t("orderConfirmation.product.storeFallback")}</div>
              <div className="mt-2 font-semibold">₪{orderData?.product?.price?.toFixed ? orderData.product.price.toFixed(2) : orderData?.total.toFixed(2)}</div>
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
            <span className="font-semibold">{orderData?.paymentMethod || "—"}</span>
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
