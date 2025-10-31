"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Truck, Clock, XCircle, AlertCircle } from "lucide-react";
import QuickViewModal from "../../components/QuickViewModal";
import { useI18n } from "@/lib/i18n";

export default function OrdersPage() {
  const { t } = useI18n();
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');

  const getStatusColor = (status: string) => {
    const s = (status || '').toString().toLowerCase().trim();
    switch (s) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on the way':
      case 'shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'ready for pickup':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    const s = (status || '').toString().toLowerCase().trim();
    switch (s) {
      case 'completed':
      case 'delivered':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'on the way':
      case 'shipped':
        return <Truck size={16} className="text-blue-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'processing':
        return <Clock size={16} className="text-yellow-600" />;
      case 'ready for pickup':
        return <Package size={16} className="text-indigo-600" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      try {
        // Use API route to fetch orders (bypasses RLS)
        const response = await fetch(`/api/orders/user?userId=${userId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to fetch orders. Status:", response.status, "Error:", errorData);
          setOrdersData([]);
        } else {
          const { orders } = await response.json();
          console.log("Orders fetched successfully:", orders?.length || 0, "orders");
          setOrdersData(orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersData([]);
      }
      
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">{t("orders.loading")}</div>;

  // Filter orders based on active tab
  const filteredOrders = ordersData.filter(order => {
    // Requirement: if status is 'complete' it should be in the Completed tab,
    // otherwise it belongs to the Ongoing tab.
    const status = (order.status || '').toString().toLowerCase();
    if (activeTab === 'ongoing') {
      return status !== 'completed';
    } else {
      return status === 'completed';
    }
  });

  return (
    <div className="space-y-6 mobile:max-w-[480px] mobile:mx-auto mobile:px-4">
      {/* Header with logo and search */}
      <div className="flex justify-between items-center pt-4">
        <h1 className="text-xl font-bold">{t("orders.header.title")}</h1>
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
          {t("orders.tab.ongoing")}
        </button>
        <button
          className={`flex-1 py-3 text-center font-medium ${activeTab === 'completed' ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white' : 'text-gray-500 dark:text-gray-400'}`}
          onClick={() => setActiveTab('completed')}
        >
          {t("orders.tab.completed")}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">Loading orders...</div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden rounded-xl">
              <div className="flex flex-col">
                {/* Order Header with Order Number and Status */}
                <div className="flex justify-between items-center p-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-base">
                    {t('tracking.orderNumber', { default: 'Order' })} #{order.id}
                  </h3>
                  <Badge className={`${getStatusColor(order.status)} font-normal text-xs px-2 py-1 inline-flex items-center gap-2`}>
                    {getStatusIcon(order.status)}
                    <span className="capitalize">{(order.status || 'unknown').toString().replace(/_/g, ' ')}</span>
                  </Badge>
                </div>

                {/* Products List */}
                <div className="p-4">
                  {order.orders_products?.map((product: any, index: number) => (
                    <div key={product.id || index}>
                      <div className="flex items-start gap-4 py-3">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                          {product.products?.image_url ? (
                            <Image
                              src={product.products.image_url}
                              alt={product.product_name || 'Product'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {product.product_name || product.products?.name || t('tracking.product.unknown', { default: 'Product' })}
                          </h4>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                            ₪{product.final_unit_price?.toFixed(2) || product.item_total?.toFixed(2) || '0.00'}
                          </p>
                          {product.selected_features && Object.keys(product.selected_features).length > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {Object.entries(product.selected_features).map(([key, value]) => `${key}: ${value}`).join(', ')}
                            </p>
                          )}
                          {order.shops?.name && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {order.shops.name}
                            </p>
                          )}
                        </div>
                      </div>
                      {/* Divider line between products */}
                      {index < order.orders_products.length - 1 && (
                        <div className="border-b border-gray-200 dark:border-gray-700"></div>
                      )}
                    </div>
                  ))}
                  
                  {/* Final divider line after last product */}
                  <div className="border-b border-gray-200 dark:border-gray-700 mt-3"></div>
                  
                  {/* Order Summary */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {order.orders_products?.length || 0} {(order.orders_products?.length || 0) === 1 ? t('tracking.product.item', { default: 'item' }) : t('tracking.product.items', { default: 'items' })}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        ₪{order.total_amount?.toFixed(2) || '0.00'}
                      </span>
                      <Link href={`/orders/track/${order.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs rounded-full px-4">
                          {t("orders.trackButton")}
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{activeTab === 'ongoing' ? t("orders.empty.ongoing.title") : t("orders.empty.completed.title")}</h3>
          <p className="text-gray-600 dark:text-gray-400">{activeTab === 'ongoing' ? t("orders.empty.ongoing.subtitle") : t("orders.empty.completed.subtitle")}</p>
        </div>
      )}

      {/* Quick View Modal */}
      {selectedOrder && (
        <QuickViewModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
