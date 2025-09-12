"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, Boxes, CheckCircle, Circle } from "lucide-react";

type OrderWithProduct = {
  id: number;
  status: string;
  created_at: string;
  products?: { id: number; title: string; price: number; images?: string[] | null } | null;
};

const statusSteps = [
  { key: "payment_verified", label: "Verified Payments", icon: CheckCircle },
  { key: "packed", label: "Order is in Packing", icon: Boxes },
  { key: "shipped", label: "Orders are Shipped", icon: Truck },
  { key: "customs", label: "Order at Customs Port", icon: Package },
  { key: "in_transit", label: "Order In Transit", icon: Truck },
] as const;

export default function TrackOrderPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<OrderWithProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, created_at, products:product_id (id, title, price, images)")
        .eq("id", orderId)
        .maybeSingle();
      if (!error) setOrder((data as any) ?? null);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!order)
    return <div className="text-center py-10">Order not found</div>;

  const product = (order as any).products;

  return (
    <div className="mobile:max-w-[480px] mx-auto px-4 py-6 space-y-6">
      <Card className="bg-card">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {product?.images?.[0] ? (
              <Image src={product.images[0]} alt={product?.title ?? "Product"} fill className="object-cover" />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{product?.title ?? "Product"}</h3>
            <p className="text-sm text-muted-foreground">₪{product?.price ?? 0}</p>
          </div>
          <div className="text-xs bg-muted px-3 py-1 rounded-full">Packet In Delivery</div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h4 className="font-semibold">Order Status Details</h4>
        <div className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
          {statusSteps.map((step, idx) => {
            const Icon = step.icon;
            const active = true; // Without granular statuses, show all as active timeline entries
            return (
              <div key={step.key} className="relative mb-6 last:mb-0">
                <div className={`absolute -left-[6px] top-1.5 rounded-full ${active ? "bg-blue-600" : "bg-border"} w-3 h-3`} />
                <div className="flex items-start gap-3">
                  <div className="mt-0.5"><Icon size={18} className="text-muted-foreground" /></div>
                  <div>
                    <p className="font-medium">{step.label}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


