"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, ShoppingCart } from "lucide-react";

function CancelOrderForm() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params?.get("orderId");
  const { t } = useI18n();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const maxLength = 220;

  const handleCancel = async () => {
    if (!reason) {
      setError(t("orders.cancel.error.noReason"));
      return;
    }
    setSubmitting(true);
    setError(null);
    // Here you would typically make an API call to cancel the order
    console.log("Cancelling order:", orderId, "Reason:", reason);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitting(false);
    // Redirect to a confirmation page or back to orders
    router.push("/orders");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] via-[#1a0b2e] to-[#110e24] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a0b2e]/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">{t("orders.cancel.title")}</h1>
          <button className="p-2">
            <ShoppingCart size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl font-bold">{t("orders.cancel.sorry")}</h2>
          <p className="text-gray-400">
            {t("orders.cancel.instructions")}
          </p>
           <p className="text-gray-400">
            {t("orders.cancel.prompt")}
          </p>
        </div>

        <div className="relative">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("orders.cancel.placeholder")}
            maxLength={maxLength}
            className="w-full h-48 p-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none"
          />
          <div className="absolute bottom-4 right-4 text-xs text-gray-400">
            {reason.length} / {maxLength}
          </div>
        </div>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </main>

      {/* Footer Button */}
      <footer className="sticky bottom-0 z-10 p-4 bg-gradient-to-t from-[#110e24] via-[#110e24]/90 to-transparent">
        <Button
          onClick={handleCancel}
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg text-lg"
        >
          {submitting ? t("orders.cancel.submitting") : t("orders.cancel.button")}
        </Button>
      </footer>
    </div>
  );
}

export default function CancelOrderPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-[#1a0b2e] text-white">Loading...</div>}>
            <CancelOrderForm />
        </Suspense>
    )
}
