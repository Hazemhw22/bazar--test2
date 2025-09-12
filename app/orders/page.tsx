"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Truck, Clock, XCircle, AlertCircle } from "lucide-react";
import { pdf, Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import QuickViewModal from "../../components/QuickViewModal";

export default function OrdersPage() {
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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

  return (
    <div className="space-y-6 mobile:max-w-[480px] mobile:mx-auto mobile:px-4">
      {ordersData.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
          {ordersData.map((order) => (
            <Card key={order.id} className="overflow-hidden">
                {/* Mobile Layout: Card Style */}
                <div className="lg:hidden flex flex-col h-full">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
                    {order.products?.images?.length > 0 ? (
                      <Image
                        src={order.products.images[0]}
                        alt={order.products.title || "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
                        <Package size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Order Details - Mobile Optimized */}
                  <CardContent className="flex-1 flex flex-col justify-between p-3 space-y-2">
                    {/* Product Name */}
                    <h4 className="text-sm font-medium line-clamp-2">{order.products?.title || "Product"}</h4>

                    {/* Order ID */}
                    <p className="text-xs text-gray-600 dark:text-gray-400">Order #{order.id}</p>

                    {/* Status */}
                    <Badge className={`${getStatusColor(order.status)} text-xs px-1 py-1 flex items-center gap-1 w-max`}>
                      {getStatusIcon(order.status)} {order.status}
                    </Badge>

                    {/* Other Info */}
                    <div className="space-y-1 text-xs mt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600 dark:text-gray-400 truncate">{order.payment_method?.type || "Credit Card"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600 dark:text-gray-400 truncate">{order.shipping_method?.type || "Standard"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">${order.products?.price || "0.00"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button size="sm" onClick={() => setSelectedOrder(order)} className="w-full text-xs py-1">
                          View Details
                        </Button>
                        <PDFDownloadLink
                          document={generatePDF(order)}
                          fileName={`order_${order.id}.pdf`}
                          className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 w-full"
                        >
                          Download PDF
                        </PDFDownloadLink>
                      </div>
                    </div>
                  </CardContent>
                </div>

              {/* Desktop Layout: Original Style with Fixed Image */}
              <div className="hidden lg:flex flex-row">
                {/* Product Image - Fixed aspect ratio */}
                <div className="w-1/4 relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-800">
                  {order.products?.images?.length > 0 ? (
                    <Image
                      src={order.products.images[0]}
                      alt={order.products.title || "Product"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
                      <Package size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Order Details - Desktop */}
                <CardContent className="flex-1 flex flex-col justify-between p-4">
                  <div className="flex justify-between flex-col sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-semibold text-lg">{order.products?.title || "Product"}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Order #{order.id}</p>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 mt-2 sm:mt-0`}>
                      {getStatusIcon(order.status)} {order.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Payment</p>
                        <p className="text-gray-600 dark:text-gray-400">{order.payment_method?.type || "Credit Card"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Delivery</p>
                        <p className="text-gray-600 dark:text-gray-400">{order.shipping_method?.type || "Standard"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Date</p>
                        <p className="text-gray-600 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-lg">${order.products?.price || "0.00"}</span>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setSelectedOrder(order)}>View Details</Button>
                      <PDFDownloadLink
                        document={generatePDF(order)}
                        fileName={`order_${order.id}.pdf`}
                        className="inline-flex items-center justify-center px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                      >
                        Download PDF
                      </PDFDownloadLink>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Orders Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">You haven't placed any orders yet.</p>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedOrder && (
        <QuickViewModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
