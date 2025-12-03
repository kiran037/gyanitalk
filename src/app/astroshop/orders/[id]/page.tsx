"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Edit,
  Package,
  User,
  MapPin,
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  Gift,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";

interface OrderDetail {
  id: string;
  userId: string; // ✅ Add this
  created_at: string;
  orderStatus: string;
  orderType: string;
  paymentMethod: string;
  totalPayable: number;
  payableAmount: number;
  gstPercent: number;
  walletBalanceDeducted: number;
  couponCode: string | null;
  user: {
    id: string; // ✅ Add this
    name: string;
    email: string;
    contactNo: string;
    countryCode: string;
  } | null;
  product: {
    id: string; // ✅ Add this
    name: string;
    description: string;
    productImage: string;
    // ✅ Remove amount field - don't need it
  } | null;
  product_category: {
    id: string; // ✅ Add this
    name: string;
  } | null;
  order_address: {
    id: string; // ✅ Add this
    name: string;
    phoneNumber: string;
    flatNo: string;
    locality: string;
    city: string;
    state: string;
    country: string;
    pincode: number;
  } | null;
  coupon_user_usages: Array<{
    id: string; // ✅ Add this
    amt: number;
    coupons: {
      code: string;
      discount_type: string;
      discount_value: number;
    };
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const addToast = useToast();

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/astroshop/orders/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
        setNewStatus(data.data.orderStatus);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.orderStatus) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/astroshop/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        addToast("success", "Success", "Order status updated");
        fetchOrder();
      }
    } catch (error) {
      addToast("error", "Error", "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`/api/astroshop/orders/${orderId}/invoice`);
      const data = await response.json();
      
      if (data.success) {
        // Create a new window with the invoice HTML
        const invoiceWindow = window.open("", "_blank");
        if (invoiceWindow) {
          invoiceWindow.document.write(data.data.invoiceHTML);
          invoiceWindow.document.close();
          invoiceWindow.print();
        }
        addToast("success", "Success", "Invoice generated");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to generate invoice");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#FF6B35] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Order Not Found
          </h2>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const subtotal = Number(order.payableAmount || 0);
  const gstAmount = (subtotal * Number(order.gstPercent || 0)) / 100;
  const walletDeduction = Number(order.walletBalanceDeducted || 0);
  const couponDiscount = Number(order.coupon_user_usages[0]?.amt || 0);
  const total = Number(order.totalPayable || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PageHeader
            title={`Order #${order.id.slice(0, 8)}`}
            subtitle={`Placed on ${new Date(order.created_at).toLocaleString()}`}
            actions={
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => router.back()}
                >
                  Back
                </Button>
                <Button
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleDownloadInvoice}
                >
                  Invoice
                </Button>
              </div>
            }
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Update */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Order Status
              </h3>
              <div className="flex items-center gap-4">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <Button
                  icon={<Edit className="w-4 h-4" />}
                  onClick={handleStatusUpdate}
                  loading={updating}
                  disabled={newStatus === order.orderStatus}
                >
                  Update
                </Button>
              </div>
              <div className="mt-4">
                <span className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
                  Current: {order.orderStatus}
                </span>
              </div>
            </motion.div>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#FF6B35]" />
                Product Details
              </h3>
              {order.product ? (
                <div className="flex items-center gap-4">
                  <img
                    src={avatar(order.product.productImage)}
                    alt={order.product.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {order.product.name}
                    </h4>
                    {order.product_category && (
                      <p className="text-sm text-gray-500 mb-2">
                        Category: {order.product_category.name}
                      </p>
                    )}
                    {order.product.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {order.product.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Service: {order.orderType}
                </p>
              )}
            </motion.div>

            {/* Delivery Address */}
            {order.order_address && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FF6B35]" />
                  Delivery Address
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {order.order_address.name}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.order_address.phoneNumber}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.order_address.flatNo}, {order.order_address.locality}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.order_address.city}, {order.order_address.state}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.order_address.country} - {order.order_address.pincode}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#FF6B35]" />
                Customer Info
              </h3>
              {order.user && (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.user.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.user.countryCode} {order.user.contactNo}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#FF6B35]" />
                Payment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    GST ({order.gstPercent}%)
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{gstAmount.toFixed(2)}
                  </span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      Coupon ({order.coupon_user_usages[0].coupons.code})
                    </span>
                    <span className="font-medium text-green-600">
                      -₹{couponDiscount.toFixed(2)}
                    </span>
                  </div>
                )}
                {walletDeduction > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Wallet</span>
                    <span className="font-medium text-green-600">
                      -₹{walletDeduction.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Payment Method
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}