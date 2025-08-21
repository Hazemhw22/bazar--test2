"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface OrderItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  rating: number
}

interface Order {
  id: string
  date: string
  status: "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
  shippingAddress: {
    name: string
    address: string
    city: string
    country: string
    zipCode: string
  }
  trackingNumber?: string
  estimatedDelivery: string
  actualDelivery?: string
  paymentMethod: string
  shippingMethod: string
  orderNotes?: string
  cancelReason?: string
  cancelDate?: string
}

interface OrderContextType {
  orders: Order[]
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: Order["status"]) => void
  getOrderById: (orderId: string) => Order | undefined
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  // Load orders from localStorage on mount
  useEffect(() => {
    try {
      const savedOrders = localStorage.getItem("user-orders")
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders))
      } else {
        // Initialize with mock orders if none exist
        const mockOrders: Order[] = [
          {
            id: "VRS-2024-001",
            date: "2024-01-20",
            status: "delivered",
            total: 156.99,
            items: [
              {
                id: 1,
                name: "VRISTO Signature Perfume",
                price: 75.0,
                quantity: 1,
                image: "/placeholder.svg?height=80&width=80",
                rating: 5,
              },
              {
                id: 2,
                name: "VRISTO Body Lotion",
                price: 65.99,
                quantity: 1,
                image: "/placeholder.svg?height=80&width=80",
                rating: 4,
              },
            ],
            shippingAddress: {
              name: "John Doe",
              address: "123 Main St",
              city: "Tel Aviv",
              country: "Israel",
              zipCode: "12345",
            },
            trackingNumber: "VRS123456789",
            estimatedDelivery: "2024-01-22",
            actualDelivery: "2024-01-21",
            paymentMethod: "Credit Card ****1234",
            shippingMethod: "Express Delivery",
            orderNotes: "Please leave at front door",
          },
        ]
        setOrders(mockOrders)
        localStorage.setItem("user-orders", JSON.stringify(mockOrders))
      }
    } catch (error) {
      console.error("Error loading orders from localStorage:", error)
    }
  }, [])

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    try {
      localStorage.setItem("user-orders", JSON.stringify(orders))
    } catch (error) {
      console.error("Error saving orders to localStorage:", error)
    }
  }, [orders])

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev])
  }

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status,
              ...(status === "delivered" && { actualDelivery: new Date().toISOString() }),
            }
          : order,
      ),
    )
  }

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId)
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getOrderById,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}
