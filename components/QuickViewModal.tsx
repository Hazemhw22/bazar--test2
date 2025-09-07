"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Truck, Clock, XCircle, AlertCircle, Calendar, CreditCard, Truck as TruckIcon } from "lucide-react";

interface QuickViewModalProps {
  order: any;
  onClose: () => void;
}

export default function QuickViewModal({ order, onClose }: QuickViewModalProps) {
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden rounded-3xl">
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate pr-2">
              Order #{order.id}
            </h2>
            <DialogClose className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <XCircle size={20} />
            </DialogClose>
          </div>

          {/* Mobile Image */}
          <div className="relative aspect-square bg-gray-50 dark:bg-gray-800">
            {order.products?.images?.length > 0 ? (
              <Image
                src={order.products.images[0]}
                alt={order.products.title || "Product"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
                <Package size={48} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Mobile Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {order.products?.title || "Product"}
              </h3>
              <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                {getStatusIcon(order.status)} {order.status}
              </Badge>
            </div>

            {/* Mobile Order Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <CreditCard size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Payment Method</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.payment_method?.type || "Credit Card"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TruckIcon size={16} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Delivery Method</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_method?.type || "Standard"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Order Date</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Mobile Price */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${order.products?.price || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
            <Button onClick={onClose} className="w-full py-3 rounded-xl">
              Close
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-2 h-full">
          {/* Desktop Image */}
          <div className="relative bg-gray-50 dark:bg-gray-800">
            {order.products?.images?.length > 0 ? (
              <Image
                src={order.products.images[0]}
                alt={order.products.title || "Product"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
                <Package size={64} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Desktop Content */}
          <div className="p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {order.products?.title || "Product"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Order #{order.id}</p>
                <Badge className={`${getStatusColor(order.status)} flex items-center gap-1 w-fit`}>
                  {getStatusIcon(order.status)} {order.status}
                </Badge>
              </div>

              {/* Desktop Order Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                    <CreditCard size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Payment Method</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.payment_method?.type || "Credit Card"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                    <TruckIcon size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Delivery Method</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.shipping_method?.type || "Standard"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                    <Calendar size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Order Date</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Price & Actions */}
            <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">${order.products?.price || "0.00"}</span>
                </div>
              </div>
              
              <Button onClick={onClose} className="w-full py-3 rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
