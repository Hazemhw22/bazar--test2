"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  MoreVertical,
  User,
  MapPin,
  Clock,
  Calendar,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  Store,
  Zap,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Mock data - replace with actual data fetching
const deliveryOptions = [
  {
    id: "priority",
    title: "Priority",
    description: "Delivered directly to you",
    time: "20-30 min",
    price: 1.99,
    icon: Zap,
  },
  {
    id: "standard",
    title: "Standard",
    description: "20-30 min",
    time: "20-30 min",
    price: 0,
    icon: Clock,
  },
  {
    id: "schedule",
    title: "Schedule",
    description: "Choose a time",
    time: "",
    price: 0,
    icon: Calendar,
  },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"visa" | "card" | "cash">("cash");
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [user, setUser] = useState<{
    name: string;
    address: string;
    deliveryNote: string;
  } | null>(null);
  const [productsMap, setProductsMap] = useState<Record<number, any>>({});

  // derive selected store from first cart item's product (if available)
  const firstItem = items && items.length > 0 ? items[0] : null;
  const selectedStore = firstItem ? productsMap[firstItem.id]?.shops || null : null;

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, address")
          .eq("id", session.user.id)
          .single();
        if (profile) {
          setUser({
            name: profile.full_name || "Name Last name",
            address: profile.address || "address",
            deliveryNote: "Add delivery note",
          });
          // prefill name/phone/address
          setFirstName(profile.full_name ? profile.full_name.split(" ")[0] : "");
          setLastName(profile.full_name ? profile.full_name.split(" ").slice(1).join(" ") : "");
          setAddressInput(profile.address || "");
        }
      } else {
        setUser({
          name: "Name Last name",
          address: "address",
          deliveryNote: "Add delivery note",
        });
      }
    };
    fetchUser();
  }, []);

  // Fetch product data for items so we can show store/category
  useEffect(() => {
    async function fetchProducts() {
      if (!items || items.length === 0) return;
      const ids = items.map((i) => i.id);
      const { data: products } = await supabase.from("products").select("*").in("id", ids as any[]);
      if (!products) return;

      // collect shop and category ids
      const shopIds = Array.from(new Set(products.map((p: any) => Number(p.shop)).filter(Boolean)));
      const categoryIds = Array.from(new Set(products.map((p: any) => Number(p.category)).filter(Boolean)));

      const shopMap: Record<number, any> = {};
      const categoryMap: Record<number, any> = {};

      if (shopIds.length > 0) {
        const { data: shops } = await supabase.from("shops").select("id, shop_name, address").in("id", shopIds as any[]);
        shops?.forEach((s: any) => (shopMap[Number(s.id)] = s));
      }

      if (categoryIds.length > 0) {
        const { data: cats } = await supabase.from("categories").select("id, title").in("id", categoryIds as any[]);
        cats?.forEach((c: any) => (categoryMap[Number(c.id)] = c));
      }

      const map: Record<number, any> = {};
      products.forEach((p: any) => {
        const prod = { ...p };
        // attach resolved shop and category objects when possible
        const shopId = Number(p.shop);
        const catId = Number(p.category);
        if (shopMap[shopId]) prod.shops = shopMap[shopId];
        if (categoryMap[catId]) prod.categories = categoryMap[catId];
        map[Number(p.id)] = prod;
      });
      setProductsMap(map);
    }
    fetchProducts();
  }, [items]);

  const deliveryFee =
    deliveryOptions.find((opt) => opt.id === selectedDelivery)?.price || 0;
  const total = totalPrice + deliveryFee;

  const handlePlaceOrder = async () => {
    // Simplified order placement logic
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // In a real app, you would save the order to the database here
      // prepare payload
      const { data: { session } } = await supabase.auth.getSession();
      const buyerId = session?.user?.id || null;

      const shippingAddress = deliveryType === "pickup" ? {
        type: "pickup",
        store: "Selected Store",
        address: null
      } : {
        type: "delivery",
        name: firstName,
        last_name: lastName,
        phone: phone,
        address: addressInput
      };

      let paymentPayload: any = {};
      if (deliveryType === "pickup") {
        paymentPayload = { type: "in_store", note: "Pay at store" };
      } else {
        paymentPayload = paymentMethod === "cash" ? { type: "cash", note: "Pay on delivery" } : { type: paymentMethod, details: cardDetails };
      }

      const insertRes = await supabase.from("orders").insert([{ 
        buyer_id: buyerId,
        status: "pending",
        shipping_address: shippingAddress,
        payment_method: paymentPayload,
        total: total
      }]);

      if (insertRes.error) throw insertRes.error;

      clearCart();
  const insertedId = (insertRes.data as any)?.[0]?.id || "12345";
  router.push("/order-confirmation?orderId=" + insertedId);
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#110e24] text-white flex flex-col items-center justify-center text-center p-4">
        <ShoppingCart size={60} className="mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">
          Add items to your cart to proceed to checkout.
        </p>
        <Link href="/products">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0b2e] to-[#110e24] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#1a0b2e]/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">Checkout</h1>
          <button className="p-2">
            <MoreVertical size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
  <main className="flex-grow container mx-auto px-4 py-6 pb-2">
        {/* User Info / Delivery vs Pickup */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-3">
            <button
              onClick={() => setDeliveryType("delivery")}
              className={`flex-1 p-4 rounded-lg border flex items-center justify-center gap-2 ${deliveryType === "delivery" ? "bg-blue-500/10 border-blue-500" : "bg-white/5 border-transparent"}`}
            >
              <Truck size={18} />
              <span>Delivery</span>
            </button>
            <button
              onClick={() => setDeliveryType("pickup")}
              className={`flex-1 p-4 rounded-lg border flex items-center justify-center gap-2 ${deliveryType === "pickup" ? "bg-blue-500/10 border-blue-500" : "bg-white/5 border-transparent"}`}
            >
              <Store size={18} />
              <span>Pick up</span>
            </button>
          </div>

          {deliveryType === "pickup" ? (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-semibold">{selectedStore?.shop_name || selectedStore?.title || "Selected Store"}</p>
              {selectedStore ? (
                <div className="text-sm text-muted-foreground">
                  {selectedStore.address && <div>{selectedStore.address}</div>}
                  {selectedStore.owner_name && <div className="mt-1">Owner: {selectedStore.owner_name}</div>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Store Address, City</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder="First name" className="p-2 rounded-md bg-transparent border border-transparent focus:border-border" />
                  <input value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder="Last name" className="p-2 rounded-md bg-transparent border border-transparent focus:border-border" />
                </div>
                <div className="mt-3">
                  <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 rounded-md bg-transparent border border-transparent focus:border-border" />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <p className="font-semibold mb-2">Meet at door (address)</p>
                <textarea value={addressInput} onChange={(e)=>setAddressInput(e.target.value)} placeholder="Edit or add address" className="w-full p-2 rounded-md bg-transparent border border-transparent focus:border-border" />
              </div>
            </div>
          )}
        </div>

        {/* Delivery Time / Options */}
        {deliveryType === "delivery" && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Delivery Options</h2>
            <div className="space-y-3">
              {/* Standard */}
              <div
                onClick={() => setSelectedDelivery("standard")}
                className={`p-4 rounded-lg border-2 flex items-center gap-4 transition-all cursor-pointer ${
                  selectedDelivery === "standard"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-transparent bg-white/5"
                }`}
              >
                <Clock size={24} className={selectedDelivery === "standard" ? "text-blue-500" : "text-muted-foreground"} />
                <div className="flex-1">
                  <p className="font-semibold">Standard</p>
                  <p className="text-sm text-muted-foreground">Regular delivery</p>
                </div>
                <span className="font-semibold">+₪50</span>
              </div>

              {/* Express */}
              <div
                onClick={() => setSelectedDelivery("priority")}
                className={`p-4 rounded-lg border-2 flex items-center gap-4 transition-all cursor-pointer ${
                  selectedDelivery === "priority"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-transparent bg-white/5"
                }`}
              >
                <Zap size={24} className={selectedDelivery === "priority" ? "text-blue-500" : "text-muted-foreground"} />
                <div className="flex-1">
                  <p className="font-semibold">Express</p>
                  <p className="text-sm text-muted-foreground">Faster delivery</p>
                </div>
                <span className="font-semibold">+₪100</span>
              </div>

              {/* Schedule */}
              <div
                onClick={() => setSelectedDelivery("schedule")}
                className={`p-4 rounded-lg border-2 flex items-center gap-4 transition-all cursor-pointer ${
                  selectedDelivery === "schedule"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-transparent bg-white/5"
                }`}
              >
                <Calendar size={24} className={selectedDelivery === "schedule" ? "text-blue-500" : "text-muted-foreground"} />
                <div className="flex-1">
                  <p className="font-semibold">Schedule</p>
                  <p className="text-sm text-muted-foreground">Choose a date & time</p>
                </div>
                {selectedDelivery === "schedule" && (
                  <CheckCircle size={20} className="text-blue-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods (only for delivery). For pickup, payment is done in-store. */}
        {deliveryType === "delivery" ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
            <div className="grid grid-cols-3 gap-3">
              {/* Visa card */}
              <button
                onClick={() => { setPaymentMethod("visa"); setShowCardModal(true); }}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-transform hover:scale-[1.02] ${paymentMethod === "visa" ? "ring-2 ring-indigo-400 shadow-lg bg-gradient-to-br from-indigo-700 to-indigo-500" : "bg-gradient-to-br from-gray-800 to-gray-700"}`}
              >
                {paymentMethod === "visa" && (
                  <span className="absolute top-3 right-3 inline-flex items-center justify-center bg-indigo-600 rounded-full p-1">
                    <CheckCircle size={14} className="text-white" />
                  </span>
                )}
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 overflow-hidden">
                  <img src="/Visa-Card-Logo-PNG-Clipart-Background-HD.png" alt="Card" className="w-full h-full object-contain" />
                </div>
                <div className="text-sm font-medium">Visa</div>
                <div className="text-xs text-muted-foreground">Fast & secure</div>
              </button>

              {/* Mastercard card */}
              <button
                onClick={() => { setPaymentMethod("card"); setShowCardModal(true); }}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-transform hover:scale-[1.02] ${paymentMethod === "card" ? "ring-2 ring-indigo-400 shadow-lg bg-gradient-to-br from-red-700 to-red-500" : "bg-gradient-to-br from-gray-800 to-gray-700"}`}
              >
                {paymentMethod === "card" && (
                  <span className="absolute top-3 right-3 inline-flex items-center justify-center bg-indigo-600 rounded-full p-1">
                    <CheckCircle size={14} className="text-white" />
                  </span>
                )}
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 overflow-hidden">
                  <img src="/Visa-Card-Logo-No-Background.png" alt="Visa" className="w-full h-full object-contain" />
                </div>
                <div className="text-sm font-medium">Card</div>
                <div className="text-xs text-muted-foreground">Save card or pay now</div>
              </button>

              {/* Cash card */}
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-transform hover:scale-[1.02] ${paymentMethod === "cash" ? "ring-2 ring-indigo-400 shadow-lg bg-gradient-to-br from-emerald-700 to-emerald-500" : "bg-gradient-to-br from-gray-800 to-gray-700"}`}
              >
                {paymentMethod === "cash" && (
                  <span className="absolute top-3 right-3 inline-flex items-center justify-center bg-indigo-600 rounded-full p-1">
                    <CheckCircle size={14} className="text-white" />
                  </span>
                )}
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white/10 overflow-hidden">
                  <img src="/cash-icon.webp" alt="Cash" className="w-full h-full object-contain" />
                </div>
                <div className="text-sm font-medium">Cash</div>
                <div className="text-xs text-muted-foreground">Pay on delivery</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="p-4 bg-white/5 rounded-lg text-sm">الدفع سيتم في المتجر عند الاستلام</div>
          </div>
        )}

        {/* Card Entry Modal */}
        <Dialog open={showCardModal} onOpenChange={(open) => setShowCardModal(open)}>
      <DialogContent className="w-[90vw] max-w-[360px] p-2 rounded-xl border border-white/10 bg-[#0b1220] shadow-2xl max-h-[420px] overflow-y-auto">
        <DialogTitle className="sr-only">Credit/Debit Card</DialogTitle>
              <div className="flex items-start gap-2">
                <input type="radio" checked readOnly className="mt-1" />
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-400" />
                  <div className="text-sm font-medium">Credit/Debit Card</div>
                </div>
              </div>

              <div className="mt-2 mb-1 text-sm font-semibold">Card Information</div>

              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Name on Card</div>
                  <input
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full py-2 px-3 rounded-lg bg-[#06101a] border border-white/5 placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">Card Number</div>
                  <input
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails((c) => ({ ...c, number: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full py-2 px-3 rounded-lg bg-[#06101a] border border-white/5 placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Expiry Date</div>
                    <input
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails((c) => ({ ...c, expiry: e.target.value }))}
                      placeholder="MM/YY"
                      className="w-full py-2 px-3 rounded-lg bg-[#06101a] border border-white/5 placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">CVV</div>
                    <input
                      value={cardDetails.cvc}
                      onChange={(e) => setCardDetails((c) => ({ ...c, cvc: e.target.value }))}
                      placeholder="123"
                      className="w-full py-2 px-3 rounded-lg bg-[#06101a] border border-white/5 placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <div className="w-full flex gap-2 mt-2">
                  <Button variant="outline" onClick={() => setShowCardModal(false)} className="w-full">Cancel</Button>
                  <Button onClick={() => setShowCardModal(false)} className="w-full">Save</Button>
                </div>
              </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Your Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Items</h2>
            <Link href="/cart">
              <Button variant="link" className="text-blue-400">
                See menu
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const p = productsMap[item.id];
              return (
                <div key={item.id} className="p-3 bg-white/5 rounded-lg flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-white/10 overflow-hidden flex-shrink-0">
                    <img
                      src={(p?.images?.[0] || item.image) as string}
                      alt={p?.title || item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{p?.title || item.name}</p>
                    <p className="text-sm text-muted-foreground">{p?.shops?.shop_name || p?.shop || "Store"}</p>
                    <p className="text-xs text-muted-foreground">{p?.categories?.title || p?.category || ""}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">x{item.quantity}</div>
                    <div className="text-sm">₪{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Sticky footer placed directly under "Your Items" */}
      <div className="sticky bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#110e24] via-[#110e24]/90 to-transparent pointer-events-none z-40">
        <div className="container mx-auto px-4 pointer-events-auto">
          <Button
            onClick={handlePlaceOrder}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-full text-lg"
          >
            {isLoading ? "Processing..." : `Continue (${total.toFixed(2)} ₪)`}
          </Button>
        </div>
      </div>

        {errorMsg && (
          <p className="mt-4 text-sm text-red-400 text-center">{errorMsg}</p>
        )}
      </main>
    </div>
  );
}
