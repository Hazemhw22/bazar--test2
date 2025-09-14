"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  Building2,
  Banknote,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import type {
  PaymentMethodJson,
  ShippingAddressJson,
  ShippingMethodJson,
} from "@/lib/type";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  shippingMethod: string;
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  sameAsShipping: boolean;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZipCode: string;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "IL",
    phone: "",
    shippingMethod: "standard",
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    sameAsShipping: true,
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZipCode: "",
  });
  
  // Auto-fill user data if logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            // Split full name into first and last name
            const nameParts = profileData.full_name?.split(' ') || ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            setFormData(prev => ({
              ...prev,
              email: profileData.email || prev.email,
              firstName: firstName,
              lastName: lastName,
              phone: profileData.phone || prev.phone,
              address: profileData.address || prev.address,
              city: profileData.city || prev.city,
              state: profileData.state || prev.state,
              zipCode: profileData.zip_code || prev.zipCode,
              country: profileData.country || prev.country,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
    fetchUserProfile();
  }, []);

  const subtotal = totalPrice;
  const shippingCost =
    formData.shippingMethod === "express"
      ? 30
      : formData.shippingMethod === "overnight"
      ? 50
      : formData.shippingMethod === "instore"
      ? 0
      : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shippingCost + tax;

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    if (field === 'shippingMethod' && value === 'instore') {
      // If shipping method is set to in-store, automatically set payment method to in-store
      setFormData((prev) => ({ ...prev, [field]: value as string, paymentMethod: 'instore' }));
    } else if (field === 'shippingMethod' && formData.paymentMethod === 'instore') {
      // If changing from in-store shipping to another method, reset payment method to default
      setFormData((prev) => ({ ...prev, [field]: value as string, paymentMethod: 'card' }));
    } else if (field === 'paymentMethod' && value === 'instore' && formData.shippingMethod !== 'instore') {
      // If payment method is set to in-store, automatically set shipping method to in-store
      setFormData((prev) => ({ ...prev, [field]: value as string, shippingMethod: 'instore' }));
    } else if (field === 'paymentMethod' && formData.shippingMethod === 'instore' && value !== 'instore') {
      // Prevent changing payment method if shipping method is in-store
      return;
    } else {
      setFormData((prev) => ({ ...prev, [field]: value as string }));
    }
  };

  const validate = () => {
    const required = [
      formData.email,
      formData.firstName,
      formData.address,
      formData.city,
      formData.state,
      formData.zipCode,
      formData.phone,
    ];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (required.some((v) => !String(v).trim())) {
      return "Please fill all required fields.";
    }
    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  function randomPassword(length = 16) {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < length; i++)
      pass += chars[Math.floor(Math.random() * chars.length)];
    return pass;
  }

  const handlePlaceOrder = async () => {
    setErrorMsg(null);
    const invalid = validate();
    if (invalid) {
      setErrorMsg(invalid);
      return;
    }

    setIsLoading(true);

    try {
      // 1️⃣ تحقق من وجود المستخدم في profiles
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", formData.email)
        .maybeSingle();

      let userId: string | null = existingProfile?.id ?? null;

      // 2️⃣ إذا المستخدم غير موجود، أنشئ حساب جديد في Auth و profiles
      if (!userId) {
        const generatedPassword = randomPassword();
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: generatedPassword,
        });

        if (signUpError && signUpError.message.includes("already registered")) {
          // المستخدم موجود مسبقًا في Auth
          const { data: sessionData } = await supabase.auth.getSession();
          userId = sessionData.session?.user.id ?? null;
        } else if (signUpData.user?.id) {
          userId = signUpData.user.id;
        }

        if (!userId) throw new Error("Failed to create or fetch user account");

        // إدخال أو تحديث بيانات الـ profile
        await supabase.from("profiles").upsert(
          {
            id: userId,
            full_name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            country: formData.country,
            status: "active",
            role: 3,
            registration_date: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }

      // 3️⃣ تحضير بيانات الشحن والدفع
      const shipping_method: ShippingMethodJson = {
        type:
          formData.shippingMethod === "standard"
            ? "Standard"
            : formData.shippingMethod === "express"
            ? "Express"
            : "Overnight",
        duration:
          formData.shippingMethod === "standard"
            ? "5-7 Business Days"
            : formData.shippingMethod === "express"
            ? "2-3 Business Days"
            : "1 Business Day",
        cost: shippingCost,
      };

      const shipping_address: ShippingAddressJson = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        address: formData.address,
        city: formData.city,
        zip: formData.zipCode,
        district: formData.state,
        phone: formData.phone,
        email: formData.email,
      };

      const payment_method: PaymentMethodJson =
        formData.paymentMethod === "card"
          ? {
              type: "Credit Card",
              name_on_card: formData.cardName,
              card_number: formData.cardNumber
                ? `** ** ** ${formData.cardNumber.slice(-4)}`
                : undefined,
              expiration_date: formData.expiryDate,
              provider: "Visa",
            }
          : formData.paymentMethod === "bank"
          ? { type: "Bank Transfer" }
          : formData.paymentMethod === "instore"
          ? { type: "In-store" }
          : formData.paymentMethod === "paypal"
          ? { type: "PayPal" }
          : { type: "Cash on Delivery" };

      // 4️⃣ إدخال الطلب
      const primaryProductId = Number(items[0]?.id ?? 0);
      const { data: insertedOrders, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: userId,
          status: "processing",
          product_id: primaryProductId,
          shipping_method,
          shipping_address,
          payment_method,
        })
        .select(); // مهم: لنحصل على الصفوف المُدخلة

      if (orderError || !insertedOrders?.length) throw orderError ?? new Error("Failed to create order");

      const realOrderId = insertedOrders[0].id;

      // 5️⃣ مسح السلة والانتقال لتأكيد الطلب
      clearCart();
      router.push(`/order-confirmation?orderId=${realOrderId}`);

    } catch (e: any) {
      setErrorMsg(e.message ?? "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/cart">
            <Button>Go to Cart</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-2 lg:py-8 mobile:max-w-[480px]">
        <div className="mb-4 lg:mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Cart
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold">Checkout</h1>
          {errorMsg && (
            <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Checkout Form */}
          <div className="space-y-4 lg:space-y-6">
            {/* Contact Information */}
            <Card className="bg-card rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin size={20} />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+972-50-123-4567"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-card rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="123 Main Street"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">
                      City
                    </Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) =>
                        handleInputChange("city", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jerusalem">Jerusalem</SelectItem>
                        <SelectItem value="Tel Aviv">Tel Aviv</SelectItem>
                        <SelectItem value="Haifa">Haifa</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium">
                      District
                    </Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        handleInputChange("state", value)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Central">Central</SelectItem>
                        <SelectItem value="Northern">Northern</SelectItem>
                        <SelectItem value="Southern">Southern</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="zipCode" className="text-sm font-medium">
                    ZIP Code
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                    placeholder="12345"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="bg-card rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck size={20} />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.shippingMethod}
                  onValueChange={(value) =>
                    handleInputChange("shippingMethod", value)
                  }
                  className="space-y-3"
                >
                  <div
                    className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      formData.shippingMethod === "standard"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <p className="font-medium">Standard Shipping</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            5-7 business days
                          </p>
                        </div>
                        <span className="font-medium mt-1 sm:mt-0">₪10.00</span>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      formData.shippingMethod === "express"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <p className="font-medium">Express Shipping</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            2-3 business days
                          </p>
                        </div>
                        <span className="font-medium mt-1 sm:mt-0">₪30.00</span>
                      </div>
                    </Label>
                  </div>

                  <div
                    className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      formData.shippingMethod === "overnight"
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <RadioGroupItem value="overnight" id="overnight" />
                    <Label
                      htmlFor="overnight"
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <p className="font-medium">Overnight Shipping</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Next business day
                          </p>
                        </div>
                        <span className="font-medium mt-1 sm:mt-0">₪50.00</span>
                      </div>
                    </Label>
                  </div>

                  {/* Pick Up In-Store */}
                  <div
                    className={`flex flex-col border rounded-2xl transition-colors ${
                      formData.shippingMethod === "instore"
                        ? "border-blue-600 bg-blue-600/10"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <RadioGroupItem value="instore" id="instore" />
                      <Label
                        htmlFor="instore"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Building2 size={18} />
                        Pick Up In-Store
                        <Badge className="ml-auto bg-green-600">Free</Badge>
                      </Label>
                    </div>
                    {formData.shippingMethod === "instore" && (
                      <div className="space-y-4 px-4 pb-4">
                        <div className="flex items-center gap-2">
                          <Building2 size={20} className="text-green-600" />
                          <h4 className="font-medium text-sm">
                            Store Location
                          </h4>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="font-medium">Main Store Location:</p>
                          <div className="text-gray-600 dark:text-gray-400">
                            <p>123 Commerce Street</p>
                            <p>Arad, Israel 8920435</p>
                            <p>Phone: +972-8-123-4567</p>
                          </div>
                          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <strong>Store Hours:</strong>
                              <br />
                              Sunday - Thursday: 9:00 AM - 8:00 PM
                              <br />
                              Friday: 9:00 AM - 2:00 PM
                              <br />
                              Saturday: Closed
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Please bring your order confirmation and a valid ID
                            when visiting the store.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-card rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard size={20} />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.shippingMethod === 'instore' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Building2 size={16} />
                      When using in-store pickup, payment will be made at the store.
                    </p>
                  </div>
                )}
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    handleInputChange("paymentMethod", value)
                  }
                  className="space-y-3"
                  disabled={formData.shippingMethod === 'instore'}
                >
                  {/* Credit/Debit Card */}
                  <div
                    className={`flex flex-col border rounded-2xl transition-colors ${
                      formData.paymentMethod === "card"
                        ? "border-blue-600 bg-blue-600/10"
                        : formData.shippingMethod === 'instore'
                        ? "border-border/60 opacity-50 cursor-not-allowed"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <RadioGroupItem value="card" id="card" />
                      <Label
                        htmlFor="card"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard size={18} />
                        Credit/Debit Card
                      </Label>
                    </div>
                    {formData.paymentMethod === "card" && (
                      <div className="space-y-4 px-4 pb-4">
                        <h4 className="font-medium text-sm">
                          Card Information
                        </h4>
                        <div>
                          <Label
                            htmlFor="cardName"
                            className="text-sm font-medium"
                          >
                            Name on Card
                          </Label>
                          <Input
                            id="cardName"
                            value={formData.cardName}
                            onChange={(e) =>
                              handleInputChange("cardName", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="cardNumber"
                            className="text-sm font-medium"
                          >
                            Card Number
                          </Label>
                          <Input
                            id="cardNumber"
                            value={formData.cardNumber}
                            onChange={(e) =>
                              handleInputChange("cardNumber", e.target.value)
                            }
                            placeholder="1234 5678 9012 3456"
                            className="mt-1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="expiryDate"
                              className="text-sm font-medium"
                            >
                              Expiry Date
                            </Label>
                            <Input
                              id="expiryDate"
                              value={formData.expiryDate}
                              onChange={(e) =>
                                handleInputChange("expiryDate", e.target.value)
                              }
                              placeholder="MM/YY"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="cvv"
                              className="text-sm font-medium"
                            >
                              CVV
                            </Label>
                            <Input
                              id="cvv"
                              value={formData.cvv}
                              onChange={(e) =>
                                handleInputChange("cvv", e.target.value)
                              }
                              placeholder="123"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bank Transfer */}
                  <div
                    className={`flex flex-col border rounded-2xl transition-colors ${
                      formData.paymentMethod === "bank"
                        ? "border-blue-600 bg-blue-600/10"
                        : formData.shippingMethod === 'instore'
                        ? "border-border/60 opacity-50 cursor-not-allowed"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label
                        htmlFor="bank"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Banknote size={18} />
                        Bank Transfer
                      </Label>
                    </div>
                    {formData.paymentMethod === "bank" && (
                      <div className="space-y-4 px-4 pb-4">
                        <div className="flex items-center gap-2">
                          <Banknote size={20} className="text-blue-600" />
                          <h4 className="font-medium text-sm">
                            Bank Transfer Instructions
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Bank transfer details will be provided after order
                          confirmation. You will receive an email with complete
                          banking information and payment instructions.
                        </p>
                      </div>
                    )}
                  </div>

                  

                  {/* PayPal */}
                  <div
                    className={`flex flex-col border rounded-2xl transition-colors ${
                      formData.paymentMethod === "paypal"
                        ? "border-blue-600 bg-blue-600/10"
                        : formData.shippingMethod === 'instore'
                        ? "border-border/60 opacity-50 cursor-not-allowed"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <RadioGroupItem value="paypal" id="paypal" />
                      <Label
                        htmlFor="paypal"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span className="text-blue-600 font-bold">PayPal</span>
                      </Label>
                    </div>
                    {formData.paymentMethod === "paypal" && (
                      <div className="space-y-4 px-4 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-bold">
                            PayPal
                          </span>
                          <h4 className="font-medium text-sm">
                            PayPal Payment
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          You will be redirected to PayPal to complete your
                          purchase securely.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cash on Delivery */}
                  <div
                    className={`flex flex-col border rounded-2xl transition-colors ${
                      formData.paymentMethod === "cod"
                        ? "border-blue-600 bg-blue-600/10"
                        : formData.shippingMethod === 'instore'
                        ? "border-border/60 opacity-50 cursor-not-allowed"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label
                        htmlFor="cod"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Banknote size={18} />
                        Cash on Delivery
                      </Label>
                    </div>
                    {formData.paymentMethod === "cod" && (
                      <div className="space-y-4 px-4 pb-4">
                        <div className="flex items-center gap-2">
                          <Banknote size={20} className="text-green-600" />
                          <h4 className="font-medium text-sm">
                            Pay with cash upon delivery
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Please prepare the exact amount. Our courier will
                          collect the payment when your order is delivered.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Mobile: Shows at bottom, Desktop: Shows on right */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <Card className="bg-card rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items - Scrollable on mobile if many items */}
                <div className="space-y-3 max-h-64 lg:max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-12 lg:w-16 lg:h-16 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            item.image || "/placeholder.svg?height=64&width=64"
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium text-sm">
                        ₪{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₪{subtotal.toFixed()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₪{shippingCost.toFixed()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₪{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-base lg:text-lg font-semibold">
                    <span>Total</span>
                    <span>₪{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Place Order"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
