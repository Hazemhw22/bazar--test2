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

// delivery options will be localized inside the component using t()

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const { t } = useI18n();
  // localized delivery options (use t for titles/descriptions)
  const deliveryOptions = [
    {
      id: "priority",
      title: t("checkout.delivery.option.priority.title"),
      description: t("checkout.delivery.option.priority.desc"),
      time: t("checkout.delivery.option.priority.time", { default: "20-30 min" }),
      price: 1.99,
      icon: Zap,
    },
    {
      id: "standard",
      title: t("checkout.delivery.option.standard.title"),
      description: t("checkout.delivery.option.standard.desc"),
      time: t("checkout.delivery.option.standard.time", { default: "20-30 min" }),
      price: 0,
      icon: Clock,
    },
    {
      id: "schedule",
      title: t("checkout.delivery.option.schedule.title"),
      description: t("checkout.delivery.option.schedule.desc"),
      time: "",
      price: 0,
      icon: Calendar,
    },
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
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
          .from("user_profiles")
          .select("name, address, phone")
          .eq("user_id", session.user.id)
          .single();
        if (profile) {
          setUser({
            name: profile.name || "Name Last name",
            address: profile.address || "address",
            deliveryNote: "Add delivery note",
          });
          // prefill name/phone/address
          setFirstName(profile.name ? profile.name.split(" ")[0] : "");
          setLastName(profile.name ? profile.name.split(" ").slice(1).join(" ") : "");
          setAddressInput(profile.address || "");
          setPhone(profile.phone || "");
          // prefill email from session when available
          setEmail(session?.user?.email || "");
        }
        // if session exists but profile row not found, still set email from session
        if (!profile) {
          setEmail(session?.user?.email || "");
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
      
      // Fetch products with related shop and category data using Supabase joins
      const { data: products } = await supabase
        .from("products")
        .select(`
          *,
          shops:shop_id (
            id,
            name,
            logo_url,
            address
          ),
          products_categories:category_id (
            id,
            name
          )
        `)
        .in("id", ids as any[]);
      
      if (!products) return;

      const map: Record<number, any> = {};
      products.forEach((p: any) => {
        map[Number(p.id)] = p;
      });
      setProductsMap(map);
    }
    fetchProducts();
  }, [items]);

  // Calculate delivery fee based on selected option
  const deliveryFee = deliveryType === 'delivery' ? 
    (deliveryOptions.find((opt) => opt.id === selectedDelivery)?.price || 0) : 0;
  
  // For now, use the cart total + delivery fee
  // This will be updated after calculating the actual total from the API
  const total = totalPrice + deliveryFee;

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      
      // Get user role if authenticated (optional, don't fail if it errors)
      let userRole = null;
      if (userId) {
        try {
          const roleResponse = await fetch('/api/users/get-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId })
          });
          
          if (roleResponse.ok) {
            const roleData = await roleResponse.json();
            if (roleData.success && roleData.data) {
              userRole = roleData.data.role_id;
            }
          }
        } catch (err) {
          console.log('Could not fetch user role:', err);
          // Continue without role - it's not critical
        }
      }

      // Get shop_id from the first product in cart
      const firstProductShopId = items[0] && productsMap[items[0].id] 
        ? (productsMap[items[0].id].shop_id || productsMap[items[0].id].shop)
        : null;
      
      const shopId = selectedStore?.id || firstProductShopId;
      
      if (!shopId) {
        throw new Error('Unable to determine shop for this order. Please try again.');
      }

      // Prepare order payload according to the API contract
      const orderPayload: any = {
        shop_id: shopId,
        customer_name: `${firstName} ${lastName}`.trim(),
        customer_phone: phone,
        customer_email: email,
        customer_address: deliveryType === 'delivery' ? addressInput : null,
        order_type: deliveryType,
        payment_method: deliveryType === 'pickup' ? 'cash' : paymentMethod === 'cash' ? 'cash' : 'card',
        discount_percentage: 0, // Can be updated based on user role or promotions
        delivery_notes: '', // Can be added from UI if needed
        products: items.map(item => ({
          product_id: item.id,
          selected_features: item.features?.map(f => ({
            feature_id: f.feature_id,
            value_id: f.value_id
          })) || []
        }))
      };

      // Only add customer_id if user is authenticated
      if (userId) {
        try {
          // Use API route with service role to bypass RLS
          const profileResponse = await fetch('/api/users/get-or-create-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              email: email,
              name: `${firstName} ${lastName}`.trim(),
              phone: phone,
              address: addressInput
            })
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.success && profileData.data) {
              orderPayload.customer_id = profileData.data.id;
            }
          } else {
            console.error('Failed to get/create user profile');
            // Continue without customer_id - order can still be created
          }
        } catch (err) {
          console.error('Error handling user profile:', err);
          // Continue without customer_id - order can still be created
        }
      }


      // Don't include delivery_company_id, delivery_method_id, or delivery_location_method_id
      // They will be added later when you have actual delivery companies in the database

      // If user has role 7, apply special handling
      if (userRole === 7) {
        // Apply any special discount or handling for role 7
        orderPayload.discount_percentage = 10; // Example: 10% discount for role 7
      }

      // First, calculate pricing to get accurate totals
      console.log('Calculating pricing with payload:', orderPayload);
      const calculateResponse = await fetch('/api/orders/calculate-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      if (!calculateResponse.ok) {
        const errorData = await calculateResponse.json();
        console.error('Pricing calculation failed:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to calculate order total');
      }

      const { data: pricingData } = await calculateResponse.json();
      console.log('Pricing calculated:', pricingData);
      
      // Now create the order with the calculated pricing
      const createResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderPayload,
          subtotal: pricingData.subtotal,
          delivery_cost: pricingData.delivery_cost,
          total_amount: pricingData.total_amount
        })
      });

      const responseData = await createResponse.json();
      
      if (!createResponse.ok) {
        console.error('Order creation failed:', responseData);
        const errorMsg = responseData.error || responseData.message || 'Failed to create order';
        const missingFields = responseData.missing ? ` Missing fields: ${responseData.missing.join(', ')}` : '';
        throw new Error(errorMsg + missingFields);
      }

      // Clear cart and redirect to confirmation
      clearCart();
      router.push(`/order-confirmation?orderId=${responseData.data.id}`);
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
        <h1 className="text-2xl font-bold mb-2">{t("checkout.empty.title")}</h1>
        <p className="text-muted-foreground mb-6">{t("checkout.empty.hint")}</p>
        <Link href="/products">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full text-lg">
            {t("checkout.empty.button")}
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
          <h1 className="text-lg font-semibold">{t("checkout.header.title")}</h1>
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
              <span>{t("checkout.delivery.button")}</span>
            </button>
            <button
              onClick={() => setDeliveryType("pickup")}
              className={`flex-1 p-4 rounded-lg border flex items-center justify-center gap-2 ${deliveryType === "pickup" ? "bg-blue-500/10 border-blue-500" : "bg-white/5 border-transparent"}`}
            >
              <Store size={18} />
              <span>{t("checkout.pickup.button")}</span>
            </button>
          </div>

          {deliveryType === "pickup" ? (
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="font-semibold">{selectedStore?.shop_name || selectedStore?.title || t("checkout.selectedStore.fallback")}</p>
              {selectedStore ? (
                <div className="text-sm text-muted-foreground">
                  {selectedStore.address && <div>{selectedStore.address}</div>}
                  {selectedStore.owner_name && <div className="mt-1">Owner: {selectedStore.owner_name}</div>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("checkout.selectedStore.addressFallback")}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-white/5 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder={t("checkout.input.firstName.placeholder")} className="p-2 rounded-md bg-transparent border border-transparent focus:border-border" />
                  <input value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder={t("checkout.input.lastName.placeholder")} className="p-2 rounded-md bg-transparent border border-transparent focus:border-border" />
                </div>
                <div className="mt-3">
                  <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder={t("checkout.input.phone.placeholder")} className="w-full p-2 rounded-md bg-transparent border border-transparent focus:border-border" />
                </div>
                <div className="mt-3">
                  <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder={t("checkout.input.email.placeholder")} type="email" className="w-full p-2 rounded-md bg-transparent border border-transparent focus:border-border" />
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <p className="font-semibold mb-2">{t("checkout.delivery.meetTitle")}</p>
                <textarea value={addressInput} onChange={(e)=>setAddressInput(e.target.value)} placeholder={t("checkout.input.address.placeholder")} className="w-full p-2 rounded-md bg-transparent border border-transparent focus:border-border" />
              </div>
            </div>
          )}
        </div>

        {/* Delivery Time / Options */}
        {deliveryType === "delivery" && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{t("checkout.delivery.options.title")}</h2>
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
                  <p className="font-semibold">{t("checkout.delivery.option.standard.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("checkout.delivery.option.standard.desc")}</p>
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
                  <p className="font-semibold">{t("checkout.delivery.option.priority.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("checkout.delivery.option.priority.desc")}</p>
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
                  <p className="font-semibold">{t("checkout.delivery.option.schedule.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("checkout.delivery.option.schedule.desc")}</p>
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
            <h2 className="text-xl font-bold mb-4">{t("checkout.payment.title")}</h2>
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
                <div className="text-sm font-medium">{t("checkout.payment.visa")}</div>
                <div className="text-xs text-muted-foreground">{t("checkout.payment.visaDesc")}</div>
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
                <div className="text-sm font-medium">{t("checkout.payment.card")}</div>
                <div className="text-xs text-muted-foreground">{t("checkout.payment.cardDesc")}</div>
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
                <div className="text-sm font-medium">{t("checkout.payment.cash")}</div>
                <div className="text-xs text-muted-foreground">{t("checkout.payment.cashDesc")}</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8">
            <div className="p-4 bg-white/5 rounded-lg text-sm">{t("checkout.payment.payInStore")}</div>
          </div>
        )}

        {/* Card Entry Modal */}
        <Dialog open={showCardModal} onOpenChange={(open) => setShowCardModal(open)}>
        <DialogContent className="w-[90vw] max-w-[360px] p-2 rounded-xl border border-white/10 bg-[#0b1220] shadow-2xl max-h-[420px] overflow-y-auto">
        <DialogTitle className="sr-only">{t("checkout.dialog.title")}</DialogTitle>
              <div className="flex items-start gap-2">
                <input type="radio" checked readOnly className="mt-1" />
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-400" />
                  <div className="text-sm font-medium">{t("checkout.dialog.creditTitle")}</div>
                </div>
              </div>

              <div className="mt-2 mb-1 text-sm font-semibold">Card Information</div>

              <div className="space-y-2">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">{t("checkout.card.name")}</div>
                  <input
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails((c) => ({ ...c, name: e.target.value }))}
                    placeholder="Full name"
                    className="w-full py-2 px-3 rounded-lg bg-[#06101a] border border-white/5 placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">{t("checkout.card.number")}</div>
                  <input
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails((c) => ({ ...c, number: e.target.value }))}
                    placeholder="1234 5678 9012 3456"
                    className="w-full py-2 px-3 rounded-lg bg-[#06101a] border border-white/5 placeholder:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">{t("checkout.card.expiry")}</div>
                    <input
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails((c) => ({ ...c, expiry: e.target.value }))}
                      placeholder="MM/YY"
                      className="w-full py-2 px-3 rounded-lg bg-[#06101a] border border-white/5 placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">{t("checkout.card.cvv")}</div>
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
                  <Button variant="outline" onClick={() => setShowCardModal(false)} className="w-full">{t("checkout.card.cancel")}</Button>
                  <Button onClick={() => setShowCardModal(false)} className="w-full">{t("checkout.card.save")}</Button>
                </div>
              </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Your Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t("checkout.items.title")}</h2>
            <Link href="/cart">
              <Button variant="link" className="text-blue-400">
                {t("checkout.items.seeMenu")}
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const p = productsMap[item.id];
              return (
                <div key={item.id} className="p-3 bg-white/5 rounded-lg flex items-center gap-4 border border-[#666665]">
                  <div className="w-16 h-16 rounded-md bg-white/10 overflow-hidden flex-shrink-0">
                    <img
                      src={(p?.image_url || item.image) as string}
                      alt={p?.title || item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{p?.name || p?.title || item.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {p?.shops && (
                        <span className="text-xs px-2 py-1 rounded border border-blue-400 bg-blue-400/10 text-blue-300">
                          {p.shops.name || p.shops.shop_name}
                        </span>
                      )}
                      {(p?.products_categories || p?.categories) && (
                        <span className="text-xs px-2 py-1 rounded border border-green-400 bg-green-400/10 text-green-300">
                          {p.products_categories?.name || p.categories?.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">x{item.quantity}</div>
                    <div className="text-sm">₪{((item.salePrice || item.price) * item.quantity).toFixed(2)}</div>
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
            {isLoading ? t("checkout.processing") : t("checkout.continue", { total: total.toFixed(2) })}
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
