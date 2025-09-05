import Image from "next/image"
import Link from "next/link"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  Package,
  Settings,
  Bell,
  Globe,
  Download,
  Edit,
  Trash2,
  Plus,
  Eye,
  Camera,
  Filter,
  ShoppingBag,
  Star,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import type { Profile, OrderData } from "@/lib/type"
import { notFound, redirect } from "next/navigation"
import WishlistClient from "@/components/WishlistClient"

interface EnhancedProfilePageProps {
  profile: Profile
  orders: OrderData[]
  addresses: Profile[]
  favorites: any[]
}

export default async function EnhancedProfilePage() {
  const supabaseServer = supabase

  // جلب الجلسة من السيرفر
  const {
    data: { session },
    error: sessionError,
  } = await supabaseServer.auth.getSession()

  if (sessionError || !session?.user) {
    redirect("/auth") // إعادة توجيه إذا لم يكن المستخدم مسجّل الدخول
  }

  const userId = session.user.id

  // جلب البيانات من Supabase
  const { data: profileData, error: profileError } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (profileError || !profileData) notFound()

  const { data: ordersData } = await supabaseServer
    .from("orders")
    .select(`
      *,
      products:product_id (*),
      profiles:buyer_id (*)
    `)
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })

  const { data: addressesData } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("id", userId)

  // جلب الـ favorites (على سبيل المثال من جدول wishlist)
  const { data: favoritesData } = await supabaseServer
    .from("wishlist")
    .select("*")
    .eq("user_id", userId)
    


  // دوال مساعدة للألوان والأيقونات للحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "shipped":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle size={16} className="text-green-600" />
      case "shipped":
        return <Truck size={16} className="text-blue-600" />
      case "processing":
        return <Clock size={16} className="text-yellow-600" />
      case "cancelled":
        return <XCircle size={16} className="text-red-600" />
      default:
        return <AlertCircle size={16} className="text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
            <TabsTrigger value="account" className="flex items-center gap-2 py-3">
              <User size={24} />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 py-3">
              <Package size={24} />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2 py-3">
              <Heart size={24} />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2 py-3">
              <MapPin size={24} />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
              <Settings size={24} />
              <span className="hidden sm:inline">Settings</span>
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
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersData?.map((order: OrderData) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <h4>{order.id}</h4>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
  {/* Enhanced Wishlist Tab with Favorites Integration */}
          <TabsContent value="wishlist" className="space-y-6">
              <WishlistClient favorites={favoritesData || []} />
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addressesData?.map((address: Profile) => (
                    <div key={address.id} className="border rounded-lg p-4 space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium">{address.full_name}</p>
                        <p>{address.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="language" className="flex items-center gap-2">
                      <Globe size={16} />
                      Language
                    </label>
                  </div>
                  <div>
                    <label htmlFor="currency">Currency</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
