"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  TrendingUp,
  Activity,
  DollarSign,
  MessageSquare,
  Phone,
  ShoppingBag,
  Star,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { StatsCard } from "@/components/user-activities/StatsCard";
import { UserActivityTable } from "@/components/user-activities/UserActivityTable";
import { useToast } from "@/components/Toast/ToastProvider";

interface PlatformStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    activeRate: string;
  };
  activity: {
    chats: { total: number; revenue: number; average: number };
    calls: { total: number; revenue: number; average: number };
    orders: { total: number; revenue: number; average: number };
  };
  revenue: {
    total: number;
    byType: Array<{ type: string; total: number; count: number }>;
  };
  engagement: {
    reviews: { total: number; averageRating: number };
    follows: number;
    gifts: number;
  };
}

export default function UserActivitiesPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const addToast = useToast();

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-activities/stats?period=${period}`);
      const data = await res.json();

      if (data.success) {
        setStats(data.data);
      } else {
        addToast("error", "Error", "Failed to load statistics");
      }
    } catch (error) {
      console.error(error);
      addToast("error", "Error", "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

      <div className="relative z-10 p-6 lg:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader
            title="User Activities"
            subtitle="Monitor user engagement, behavior patterns, and platform analytics"
            badge={{ text: "Analytics", variant: "purple" }}
            actions={
              <div className="flex items-center gap-3">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
                >
                  <option value="7">Last 7 Days</option>
                  <option value="30">Last 30 Days</option>
                  <option value="90">Last 90 Days</option>
                  <option value="365">Last Year</option>
                </select>
                <Button variant="outline" icon={<Download className="w-4 h-4" />}>
                  Export
                </Button>
              </div>
            }
          />
        </motion.div>

        {/* Stats Overview */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
              >
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={stats.overview.totalUsers.toLocaleString()}
              icon={<Users className="w-5 h-5" />}
              trend={{ value: stats.overview.newUsers, label: "new users" }}
              color="blue"
            />
            <StatsCard
              title="Active Users"
              value={stats.overview.activeUsers.toLocaleString()}
              icon={<Activity className="w-5 h-5" />}
              trend={{ value: parseFloat(stats.overview.activeRate), label: "active rate", isPercentage: true }}
              color="green"
            />
            <StatsCard
              title="Total Revenue"
              value={`₹${(stats.revenue.total / 1000).toFixed(1)}K`}
              icon={<DollarSign className="w-5 h-5" />}
              trend={{ value: stats.activity.chats.total + stats.activity.calls.total, label: "transactions" }}
              color="orange"
            />
            <StatsCard
              title="Engagement"
              value={stats.engagement.reviews.total.toLocaleString()}
              icon={<Star className="w-5 h-5" />}
              trend={{ value: stats.engagement.reviews.averageRating, label: "avg rating" }}
              color="purple"
            />

            <StatsCard
              title="Total Chats"
              value={stats.activity.chats.total.toLocaleString()}
              icon={<MessageSquare className="w-5 h-5" />}
              trend={{ value: stats.activity.chats.revenue, label: "revenue", isCurrency: true }}
              color="blue"
            />
            <StatsCard
              title="Total Calls"
              value={stats.activity.calls.total.toLocaleString()}
              icon={<Phone className="w-5 h-5" />}
              trend={{ value: stats.activity.calls.revenue, label: "revenue", isCurrency: true }}
              color="green"
            />
            <StatsCard
              title="Total Orders"
              value={stats.activity.orders.total.toLocaleString()}
              icon={<ShoppingBag className="w-5 h-5" />}
              trend={{ value: stats.activity.orders.revenue, label: "revenue", isCurrency: true }}
              color="orange"
            />
            <StatsCard
              title="Followers"
              value={stats.engagement.follows.toLocaleString()}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={{ value: stats.engagement.gifts, label: "gifts sent" }}
              color="purple"
            />
          </div>
        ) : null}

        {/* User Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <UserActivityTable />
        </motion.div>
      </div>
    </div>
  );
}