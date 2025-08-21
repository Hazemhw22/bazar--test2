"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart()
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null)

  const subtotal = totalPrice
  const shipping = subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.08
  const discount = appliedPromo ? subtotal * (appliedPromo.discount / 100) : 0
  const total = subtotal + shipping + tax - discount

  const handleApplyPromo = () => {
    const promoCodes: Record<string, number> = {
      SAVE10: 10,
      WELCOME20: 20,
      SUMMER15: 15,
    }

    if (promoCodes[promoCode.toUpperCase()]) {
      setAppliedPromo({
        code: promoCode.toUpperCase(),
        discount: promoCodes[promoCode.toUpperCase()],
      })
    }
  }

  const removePromo = () => {
    setAppliedPromo(null)
    setPromoCode("")
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag size={80} className="mx-auto text-gray-400 mb-6" />
            <h1 className="text-2xl font-bold mb-3">Your cart is empty</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/products">
              <Button size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-4 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {/* Mobile-first layout */}
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={item.image || "/placeholder.svg?height=96&width=96"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-semibold text-base lg:text-lg truncate">{item.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">${item.price.toFixed(2)} each</p>
                          </div>

                          {/* Remove button - Top right on mobile */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>

                        {/* Quantity and Price Row */}
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                              className="h-9 w-9 p-0"
                            >
                              <Minus size={16} />
                            </Button>
                            <span className="font-medium text-base min-w-[2rem] text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-9 w-9 p-0"
                            >
                              <Plus size={16} />
                            </Button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <span className="font-bold text-lg">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            {/* Promo Code */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Promo Code</CardTitle>
              </CardHeader>
              <CardContent>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">{appliedPromo.code}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{appliedPromo.discount}% off applied</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removePromo} className="text-red-600 hover:text-red-700">
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="text-base"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim()}
                      size="lg"
                    >
                      Apply Code
                    </Button>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Try: SAVE10, WELCOME20, or SUMMER15
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-base">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>Discount ({appliedPromo.code})</span>
                      <span className="font-medium">-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {shipping > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    💡 Free shipping on orders over $100
                  </p>
                )}

                <Link href="/checkout" className="block">
                  <Button className="w-full mt-6" size="lg">
                    Proceed to Checkout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
