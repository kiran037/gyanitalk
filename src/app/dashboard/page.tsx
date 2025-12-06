"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { PieChart } from "@/components/dashboard/charts/PieChart";
import {
  DollarSign,
  Users,
  Star,
  Phone,
  MessageSquare,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";
import Link from "next/link";

interface DashboardData {
  cards: {
    revenue: { value: number; comparison: any };
    users: { value: number; comparison: any };
    astrologers: { value: number };
    consultations: {
      value: number;
      comparison: any;
      breakdown: { chat: number; call: number };
    };
    orders: { value: number; comparison: any };
  };
  charts: {
    revenueTrend: { date: string; revenue: number }[];
    topAstrologers: {
      id: bigint;
      name: string;
      profileImage: string | null;
      revenue: number;
      orders: number;
    }[];
  };
  recentActivity: {
    id: bigint;
    type: string | null;
    user: { id?: bigint; name: string; profile: string | null };
    astrologer: { id?: bigint; name: string };
    amount: number;
    status: string | null;
    createdAt: Date | null;
  }[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [filter, setFilter] = useState("last_30_days");
  const [customDate, setCustomDate] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    fetchDashboardData();
  }, [filter, customDate]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter });
      if (filter === "custom" && customDate.startDate && customDate.endDate) {
        params.append("startDate", customDate.startDate);
        params.append("endDate", customDate.endDate);
      }

      const response = await fetch(`/api/dashboard/overview?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Dashboard Overview"
          subtitle="Monitor your platform's performance and key metrics"
          badge={{ text: "LIVE", variant: "green" }}
          actions={
            <Link href="/dashboard/live">
              <button className="px-4 py-2 bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white text-sm font-medium rounded-lg hover:shadow-lg transition-shadow">
                View Live Activity
              </button>
            </Link>
          }
        />

        {/* Date Filter */}
        <DateFilterButtons
          activeFilter={filter}
          onFilterChange={setFilter}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data?.cards.revenue.value || 0)}
            icon={<DollarSign className="w-5 h-5" />}
            trend={
              data?.cards.revenue.comparison
                ? {
                    value: data.cards.revenue.comparison.changePercent,
                    isPositive: data.cards.revenue.comparison.isIncrease,
                  }
                : undefined
            }
            loading={loading}
            onClick={() => (window.location.href = "/dashboard/revenue")}
          />

          <StatCard
            title="New Users"
            value={data?.cards.users.value || 0}
            icon={<Users className="w-5 h-5" />}
            trend={
              data?.cards.users.comparison
                ? {
                    value: data.cards.users.comparison.changePercent,
                    isPositive: data.cards.users.comparison.isIncrease,
                  }
                : undefined
            }
            loading={loading}
            onClick={() => (window.location.href = "/dashboard/users")}
          />

          <StatCard
            title="Active Astrologers"
            value={data?.cards.astrologers.value || 0}
            icon={<Star className="w-5 h-5" />}
            loading={loading}
            onClick={() => (window.location.href = "/dashboard/astrologers")}
          />

          <StatCard
            title="Consultations"
            value={data?.cards.consultations.value || 0}
            icon={<MessageSquare className="w-5 h-5" />}
            trend={
              data?.cards.consultations.comparison
                ? {
                    value: data.cards.consultations.comparison.changePercent,
                    isPositive: data.cards.consultations.comparison.isIncrease,
                  }
                : undefined
            }
            loading={loading}
            onClick={() => (window.location.href = "/dashboard/consultations")}
          />

          <StatCard
            title="Total Orders"
            value={data?.cards.orders.value || 0}
            icon={<ShoppingBag className="w-5 h-5" />}
            trend={
              data?.cards.orders.comparison
                ? {
                    value: data.cards.orders.comparison.changePercent,
                    isPositive: data.cards.orders.comparison.isIncrease,
                  }
                : undefined
            }
            loading={loading}
            onClick={() => (window.location.href = "/dashboard/products")}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          {!loading && data?.charts.revenueTrend && (
            <LineChart
              data={{
                labels: data.charts.revenueTrend.map((item) =>
                  new Date(item.date).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })
                ),
                datasets: [
                  {
                    label: "Revenue",
                    data: data.charts.revenueTrend.map((item) => item.revenue),
                  },
                ],
              }}
              title="Revenue Trend"
              height={300}
            />
          )}

          {/* Consultation Types */}
          {!loading && data?.cards.consultations && (
            <PieChart
              data={{
                labels: ["Chat", "Call"],
                data: [
                  data.cards.consultations.breakdown.chat,
                  data.cards.consultations.breakdown.call,
                ],
              }}
              title="Consultations by Type"
              height={300}
            />
          )}
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Astrologers */}
          {!loading && data?.charts.topAstrologers && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                Top Astrologers
              </h3>
              <div className="space-y-3">
                {data.charts.topAstrologers.slice(0, 5).map((astro, index) => (
                  <motion.div
                    key={astro.id.toString()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <img
                        src={avatar(astro.profileImage)}
                        alt={astro.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {astro.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {astro.orders} orders
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#FF6B35]">
                        {formatCurrency(astro.revenue)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {!loading && data?.recentActivity && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#FF6B35]" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {data.recentActivity.slice(0, 5).map((activity, index) => (
                  <motion.div
                    key={activity.id.toString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={avatar(activity.user.profile)}
                        alt={activity.user.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {activity.type} • {activity.astrologer.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-sm font-bold text-[#FF6B35]">
                        {formatCurrency(activity.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(activity.createdAt)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Revenue Analytics", href: "/dashboard/revenue", icon: DollarSign },
            { title: "User Analytics", href: "/dashboard/users", icon: Users },
            { title: "Astrologers", href: "/dashboard/astrologers", icon: Star },
            { title: "Support Tickets", href: "/dashboard/support", icon: MessageSquare },
          ].map((link) => (
            <Link key={link.href} href={link.href}>
              <motion.div
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-[#FF6B35] transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <link.icon className="w-6 h-6 text-[#FF6B35] mb-2" />
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {link.title}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}