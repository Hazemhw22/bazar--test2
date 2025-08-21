"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
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
  EyeOff,
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
import { useFavorites } from "@/components/favourite-items"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/components/cart-provider"

// Mock data
const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+972-50-123-4567",
  avatar: "/AVATAR1.png?height=100&width=100",
  joinDate: "January 2023",
}

const mockOrders = [
  {
    id: "ORD-1234567890",
    date: "2024-01-15",
    status: "delivered",
    total: 89.99,
    items: [
      { id: 1, name: "Wireless Headphones", price: 79.99, quantity: 1, image: "/wireless-headphone.png?height=60&width=60"},
    ],
    trackingNumber: "TRK123456789",
    shippingAddress: "123 Main Street, Tel Aviv",
    paymentMethod: "Credit Card ****1234",
    orderTime: "14:30",
    estimatedDelivery: "2024-01-18",
    actualDelivery: "2024-01-17",
  },
  {
    id: "ORD-1234567891",
    date: "2024-01-10",
    status: "shipped",
    total: 156.5,
    items: [
      { id: 2, name: "Smart Watch", price: 299.99, quantity: 1, image: "/wireless-headphone.png?height=60&width=60" },
      { id: 3, name: "Phone Case", price: 29.99, quantity: 2, image: "/wireless-headphone.png?height=60&width=60" },
    ],
    trackingNumber: "TRK123456790",
    shippingAddress: "456 Business Ave, Jerusalem",
    paymentMethod: "PayPal",
    orderTime: "09:15",
    estimatedDelivery: "2024-01-13",
  },
  {
    id: "ORD-1234567892",
    date: "2024-01-05",
    status: "processing",
    total: 45.0,
    items: [{ id: 4, name: "Laptop Stand", price: 45.0, quantity: 1, image: "/wireless-headphone.png?height=60&width=60"}],
    trackingNumber: null,
    shippingAddress: "123 Main Street, Tel Aviv",
    paymentMethod: "Credit Card ****5678",
    orderTime: "16:45",
    estimatedDelivery: "2024-01-08",
  },
  {
    id: "ORD-1234567893",
    date: "2023-12-28",
    status: "cancelled",
    total: 120.0,
    items: [
      { id: 5, name: "Gaming Mouse", price: 89.99, quantity: 1, image: "/wireless-headphone.png?height=60&width=60" },
      { id: 6, name: "Mouse Pad", price: 19.99, quantity: 1, image: "/wireless-headphone.png?height=60&width=60"},
    ],
    trackingNumber: null,
    shippingAddress: "123 Main Street, Tel Aviv",
    paymentMethod: "Credit Card ****1234",
    orderTime: "11:20",
    cancellationReason: "Customer request",
  },
]

const mockAddresses = [
  {
    id: 1,
    type: "Home",
    name: "John Doe",
    address: "123 Main Street",
    city: "Tel Aviv",
    state: "Tel Aviv District",
    zipCode: "12345",
    phone: "+972-50-123-4567",
    isDefault: true,
  },
  {
    id: 2,
    type: "Work",
    name: "John Doe",
    address: "456 Business Ave",
    city: "Jerusalem",
    state: "Jerusalem District",
    zipCode: "54321",
    phone: "+972-50-123-4567",
    isDefault: false,
  },
]

