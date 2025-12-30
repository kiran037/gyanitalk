"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import Link from "next/link";
import { avatar } from "@/lib/images";

interface DashboardStats {
  products: {
    total: number;
    active: number;
    categories: number;
  };
  orders: {
    total: number;
    today: number;
    pending: number;
    completed: number;
  };
  revenue: {
    total: number;
    period: number;
    today: number;
  };
  recentOrders: any[];
  topProducts: any[];
  revenueByDate: any[];
  ordersByStatus: any[];
}

export default function AstroShopDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchDashboardStats();
  }, [period]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`/api/astroshop/dashboard?period=${period}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
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

  const statCards = [
    {
      title: "Total Products",
      value: stats?.products.total || 0,
      change: "+12%",
      positive: true,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      link: "/astroshop/products",
    },
    {
      title: "Total Orders",
      value: stats?.orders.total || 0,
      change: "+23%",
      positive: true,
      icon: ShoppingBag,
      color: "from-green-500 to-green-600",
      link: "/astroshop/orders",
    },
    {
      title: "Revenue",
      value: `₹${stats?.revenue.total.toLocaleString() || 0}`,
      change: "+18%",
      positive: true,
      icon: DollarSign,
      color: "from-orange-500 to-orange-600",
      link: "/astroshop/orders",
    },
    {
      title: "Pending Orders",
      value: stats?.orders.pending || 0,
      change: "-5%",
      positive: true,
      icon: Clock,
      color: "from-purple-500 to-purple-600",
      link: "/astroshop/orders?status=pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PageHeader
            title="AstroShop Dashboard"
            subtitle="Monitor your shop performance and manage products"
            badge={{ text: "LIVE", variant: "green" }}
            
          />
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={card.link}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        card.positive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {card.positive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {card.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Recent Orders
              </h3>
              <Link
                href="/astroshop/orders"
                className="text-sm font-medium text-[#FF6B35] hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      ₹{Number(order.totalPayable || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{order.orderStatus}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Top Selling Products
              </h3>
              <Link
                href="/astroshop/products"
                className="text-sm font-medium text-[#FF6B35] hover:underline"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.topProducts.slice(0, 5).map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar(product.productImage)}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Number(product.orderCount)} orders
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#FF6B35]">
                      ₹{Number(product.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Order Status Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats?.ordersByStatus.map((status: any) => (
              <div
                key={status.orderStatus}
                className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-center"
              >
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {Number(status.count)}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {status.orderStatus || "Unknown"}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}