"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Truck, Clock, XCircle, AlertCircle } from "lucide-react";

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
      <DialogContent className="sm:max-w-3xl w-full p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* صورة المنتج كبيرة */}
          <div className="w-full sm:w-1/2 h-64 sm:h-auto relative">
            {order.products?.images?.length > 0 ? (
              <Image
                src={order.products.images[0]}
                alt={order.products.title || "Product"}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
                <Package size={48} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* تفاصيل الأوردر */}
          <div className="flex-1 p-4 space-y-3">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">{order.products?.title || "Product"}</DialogTitle>
            </DialogHeader>

            <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
              {getStatusIcon(order.status)} {order.status}
            </Badge>

            <p><span className="font-medium">Order ID:</span> {order.id}</p>
            <p><span className="font-medium">Store:</span> {order.products?.shop?.shop_name || "Unknown"}</p>
            <p><span className="font-medium">Category:</span> {order.products?.category?.title || "Unknown"}</p>
            <p><span className="font-medium">Payment:</span> {order.payment_method?.type || "Credit Card"}</p>
            <p><span className="font-medium">Delivery:</span> {order.shipping_method?.type || "Standard"}</p>
            <p><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
            <p className="font-bold text-lg">Total: ${order.products?.price || "0.00"}</p>

            <div className="flex gap-2 mt-4">
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