export default function EnhancedProfilePage() {
  const { favorites, removeFromFavorites } = useFavorites()
  const { addItem } = useCart()
  const [activeTab, setActiveTab] = useState("account")
  const [showPassword, setShowPassword] = useState(false)
  const [orderFilter, setOrderFilter] = useState("all")
  const [addresses, setAddresses] = useState(mockAddresses)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
  })

  const [newAddress, setNewAddress] = useState({
    type: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    isDefault: false,
  })

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

  const filteredOrders = orderFilter === "all" ? mockOrders : mockOrders.filter((order) => order.status === orderFilter)

  const handleAddAddress = () => {
    if (newAddress.name && newAddress.address && newAddress.city) {
      const address = {
        ...newAddress,
        id: addresses.length + 1,
      }

      if (address.isDefault) {
        setAddresses((prev) => prev.map((addr) => ({ ...addr, isDefault: false })))
      }

      setAddresses((prev) => [...prev, address])
      setNewAddress({
        type: "",
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        isDefault: false,
      })
      setIsAddingAddress(false)
    }
  }

  const handleDeleteAddress = (id: number) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id))
  }

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                      <Image
                        src={mockUser.avatar || "/placeholder.svg"}
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
                    <h3 className="text-xl font-semibold">{mockUser.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{mockUser.email}</p>
                    <p className="text-sm text-gray-500">Member since {mockUser.joinDate}</p>
                  </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="John" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Doe" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={mockUser.email} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue={mockUser.phone} className="mt-1" />
                  </div>
                </div>

                {/* Password Section */}
                <div className="space-y-4">
                  <h4 className="font-medium">Change Password</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Order History & Transactions</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <Select value={orderFilter} onValueChange={setOrderFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Orders</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(order.status)}
                            <h4 className="font-medium">{order.id}</h4>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <p>
                                <strong>Date:</strong> {new Date(order.date).toLocaleDateString()} at {order.orderTime}
                              </p>
                              <p>
                                <strong>Items:</strong> {order.items.length} • <strong>Total:</strong> $
                                {order.total.toFixed(2)}
                              </p>
                              <p>
                                <strong>Payment:</strong> {order.paymentMethod}
                              </p>
                            </div>
                            <div>
                              <p>
                                <strong>Shipping:</strong> {order.shippingAddress}
                              </p>
                              {order.trackingNumber && (
                                <p>
                                  <strong>Tracking:</strong> {order.trackingNumber}
                                </p>
                              )}
                              {order.estimatedDelivery && (
                                <p>
                                  <strong>Est. Delivery:</strong>{" "}
                                  {new Date(order.estimatedDelivery).toLocaleDateString()}
                                </p>
                              )}
                              {order.actualDelivery && (
                                <p>
                                  <strong>Delivered:</strong> {new Date(order.actualDelivery).toLocaleDateString()}
                                </p>
                              )}
                              {order.cancellationReason && (
                                <p>
                                  <strong>Cancelled:</strong> {order.cancellationReason}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="flex gap-2 overflow-x-auto">
                            {order.items.slice(0, 3).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 min-w-fit"
                              >
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={40}
                                  height={40}
                                  className="rounded object-cover"
                                />
                                <div className="text-xs">
                                  <p className="font-medium truncate max-w-20">{item.name}</p>
                                  <p className="text-gray-500">×{item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg p-2 min-w-fit">
                                <span className="text-xs text-gray-500">+{order.items.length - 3} more</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                <Eye size={14} className="mr-1" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Order Details - {order.id}</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p>
                                        <strong>Status:</strong>{" "}
                                        <Badge className={getStatusColor(selectedOrder.status)}>
                                          {selectedOrder.status}
                                        </Badge>
                                      </p>
                                      <p>
                                        <strong>Date:</strong> {new Date(selectedOrder.date).toLocaleDateString()}
                                      </p>
                                      <p>
                                        <strong>Time:</strong> {selectedOrder.orderTime}
                                      </p>
                                      <p>
                                        <strong>Total:</strong> ${selectedOrder.total.toFixed(2)}
                                      </p>
                                    </div>
                                    <div>
                                      <p>
                                        <strong>Payment:</strong> {selectedOrder.paymentMethod}
                                      </p>
                                      {selectedOrder.trackingNumber && (
                                        <p>
                                          <strong>Tracking:</strong> {selectedOrder.trackingNumber}
                                        </p>
                                      )}
                                      {selectedOrder.estimatedDelivery && (
                                        <p>
                                          <strong>Est. Delivery:</strong>{" "}
                                          {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <Separator />

                                  <div>
                                    <h4 className="font-medium mb-3">Items Ordered</h4>
                                    <div className="space-y-3">
                                      {selectedOrder.items.map((item: any) => (
                                        <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                                          <Image
                                            src={item.image || "/placeholder.svg"}
                                            alt={item.name}
                                            width={60}
                                            height={60}
                                            className="rounded object-cover"
                                          />
                                          <div className="flex-1">
                                            <h5 className="font-medium">{item.name}</h5>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            <p className="text-sm font-medium">${item.price.toFixed(2)} each</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <Separator />

                                  <div>
                                    <h4 className="font-medium mb-2">Shipping Address</h4>
                                    <p className="text-sm text-gray-600">{selectedOrder.shippingAddress}</p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm">
                            <Download size={14} className="mr-1" />
                            Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Wishlist Tab with Favorites Integration */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist ({favorites.length} items)</CardTitle>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Start adding products to your favorites by clicking the heart icon on any product you love.
                    </p>
                    <Link href="/products">
                    <Button>
                      <ShoppingBag size={16} className="mr-2" />
                      Start Shopping
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
                                In Stock
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
                              ${item.discountedPrice.toFixed(2)}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            <Button className="flex-1" disabled={!item.inStock} onClick={() => handleAddToCart(item)}>
                              <ShoppingBag size={16} className="mr-2" />
                              {item.inStock ? "Add to Cart" : "Out of Stock"}
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

          {/* Enhanced Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Saved Addresses</CardTitle>
                <Dialog open={isAddingAddress} onOpenChange={setIsAddingAddress}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus size={16} className="mr-1" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="addressType">Address Type</Label>
                          <Select
                            value={newAddress.type}
                            onValueChange={(value) => setNewAddress({ ...newAddress, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Home">Home</SelectItem>
                              <SelectItem value="Work">Work</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="addressName">Full Name</Label>
                          <Input
                            id="addressName"
                            value={newAddress.name}
                            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                            placeholder="Enter full name"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="addressStreet">Street Address</Label>
                        <Textarea
                          id="addressStreet"
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                          placeholder="Enter street address"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="addressCity">City</Label>
                          <Input
                            id="addressCity"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="Enter city"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressState">State/Province</Label>
                          <Input
                            id="addressState"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            placeholder="Enter state"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="addressZip">ZIP Code</Label>
                          <Input
                            id="addressZip"
                            value={newAddress.zipCode}
                            onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                            placeholder="Enter ZIP code"
                          />
                        </div>
                        <div>
                          <Label htmlFor="addressPhone">Phone Number</Label>
                          <Input
                            id="addressPhone"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="defaultAddress"
                          checked={newAddress.isDefault}
                          onCheckedChange={(checked) => setNewAddress({ ...newAddress, isDefault: checked })}
                        />
                        <Label htmlFor="defaultAddress">Set as default address</Label>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button onClick={handleAddAddress} className="flex-1">
                          Add Address
                        </Button>
                        <Button variant="outline" onClick={() => setIsAddingAddress(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{address.type}</h4>
                          {address.isDefault && <Badge variant="secondary">Default</Badge>}
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Edit size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium">{address.name}</p>
                        <p>{address.address}</p>
                        <p>
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p>{address.phone}</p>
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
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail size={20} />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Order updates and confirmations</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone size={20} />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Delivery updates via SMS</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell size={20} />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Browser notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail size={20} />
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Promotions and special offers</p>
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
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="language" className="flex items-center gap-2">
                      <Globe size={16} />
                      Language
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
                    <Label htmlFor="currency">Currency</Label>
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
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
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
