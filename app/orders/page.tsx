"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Truck, Clock, XCircle, AlertCircle } from "lucide-react";
import { pdf, Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import QuickViewModal from "../../components/QuickViewModal";

export default function OrdersPage() {
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "shipped": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "processing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered": return <CheckCircle size={16} className="text-green-600" />;
      case "shipped": return <Truck size={16} className="text-blue-600" />;
      case "processing": return <Clock size={16} className="text-yellow-600" />;
      case "cancelled": return <XCircle size={16} className="text-red-600" />;
      default: return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return setLoading(false);

      const userId = session.user.id;

      const { data, error } = await supabase
        .from("orders")
        .select(`*, products:product_id (*)`)
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false });

      if (error) console.error("Supabase Error:", error);
      else setOrdersData(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const generatePDF = (order: any) => {
    const styles = StyleSheet.create({
      page: { padding: 20, fontSize: 12 },
      section: { marginBottom: 10 },
      title: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    });

    return (
      <Document>
        <Page style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.title}>Order #{order.id}</Text>
            <Text>Status: {order.status}</Text>
            <Text>Payment: {order.payment_method?.type || "Credit Card"}</Text>
            <Text>Delivery: {order.shipping_method?.type || "Standard"}</Text>
            <Text>Date: {new Date(order.created_at).toLocaleDateString()}</Text>
            <Text>Total: ${order.products?.price || "0.00"}</Text>
          </View>
        </Page>
      </Document>
    );
  };

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading orders...</div>;

  // Filter orders based on active tab
  const filteredOrders = ordersData.filter(order => {
    if (activeTab === 'ongoing') {
      return ['processing', 'shipped', 'in_transit'].includes(order.status);
    } else {
      return ['delivered', 'cancelled'].includes(order.status);
    }
  });

  return (
    <div className="space-y-6 mobile:max-w-[480px] mobile:mx-auto mobile:px-4">
      {/* Header with logo and search */}
      <div className="flex justify-between items-center pt-4">
        <h1 className="text-xl font-bold">My Orders</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-3 text-center font-medium ${activeTab === 'ongoing' ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('ongoing')}
        >
          Ongoing
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${activeTab === 'completed' ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading orders...</div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden rounded-xl">
              <div className="flex flex-col">
                <div className="flex p-4 gap-4">
                  {/* Product Image */}
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0">
                    {order.products?.images?.length > 0 ? (
                      <Image
                        src={order.products.images[0]}
                        alt={order.products.title || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
                        <Package size={24} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-base">{order.products?.title || "Product"}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: order.products?.color || '#8B4513' }}></div>
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Color</span>
                        <span className="text-xs">|</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Size = {order.products?.size || '40'}</span>
                        <span className="text-xs">|</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">Qty = 1</span>
                      </div>
                      <div className="mt-2">
                        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 font-normal text-xs px-2 py-1">
                          In Delivery
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold">${order.products?.price || "0.00"}</span>
                      <Link href={`/orders/track/${order.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs rounded-full px-4">
                          Track Order
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No {activeTab === 'ongoing' ? 'Ongoing' : 'Completed'} Orders</h3>
          <p className="text-gray-600 dark:text-gray-400">You don't have any {activeTab === 'ongoing' ? 'ongoing' : 'completed'} orders at the moment.</p>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedOrder && (
        <QuickViewModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
