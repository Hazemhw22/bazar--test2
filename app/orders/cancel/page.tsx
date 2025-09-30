"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function CancelOrderPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-gray-900 text-white">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg p-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10">
            ←
          </button>
          <h1 className="text-lg font-semibold">Cancel order</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">We are sorry to hear this</h2>
          <p className="text-white/70">Tell us the reason for cancelling your order.</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Write here..."
            rows={6}
            className="w-full bg-transparent outline-none resize-none"
          />
          <div className="text-right text-xs text-white/50">{reason.length} / 220</div>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="fixed left-0 right-0 bottom-0 pb-5 pt-3 px-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="max-w-md mx-auto">
            <Button disabled={submitting || !orderId} onClick={onSubmit} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600">
              {submitting ? "Submitting..." : "Cancel"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


