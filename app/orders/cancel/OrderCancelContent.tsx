"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/cart-provider";
import Link from "next/link";
import { XCircle, ShoppingCart } from "lucide-react";

function OrderCancelContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams ? searchParams.get("session_id") : null;

  useEffect(() => {
    if (sessionId) {
      // While the order was cancelled, we can clear the cart 
      // to avoid confusion for the user.
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <XCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold text-red-600 mb-2">
        Order Canceled
      </h1>
      <p className="text-lg text-muted-foreground mb-6 max-w-md">
        Your order has been canceled. You have not been charged.
      </p>
      <div className="flex gap-4">
        <Link
          href="/products"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Continue Shopping
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-base font-medium rounded-md"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default OrderCancelContent;
