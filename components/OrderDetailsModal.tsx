"use client";

import { useState } from 'react';
import Image from 'next/image';
import { X, Package, MapPin, CreditCard, Calendar, CheckCircle, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const { t, direction } = useI18n();

  if (!isOpen || !order) return null;

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

  const productCount = order.orders_products?.length || 0;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {t('tracking.orderNumber', { default: 'Order' })} #{order.id}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
            <Badge className={`${getStatusColor(order.status)} font-normal text-xs px-2 py-1 inline-flex items-center gap-2`}>
              {getStatusIcon(order.status)}
              <span className="capitalize">{(order.status || 'unknown').toString().replace(/_/g, ' ')}</span>
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto flex-1">
          {/* Products Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`font-semibold text-lg mb-4 ${direction === 'rtl' ? 'text-right' : ''}`}>
              {t('tracking.orderProducts', { default: 'Order Products' })} ({productCount} {productCount === 1 ? t('tracking.product.item', { default: 'item' }) : t('tracking.product.items', { default: 'items' })})
            </h3>
            
            <div className="space-y-4">
              {order.orders_products?.map((product: any, index: number) => (
                <div key={product.id || index}>
                  <div className={`flex items-start gap-4 py-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
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
                    <div className={`flex-1 ${direction === 'rtl' ? 'text-right' : ''}`}>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
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
            </div>
          </div>

          {/* Order Details Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`font-semibold text-lg mb-4 ${direction === 'rtl' ? 'text-right' : ''}`}>
              {t('tracking.orderDetails', { default: 'Order Details' })}
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              {/* First Row */}
              <div className={`flex items-start gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className={direction === 'rtl' ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('tracking.deliveryAddress', { default: 'Delivery Address' })}</p>
                  <p className="font-medium">{order.customer_address || t('tracking.notSpecified', { default: 'Not specified' })}</p>
                </div>
              </div>
              
              <div className={`flex items-start gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div className={direction === 'rtl' ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('tracking.paymentMethod', { default: 'Payment Method' })}</p>
                  <p className="font-medium capitalize">{order.payment_method || t('tracking.notSpecified', { default: 'Not specified' })}</p>
                </div>
              </div>
              
              {/* Second Row */}
              <div className={`flex items-start gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <div className={direction === 'rtl' ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('tracking.orderDate', { default: 'Order Date' })}</p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <Truck className="h-5 w-5 text-green-600" />
                </div>
                <div className={direction === 'rtl' ? 'text-right' : ''}>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('tracking.orderType', { default: 'Order Type' })}</p>
                  <p className="font-medium capitalize">{order.order_type || t('tracking.delivery', { default: 'Delivery' })}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6">
            <h3 className={`font-semibold text-lg mb-4 ${direction === 'rtl' ? 'text-right' : ''}`}>
              {t('tracking.orderSummary', { default: 'Order Summary' })}
            </h3>
            
            <div className="space-y-3">
              <div className={`flex justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-600 dark:text-gray-400">{t('tracking.subtotal', { default: 'Subtotal' })}</span>
                <span>₪{order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className={`flex justify-between ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span className="text-gray-600 dark:text-gray-400">{t('tracking.delivery', { default: 'Delivery' })}</span>
                <span>₪{order.delivery_cost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className={`border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex justify-between font-semibold ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                <span>{t('tracking.total', { default: 'Total' })}</span>
                <span>₪{order.total_amount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
