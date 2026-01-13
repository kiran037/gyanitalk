"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Package, MapPin, Calendar, CreditCard } from "lucide-react";
import Image from "next/image";
import { avatar } from "@/lib/images";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/landing/profile/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" /></div>;
  if (!order) return <div className="p-8 text-center text-gray-500">Order not found</div>;

  return (
    <div className="max-w-3xl mx-auto pb-10 px-4 sm:px-0">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => router.back()} className="p-2 bg-white dark:bg-[#1C1C1E] rounded-full border border-gray-200 dark:border-white/10 shadow-sm">
                <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Order Details</h1>
        </div>

        <div className="space-y-4">
            {/* Status Card */}
            <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Order ID</p>
                        <p className="font-mono text-sm">#{order.id.toString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                         order.orderStatus === "Completed" ? "bg-green-100 text-green-700" :
                         order.orderStatus === "Cancelled" ? "bg-red-100 text-red-700" :
                         "bg-yellow-100 text-yellow-700"
                    }`}>
                        {order.orderStatus}
                    </span>
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Ordered on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-[#FF6B35]" />
                    Product Details
                </h3>
                <div className="flex gap-4">
                    <div className="relative h-20 w-20 rounded-xl bg-gray-50 dark:bg-white/5 flex-shrink-0 border border-gray-100 dark:border-white/5 overflow-hidden">
                        {order.product?.productImage && (
                            <Image 
                                src={avatar(order.product.productImage)} 
                                alt={order.product.name} 
                                fill 
                                className="object-cover"
                                unoptimized={true}
                            />
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{order.product?.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{order.product?.description}</p>
                        <p className="font-bold text-[#FF6B35] mt-2">₹{order.totalPayable}</p>
                    </div>
                </div>
            </div>

            {/* Shipping Address */}
            {order.order_address && (
                <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#FF6B35]" />
                        Shipping Address
                    </h3>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{order.order_address.name}</p>
                        <p>{order.order_address.flatNo}, {order.order_address.locality}</p>
                        <p>{order.order_address.city}, {order.order_address.state} - {order.order_address.pincode}</p>
                        <p className="text-xs text-gray-400 mt-1">Phone: {order.order_address.phoneNumber}</p>
                    </div>
                </div>
            )}

            {/* Payment Summary */}
            <div className="p-4 bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#FF6B35]" />
                    Payment Summary
                </h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>₹{order.payableAmount || order.totalPayable}</span>
                    </div>
                    {Number(order.gstPercent) > 0 && (
                        <div className="flex justify-between text-gray-500">
                            <span>GST ({Number(order.gstPercent)}%)</span>
                            <span>Included</span>
                        </div>
                    )}
                    <div className="border-t border-gray-100 dark:border-white/10 my-2 pt-2 flex justify-between font-bold text-gray-900 dark:text-white">
                        <span>Total Paid</span>
                        <span>₹{order.totalPayable}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}