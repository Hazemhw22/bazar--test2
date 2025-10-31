"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useI18n } from "@/lib/i18n";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, Package, Truck, XCircle, AlertCircle, MapPin, CreditCard, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready_for_pickup' | 'on_the_way' | 'delivered' | 'cancelled';

interface OrderProduct {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  sale_price: number;
  final_unit_price: number;
  selected_features: any;
  features_total: number;
  item_total: number;
  created_at: string;
  products?: {
    id: string;
    name: string;
    image_url?: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  delivery_cost: number;
  customer_address: string;
  order_type: string;
  payment_method: string;
  created_at: string;
  shops?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  orders_products: OrderProduct[];
}

export default function TrackOrderPage() {
  const { t } = useI18n();
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    const s = (status || '').toString().toLowerCase().trim();
    switch (s) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'on the way':
      case 'shipped':
      case 'on_the_way':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'ready for pickup':
      case 'ready_for_pickup':
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
      case 'on_the_way':
        return <Truck size={16} className="text-blue-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'processing':
        return <Clock size={16} className="text-yellow-600" />;
      case 'ready for pickup':
      case 'ready_for_pickup':
        return <Package size={16} className="text-indigo-600" />;
      case 'cancelled':
      case 'rejected':
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertCircle size={16} className="text-gray-600" />;
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { id: 'pending', label: t('tracking.status.pending', { default: 'Pending' }), icon: <Clock size={18} /> },
      { id: 'confirmed', label: t('tracking.status.confirmed', { default: 'Confirmed' }), icon: <CheckCircle size={18} /> },
      { id: 'processing', label: t('tracking.status.processing', { default: 'Processing' }), icon: <Package size={18} /> },
      { id: 'ready_for_pickup', label: t('tracking.status.readyForPickup', { default: 'Ready for Pickup' }), icon: <Package size={18} /> },
      { id: 'on_the_way', label: t('tracking.status.onTheWay', { default: 'On the Way' }), icon: <Truck size={18} /> },
      { id: 'delivered', label: t('tracking.status.delivered', { default: 'Delivered' }), icon: <CheckCircle size={18} /> },
    ];

    const currentStatusIndex = steps.findIndex(step => step.id === status.toLowerCase());
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentStatusIndex,
      current: index === currentStatusIndex,
    }));
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order');
        }
        
        setOrder(data.order);
        setError(null);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(t('tracking.error', { default: 'Failed to load order details. Please try again.' }));
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, t]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-lg inline-flex items-center gap-3">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          <span className="rtl:mr-1 ltr:ml-1">{error || t('tracking.notFound', { default: 'Order not found' })}</span>
        </div>
        <div className="mt-4">
          <Link href="/orders">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('tracking.backToOrders', { default: 'Back to Orders' })}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);
  const firstProduct = order.orders_products?.[0];
  const productCount = order.orders_products?.length || 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header with back button */}
      <div className="flex items-center mb-6">
        <Link href="/orders">
          <Button variant="ghost" size="icon" className="rtl:ml-2 ltr:mr-2">
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{t('tracking.title', { default: 'Order Tracking' })}</h1>
        <div className="rtl:mr-auto ltr:ml-auto">
          <Badge className={getStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            <span className="rtl:mr-1.5 ltr:ml-1.5 capitalize">{order.status.replace(/_/g, ' ')}</span>
          </Badge>
        </div>
      </div>

      {/* Order Summary Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {t('tracking.orderNumber', { default: 'Order' })} #{order.id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Products List */}
            <div>
              {order.orders_products?.map((product, index) => (
                <div key={product.id || index}>
                  <div className="flex items-start gap-4 py-4">
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
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {product.product_name || product.products?.name || t('tracking.product.unknown', { default: 'Product' })}
                      </h3>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        ₪{product.final_unit_price?.toFixed(2) || '0.00'}
                      </p>
                      {product.selected_features && Object.keys(product.selected_features).length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {Object.entries(product.selected_features).map(([key, value]) => `${key}: ${value}`).join(', ')}
                        </p>
                      )}
                      {order.shops?.name && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
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
              <div className="border-b border-gray-200 dark:border-gray-700 mt-4"></div>
              
              {/* Products summary */}
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {productCount} {productCount === 1 ? t('tracking.product.item', { default: 'item' }) : t('tracking.product.items', { default: 'items' })}
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  ₪{order.orders_products?.reduce((sum, product) => sum + (product.item_total || 0), 0).toFixed(2) || '0.00'}
                </span>
              </div>
            </div>

            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('tracking.deliveryAddress', { default: 'Delivery Address' })}</p>
                  <p className="font-medium">{order.customer_address || t('tracking.notSpecified', { default: 'Not specified' })}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('tracking.paymentMethod', { default: 'Payment' })}</p>
                  <p className="font-medium capitalize">{order.payment_method || t('tracking.notSpecified', { default: 'Not specified' })}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('tracking.orderDate', { default: 'Order Date' })}</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t('tracking.orderStatus', { default: 'Order Status' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            
            {/* Timeline steps */}
            <div className="space-y-8">
              {statusSteps.map((step) => (
                <div key={step.id} className="relative pl-10">
                  {/* Status indicator */}
                  <div className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ${
                    step.completed 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                  }`}>
                    {step.completed ? <CheckCircle size={16} /> : step.icon}
                  </div>
                  
                  {/* Status content */}
                  <div className={`${step.current ? 'font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                    <h3 className="text-sm">{step.label}</h3>
                    {step.completed && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {t('tracking.completed', { default: 'Completed' })} • {new Date().toLocaleDateString('en-GB')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('tracking.orderSummary', { default: 'Order Summary' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('tracking.subtotal', { default: 'Subtotal' })}</span>
              <span>₪{order.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('tracking.delivery', { default: 'Delivery' })}</span>
              <span>₪{order.delivery_cost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex justify-between font-semibold">
              <span>{t('tracking.total', { default: 'Total' })}</span>
              <span>₪{order.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support CTA */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('tracking.needHelp', { default: 'Need help with your order?' })}
        </p>
        <Button variant="outline">
          {t('tracking.contactSupport', { default: 'Contact Support' })}
        </Button>
      </div>
    </div>
  );
}