"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Filter, Search, Loader2, Calendar, ShoppingBag, ArrowLeft, ChevronRight } from "lucide-react";
import { avatar } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    orderStatus: "",
    search: "",
  });

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        orderType: "Product", // Hardcoded to fetch only products
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
      });

      const res = await fetch(`/api/landing/profile/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
        setPagination(data.data.pagination);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); 
  };

  return (
    <div className="space-y-5 w-full max-w-4xl mx-auto px-4 sm:px-0 pb-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
            <Link 
                href="/profile" 
                className="lg:hidden p-2 rounded-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 shadow-sm"
            >
                <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Order History</h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Manage your product purchases.</p>
            </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] text-sm focus:border-[#FF6B35] outline-none"
                />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border transition-colors ${showFilters ? 'bg-[#FF6B35] border-[#FF6B35] text-white' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#111]'}`}
            >
                <Filter className="h-4 w-4" />
            </button>
        </div>
      </div>

      {/* Filters Dropdown */}
      <AnimatePresence>
        {showFilters && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
            >
                <div className="p-3 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 mb-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                    <select 
                        value={filters.orderStatus}
                        onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm outline-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Orders List */}
      <div className="space-y-3 min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#FF6B35] mb-2" />
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="h-12 w-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                <ShoppingBag className="h-6 w-6 text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">No Orders</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
              No product orders found matching your criteria.
            </p>
          </div>
        ) : (
          <>
            {orders.map((order, i) => (
              <Link 
                key={order.id} 
                href={`/profile/orders/${order.id}`}
                className="block group"
              >
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.05 }}
                     className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 shadow-sm group-hover:border-[#FF6B35]/30 group-active:scale-[0.99] transition-all"
                  >
                    <div className="flex items-center gap-3">
                        {/* Image */}
                        <div className="relative h-12 w-12 rounded-lg bg-gray-50 dark:bg-white/5 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/5">
                            {order.product?.productImage ? (
                            <Image
                                src={avatar(order.product.productImage)}
                                alt={order.product.name}
                                fill
                                className="object-cover"
                                unoptimized={true}
                            />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    <Package className="h-5 w-5" />
                                </div>
                            )}
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                 <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2 group-hover:text-[#FF6B35] transition-colors">
                                    {order.product?.name || "Product Name Unavailable"}
                                 </h3>
                                 <div className="flex items-center gap-1">
                                    <span className="font-bold text-sm text-gray-900 dark:text-white">₹{order.totalPayable}</span>
                                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#FF6B35]" />
                                 </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400">ID: {order.id.toString().slice(-6)}</span>
                                <span className="text-[10px] text-gray-300 dark:text-gray-600">•</span>
                                <span className="flex items-center gap-1 text-[10px] text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(order.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                    order.orderStatus === "Completed" ? "bg-green-50 text-green-600" :
                                    order.orderStatus === "Cancelled" ? "bg-red-50 text-red-600" :
                                    "bg-yellow-50 text-yellow-600"
                                }`}>
                                    {order.orderStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                  </motion.div>
              </Link>
            ))}

            {/* Simple Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs font-medium self-center text-gray-500">
                  {currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}