// app/earnings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import Link from "next/link";
import { avatar } from "@/lib/images";

interface DashboardStats {
  pendingWithdrawals: {
    amount: number;
    count: number;
  };
  approvedWithdrawals: {
    amount: number;
    count: number;
  };
  totalPlatformEarnings: number;
  adminCommissionEarned: number;
  topAstrologers: Array<{
    astrologerId: string | null;
    name: string | null;
    profileImage: string | null;
    email: string | null;
    totalEarnings: number;
  }>;

  earningsByServiceType: Array<{
    type: string;
    amount: number;
    count: number;
  }>;
}

export default function EarningsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [dateRange]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const response = await fetch(`/api/earnings/dashboard?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color
  }: any) => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.02, borderColor: `rgba(255, 107, 53, 0.3)` }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? `₹${value.toLocaleString()}` : value}
          </h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-6">
        <PageHeader
          title="Earnings Dashboard"
          subtitle="Overview of platform earnings and withdrawals"
          badge={{ text: "FINANCIAL", variant: "green" }}
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-6">
      <PageHeader
        title="Earnings Dashboard"
        subtitle="Overview of platform earnings and withdrawals"
        badge={{ text: "FINANCIAL", variant: "green" }}
      />

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Withdrawals"
          value={stats?.pendingWithdrawals.amount || 0}
          icon={Clock}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
        <StatCard
          title="Approved Withdrawals"
          value={stats?.approvedWithdrawals.amount || 0}
          icon={CheckCircle}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Platform Earnings"
          value={stats?.totalPlatformEarnings || 0}
          icon={DollarSign}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Admin Commission"
          value={stats?.adminCommissionEarned || 0}
          icon={TrendingUp}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/earnings/withdrawals">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
          >
            <Wallet className="w-8 h-8 text-[#FF6B35] mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Manage Withdrawals
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stats?.pendingWithdrawals.count || 0} pending requests
            </p>
          </motion.div>
        </Link>

        <Link href="/admin/earnings/astrologers">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
          >
            <Users className="w-8 h-8 text-[#FF6B35] mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Astrologer Balances
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View & manage wallets
            </p>
          </motion.div>
        </Link>

        <Link href="/admin/earnings/commissions">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
          >
            <DollarSign className="w-8 h-8 text-[#FF6B35] mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Commission Settings
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure commission rates
            </p>
          </motion.div>
        </Link>

        <Link href="/admin/earnings/reports">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 cursor-pointer"
            whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
          >
            <TrendingUp className="w-8 h-8 text-[#FF6B35] mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Reports
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Export financial reports
            </p>
          </motion.div>
        </Link>
      </div>

      {/* Top Astrologers */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Top Earning Astrologers
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Astrologer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats?.topAstrologers.map((astrologer, index) => (
                  <tr
                    key={astrologer.astrologerId ?? `idx-${index}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                          {astrologer.profileImage && (
                            <img src={avatar(astrologer.profileImage)} alt={astrologer.name || 'Astrologer'} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {astrologer.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {astrologer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ₹{astrologer.totalEarnings.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Earnings by Service Type */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Earnings by Service Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats?.earningsByServiceType.map((service) => (
            <motion.div
              key={service.type}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {service.type || 'Other'}
              </h3>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                ₹{service.amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {service.count} transactions
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}