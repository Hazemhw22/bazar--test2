// ClientCancelOrder.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function ClientCancelOrder() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params?.get("orderId");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!orderId) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled", cancel_reason: reason })
        .eq("id", orderId);
      if (error) throw error;
      router.push(`/orders/track/${orderId}`);
    } catch (e: any) {
      setError(e.message ?? "Failed to cancel order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>{/* محتوى الصفحة كما لديك */}</div>
  );
}
