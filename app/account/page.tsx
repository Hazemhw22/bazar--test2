"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  User,
  Phone,
  MapPin,
  Package,
  Camera,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Profile, OrderData } from "@/lib/type"
import AccountPageWrapper from "@/components/AccountPageWrapper"

export default function EnhancedProfilePage() {
  const [profileData, setProfileData] = useState<Profile | null>(null)
  const [ordersData, setOrdersData] = useState<OrderData[]>([])
  const [addressesData, setAddressesData] = useState<Profile[]>([])

  // دوال مساعدة للألوان والأيقونات للحالة
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

  // جلب البيانات بعد التأكد من وجود session
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

  return (
    <AccountPageWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Account</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="account" className="space-y-6">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <TabsTrigger value="account" className="flex items-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:text-gray-100">
                <User size={20} /> <span>Account</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:text-gray-100">
                <Package size={20} /> <span>Orders</span>
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:text-gray-400 dark:data-[state=inactive]:hover:text-gray-100">
                <MapPin size={20} /> <span>Addresses</span>
              </TabsTrigger>
            </TabsList>

         
          {/* Account Info Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
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
                    <p className="text-sm text-gray-500">Member since {profileData?.registration_date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={24} />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                            <div>
                              <h4 className="font-semibold text-lg">{order.products?.title || "Product"}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Order #{order.id}</p>
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
                                <p className="font-medium">Date</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Amount</span>
                            <span className="font-bold text-lg">
                              ${order.products?.price || "0.00"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">You haven't placed any orders yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin size={24} />
                  Saved Addresses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* {profileData && profileData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileData.map((address: Profile) => (
                      <div key={address.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <p className="font-medium text-gray-900 dark:text-white">{profileData.address}</p>
                            <p className="mt-1">{address.address}</p>
                            {address.phone && (
                              <p className="mt-1 flex items-center gap-1">
                                <Phone size={14} />
                                {address.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ( */}
                  <div className="text-center py-12">
                    <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Addresses Saved</h3>
                    <p className="text-gray-600 dark:text-gray-400">You haven't saved any addresses yet.</p>
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
