"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  User,
  Settings,
  Mail,
  Globe,
  Bell,
  Heart,
  Phone,
  MapPin,
  Package,
  Camera,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ShoppingBag, Star, Trash2, Eye  
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Profile, OrderData } from "@/lib/type"
import AccountPageWrapper from "@/components/AccountPageWrapper"
import { useCart } from "@/components/cart-provider"
import { useFavorites } from "@/components/favourite-items"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"


export default function EnhancedProfilePage() {
  const { t, direction } = useI18n()
  const [profileData, setProfileData] = useState<Profile | null>(null)
  const [ordersData, setOrdersData] = useState<OrderData[]>([])
  const [addressesData, setAddressesData] = useState<Profile[]>([])
  const [tabNav, setTabNav] = useState<'account' | 'orders' | 'addresses' | 'wishlist' | 'settings'>('account')
    const { favorites, removeFromFavorites } = useFavorites()
      const { addItem } = useCart()

    const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  })

  // ألوان وأيقونات الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "shipped": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "processing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle size={16} className="text-green-600" />
      case "shipped": return <Truck size={16} className="text-blue-600" />
      case "processing": return <Clock size={16} className="text-yellow-600" />
      case "cancelled": return <XCircle size={16} className="text-red-600" />
      default: return <AlertCircle size={16} className="text-gray-600" />
    }
  }

  // جلب البيانات
  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return
      const userId = session.user.id

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
      setProfileData(profile || null)

      const { data: orders } = await supabase
        .from("orders")
        .select(`*, products:product_id (*), profiles:buyer_id (*)`)
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false })
      setOrdersData(orders || [])

      const { data: addresses } = await supabase.from("profiles").select("*").eq("id", userId)
      setAddressesData(addresses || [])
    }

    fetchData()
  }, [])
  const handleAddToCart = (item: any) => {
      addItem({
        id: item.id,
        name: item.name,
        price: item.discountedPrice,
        image: item.image,
        quantity: 1,
      })
    }
  return (
    <AccountPageWrapper>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t("account.title")}</h1>
            <p className="text-gray-600 dark:text-gray-400">{t("account.subtitle")}</p>
          </div>

          <Tabs value={tabNav} onValueChange={(v) => setTabNav(v as any)} className="space-y-6">
            {/* Tabs Navigation - contact page style (buttons) */}
            <div className="bg-card border-b border-border/50 sticky top-0 z-10">
              <div className="container mx-auto px-4">
                <div className="flex overflow-x-auto">
                  <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    {[
                      { id: 'account', label: t('tabs.account'), Icon: User },
                      { id: 'orders', label: t('tabs.orders'), Icon: Package },
                      { id: 'addresses', label: t('tabs.addresses'), Icon: MapPin },
                      { id: 'wishlist', label: t('tabs.wishlist'), Icon: Heart },
                      { id: 'settings', label: t('tabs.settings'), Icon: Settings },
                    ].map((tab) => {
                      const active = tabNav === tab.id
                      const Icon = (tab as any).Icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setTabNav(tab.id as any)}
                          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                            active
                              ? 'border-blue-500 text-blue-500 dark:text-blue-400'
                              : 'border-transparent text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
                          } ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}
                        >
                          <Icon size={16} />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className={direction === "rtl" ? "text-right" : ""}>{t("account.title")}</CardTitle>
                </CardHeader>
                <CardContent className={`${direction === "rtl" ? "text-right" : ""} space-y-6`}>
                  <div className={`flex flex-col sm:flex-row items-center gap-6 ${direction === "rtl" ? "sm:flex-row-reverse" : ""}`}>
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={profileData?.avatar_url || "/AVATAR1.png"}
                          alt="Profile"
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                        variant="secondary"
                      >
                        <Camera size={14} />
                      </Button>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl font-semibold">{profileData?.full_name}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{profileData?.email}</p>
                      <p className="text-sm text-gray-500">{t("account.memberSince", { date: profileData?.registration_date ?? "" })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
                  {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${direction === "rtl" ? "flex-row-reverse text-right" : ""}`}>
                  <Package size={24} />
                  {t("account.orderHistory")}
                </CardTitle>
              </CardHeader>
              <CardContent className={`${direction === "rtl" ? "text-right" : ""} space-y-4`}>
                {ordersData && ordersData.length > 0 ? (
                  ordersData.map((order: OrderData) => (
                    <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            {order.products?.images && order.products.images.length > 0 ? (
                              <Image
                                src={order.products.images[0]}
                                alt={order.products.title || "Product"}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={24} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className={`${direction === "rtl" ? "text-right" : ""}`}>
                              <h4 className="font-semibold text-lg">{order.products?.title || "Product"}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{t("account.order", { id: order.id })}</p>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            {/* Payment Method */}
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <div>
                                <p className="font-medium">Payment</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {order.payment_method?.type || "Credit Card"}
                                </p>
                              </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <div>
                                <p className="font-medium">Delivery</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {order.shipping_method?.type || "Standard"}
                                </p>
                              </div>
                            </div>

                            {/* Order Date */}
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <div>
                                <p className="font-medium">{t("account.date")}</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{t("account.totalAmount")}</span>
                            <span className="font-bold text-lg">
                              ₪{order.products?.price || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                    <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("account.noOrders")}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{t("account.noOrdersHint")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
            {/* Addresses Tab */}
            <TabsContent value="addresses" className="space-y-6">
              <Card>
                <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${direction === "rtl" ? "flex-row-reverse text-right" : ""}`}><MapPin size={24} /> {t("account.savedAddresses")}</CardTitle>
                </CardHeader>
                <CardContent className={direction === "rtl" ? "text-right" : ""}>
                  {addressesData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addressesData.map((address: Profile) => (
                        <div key={address.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <p className="font-medium text-gray-900 dark:text-white">{profileData?.address}</p>
                              {address.phone && <p className="mt-1 flex items-center gap-1"><Phone size={14} /> {address.phone}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("account.noAddresses")}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{t("account.noAddressesHint")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

             {/* Enhanced Wishlist Tab with Favorites Integration */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={direction === "rtl" ? "text-right" : ""}>{t("account.wishlistTitle", { count: String(favorites.length) })}</CardTitle>
              </CardHeader>
              <CardContent className={direction === "rtl" ? "text-right" : ""}>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t("account.noFavorites")}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t("account.noFavoritesDescription")}</p>
                    <Link href="/products">
                    <Button>
                      <ShoppingBag size={16} className="mr-2" />
                      {t("account.startShopping")}
                    </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((item) => (
                      <div
                        key={item.id}
                        className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-square bg-gray-50 dark:bg-gray-900 overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Remove Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/90 dark:bg-gray-800/90 text-red-500 hover:text-red-700 hover:bg-white dark:hover:bg-gray-800 shadow-md"
                            onClick={() => removeFromFavorites(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>

                          {/* Stock Status Badge */}
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Badge
                                variant="secondary"
                                className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              >
                                Out of Stock
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="p-4 space-y-3">
                          {/* Store Badge */}
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                            >
                              {item.store}
                            </Badge>
                            {item.inStock && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                              >
                                {t("account.inStock")}
                              </Badge>
                            )}
                          </div>

                          {/* Product Name */}
                          <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                            {item.name}
                          </h4>

                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={`${
                                    i < item.rating
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {item.rating}.0 ({item.reviews})
                            </span>
                          </div>

                          {/* Price */}
                          <div className="space-y-1">
                            {item.price !== item.discountedPrice && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                  ${item.price.toFixed(2)}
                                </span>
                                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                  -{Math.round(((item.price - item.discountedPrice) / item.price) * 100)}%
                                </Badge>
                              </div>
                            )}
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                              ₪{item.discountedPrice.toFixed(2)}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button className="flex-1" disabled={!item.inStock} onClick={() => handleAddToCart(item)}>
                              <ShoppingBag size={16} className="mr-2" />
                              {item.inStock ? t("account.addToCart") : t("account.outOfStock")}
                            </Button>
                            <Button variant="outline" size="sm" className="px-3">
                              <Eye size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>


           {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={direction === "rtl" ? "text-right" : ""}>{t("account.notificationPreferences")}</CardTitle>
              </CardHeader>
              <CardContent className={`${direction === "rtl" ? "text-right" : ""} space-y-6`}>
                <div className="space-y-4">
                  <div className={`flex items-center justify-between ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex items-center gap-3 ${direction === "rtl" ? "flex-row-reverse text-right" : ""}`}>
                      <Mail size={20} />
                      <div>
                        <p className="font-medium">{t("account.emailNotifications")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t("account.emailNotificationsHint")}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>

                  <div className={`flex items-center justify-between ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex items-center gap-3 ${direction === "rtl" ? "flex-row-reverse text-right" : ""}`}>
                      <Phone size={20} />
                      <div>
                        <p className="font-medium">{t("account.smsNotifications")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t("account.smsNotificationsHint")}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                    />
                  </div>

                  <div className={`flex items-center justify-between ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex items-center gap-3 ${direction === "rtl" ? "flex-row-reverse text-right" : ""}`}>
                      <Bell size={20} />
                      <div>
                        <p className="font-medium">{t("account.pushNotifications")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t("account.pushNotificationsHint")}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>

                  <div className={`flex items-center justify-between ${direction === "rtl" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex items-center gap-3 ${direction === "rtl" ? "flex-row-reverse text-right" : ""}`}>
                      <Mail size={20} />
                      <div>
                        <p className="font-medium">{t("account.marketingEmails")}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{t("account.marketingEmailsHint")}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketing: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={direction === "rtl" ? "text-right" : ""}>{t("account.preferences")}</CardTitle>
              </CardHeader>
              <CardContent className={`${direction === "rtl" ? "text-right" : ""} space-y-6`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Globe size={16} />
                      {t("account.language")}
                    </Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="he">עברית (Hebrew)</SelectItem>
                        <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="currency">{t("account.currency")}</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="ils">ILS (₪)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>{t("account.savePreferences")}</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={`${direction === "rtl" ? "text-right" : ""} text-red-600`}>{t("account.dangerZone")}</CardTitle>
              </CardHeader>
              <CardContent className={direction === "rtl" ? "text-right" : ""}>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{t("account.deleteAccountTitle")}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{t("account.deleteAccountHint")}</p>
                    <Button variant="destructive">{t("account.deleteAccount")}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          </Tabs>
        </div>
      </div>
    </AccountPageWrapper>
  )
}