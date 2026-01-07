"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Filter, Search, ChevronRight, Loader2, Calendar, ShoppingBag, ArrowLeft } from "lucide-react";
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
    orderType: "",
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
    <div className="space-y-6 w-full">
      
      {/* Header & Controls */}
      <div className="flex flex-col gap-4">
        {/* Title Row with Back Button */}
        <div className="flex items-start gap-4">
            <Link 
                href="/profile" 
                className="lg:hidden mt-1 p-2.5 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
            >
                <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Order History</h1>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Track and manage your recent purchases.</p>
            </div>
        </div>

        {/* Search & Filter Row */}
        <div className="flex items-center gap-2 w-full">
            <div className="relative group flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search orders..." 
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] outline-none text-sm w-full transition-all"
                />
            </div>
            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${showFilters ? 'bg-[#FF6B35] border-[#FF6B35] text-white' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
                <Filter className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
            >
                <div className="p-4 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Status</label>
                        <select 
                            value={filters.orderStatus}
                            onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-[#FF6B35]"
                        >
                            <option value="">All Statuses</option>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Type</label>
                        <select 
                            value={filters.orderType}
                            onChange={(e) => handleFilterChange('orderType', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-[#FF6B35]"
                        >
                            <option value="">All Types</option>
                            <option value="Product">Product</option>
                            <option value="Service">Service</option>
                        </select>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 min-h-[300px]"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35] mb-2" />
            <p className="text-sm text-gray-500">Fetching orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 text-center px-4">
            <div className="h-20 w-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Orders Found</h3>
            <p className="text-gray-500 max-w-sm">
              {filters.search || filters.orderStatus ? "Try adjusting your filters to find what you're looking for." : "You haven't placed any orders yet. Browse our store to get started!"}
            </p>
            {(filters.search || filters.orderStatus) && (
                <button 
                    onClick={() => setFilters({ orderType: "", orderStatus: "", search: "" })}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-opacity"
                >
                    Clear Filters
                </button>
            )}
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
                     className="p-4 md:p-5 rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 hover:border-[#FF6B35]/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
                 >
                    <div className="flex items-center justify-between">
                        {/* Left Side: Icon/Image & Details */}
                        <div className="flex items-center gap-4">
                            <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-xl bg-gray-50 dark:bg-white/5 overflow-hidden flex-shrink-0 border border-gray-100 dark:border-white/5">
                                {order.product?.productImage ? (
                                <Image
                                    src={avatar(order.product.productImage)}
                                    alt={order.product.name}
                                    fill
                                    className="object-cover"
                                />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        <Package className="h-6 w-6" />
                                    </div>
                                )}
                            </div>
                            
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors text-sm md:text-base">
                                        {order.orderType === 'Product' ? 'Store Purchase' : 'Consultation'}
                                    </span>
                                    <span className="text-[10px] md:text-xs text-gray-400 hidden sm:inline-block">#{order.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-md flex-shrink-0">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    {order.product?.name && (
                                        <span className="truncate max-w-[120px] sm:max-w-[200px]">
                                            {order.product.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Price, Status, Arrow (Desktop) */}
                        <div className="hidden sm:flex items-center gap-4 md:gap-8">
                            <div className="text-right">
                                <p className="font-bold text-lg text-gray-900 dark:text-white">₹{order.totalPayable}</p>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                    order.orderStatus === "Completed"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : order.orderStatus === "Cancelled"
                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    }`}
                                >
                                    {order.orderStatus}
                                </span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-[#FF6B35] group-hover:text-white transition-all">
                                <ChevronRight className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile Price/Status Row */}
                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between sm:hidden">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.orderStatus === "Completed"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : order.orderStatus === "Cancelled"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                        >
                            {order.orderStatus}
                        </span>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-base text-gray-900 dark:text-white">₹{order.totalPayable}</p>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                 </motion.div>
              </Link>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}