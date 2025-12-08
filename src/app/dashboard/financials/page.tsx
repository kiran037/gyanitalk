"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { PieChart } from "@/components/dashboard/charts/PieChart";
import { Wallet, TrendingDown, CreditCard, DollarSign, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function FinancialsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("last_30_days");
  const [customDate, setCustomDate] = useState({ startDate: "", endDate: "" });

    const router = useRouter();
      const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const chartTitleColor = isDark ? "#F9FAFB" : "#111827";
  const chartTextColor = isDark ? "#9CA3AF" : "#4B5563";
  const chartGridColor = isDark
    ? "rgba(75,85,99,0.2)"
    : "rgba(209,213,219,0.6)";
  const tooltipBgColor = isDark
    ? "rgba(0,0,0,0.85)"
    : "rgba(249,250,251,0.98)";
  const tooltipTitleColor = isDark ? "#F9FAFB" : "#111827";
  const tooltipBodyColor = isDark ? "#E5E7EB" : "#1F2937";
  const tooltipBorderColor = "rgba(255,107,53,0.5)";

  const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
    </button>
  );

  useEffect(() => {
    fetchData();
  }, [filter, customDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter });
      if (filter === "custom" && customDate.startDate && customDate.endDate) {
        params.append("startDate", customDate.startDate);
        params.append("endDate", customDate.endDate);
      }

      const response = await fetch(`/api/dashboard/financials?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch financials data:", error);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Financial Management"
          subtitle="Monitor wallets, withdrawals, payments, and commissions"
          badge={{ text: "FINANCE", variant: "green" }}
          leftActions={<BackButton />}
        />

        <DateFilterButtons
          activeFilter={filter}
          onFilterChange={setFilter}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        {/* Wallet Summary */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Wallet Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Wallet Balance"
              value={formatCurrency(data?.wallet.summary.totalBalance || 0)}
              icon={<Wallet className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Active Wallets"
              value={data?.wallet.summary.activeWallets || 0}
              icon={<Wallet className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Recharges"
              value={data?.wallet.summary.recharges || 0}
              icon={<CreditCard className="w-5 h-5" />}
              trend={
                data?.wallet.summary.rechargesComparison
                  ? {
                      value: data.wallet.summary.rechargesComparison.changePercent,
                      isPositive: data.wallet.summary.rechargesComparison.isIncrease,
                    }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Recharge Revenue"
              value={formatCurrency(data?.wallet.summary.rechargeRevenue || 0)}
              icon={<DollarSign className="w-5 h-5" />}
              trend={
                data?.wallet.summary.rechargeRevenueComparison
                  ? {
                      value: data.wallet.summary.rechargeRevenueComparison.changePercent,
                      isPositive: data.wallet.summary.rechargeRevenueComparison.isIncrease,
                    }
                  : undefined
              }
              loading={loading}
            />
          </div>
        </div>

        {/* Withdrawal Summary */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            Withdrawal Requests
            {!loading && data?.withdrawals.summary.pending.count > 0 && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {data.withdrawals.summary.pending.count} Pending
              </span>
            )}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                  Pending
                </span>
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-300 mb-1">
                {data?.withdrawals.summary.pending.count || 0}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-500">
                {formatCurrency(data?.withdrawals.summary.pending.amount || 0)}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-800 dark:text-green-400">
                  Approved
                </span>
                <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-300 mb-1">
                {data?.withdrawals.summary.approved.count || 0}
              </div>
              <div className="text-sm text-green-700 dark:text-green-500">
                {formatCurrency(data?.withdrawals.summary.approved.amount || 0)}
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800 dark:text-red-400">
                  Rejected
                </span>
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-900 dark:text-red-300 mb-1">
                {data?.withdrawals.summary.rejected.count || 0}
              </div>
              <div className="text-sm text-red-700 dark:text-red-500">
                {formatCurrency(data?.withdrawals.summary.rejected.amount || 0)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Amount
                </span>
                <DollarSign className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {formatCurrency(data?.withdrawals.summary.total || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Transactions & Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Transaction Breakdown */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Wallet Transactions
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Credits
                  </span>
                  <span className="text-sm text-gray-500">
                    {data?.wallet.transactions.credits.count || 0} transactions
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {formatCurrency(data?.wallet.transactions.credits.amount || 0)}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((data?.wallet.transactions.credits.amount || 0) /
                          ((data?.wallet.transactions.credits.amount || 0) +
                            (data?.wallet.transactions.debits.amount || 1))) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Debits
                  </span>
                  <span className="text-sm text-gray-500">
                    {data?.wallet.transactions.debits.count || 0} transactions
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {formatCurrency(data?.wallet.transactions.debits.amount || 0)}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((data?.wallet.transactions.debits.amount || 0) /
                          ((data?.wallet.transactions.credits.amount || 1) +
                            (data?.wallet.transactions.debits.amount || 0))) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Daily Wallet Trend */}
          {!loading && data?.wallet.charts.dailyTrend && (
  <LineChart
    data={{
      labels: data.wallet.charts.dailyTrend.map((item: any) =>
        new Date(item.date).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          label: "Credits",
          data: data.wallet.charts.dailyTrend.map((item: any) => item.credits),
          borderColor: "rgba(16, 185, 129, 1)",
        },
        {
          label: "Debits",
          data: data.wallet.charts.dailyTrend.map((item: any) => item.debits),
          borderColor: "rgba(239, 68, 68, 1)",
        },
      ],
    }}
    title="Daily Wallet Activity"
    height={250}
    titleColor={chartTitleColor}
    textColor={chartTextColor}
    gridColor={chartGridColor}
    tooltipBgColor={tooltipBgColor}
    tooltipTitleColor={tooltipTitleColor}
    tooltipBodyColor={tooltipBodyColor}
    tooltipBorderColor={tooltipBorderColor}
  />
)}
        </div>

        {/* Payment Gateway & Withdrawal Methods */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Payment Gateway Analysis */}
          {!loading && data?.paymentGateway && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Payment Gateway Performance
              </h3>
              <div className="space-y-3">
                {data.paymentGateway.map((gateway: any, index: number) => (
                  <motion.div
                    key={gateway.gateway}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {gateway.gateway}
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-400 font-bold">
                        {gateway.successRate.toFixed(1)}% Success
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>{gateway.successfulTransactions} / {gateway.totalTransactions} successful</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(gateway.totalAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] h-2 rounded-full"
                        style={{ width: `${gateway.successRate}%` }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Withdrawal by Method */}
         {!loading && data?.withdrawals.byMethod && (
  <BarChart
    data={{
      labels: data.withdrawals.byMethod.map((m: any) => m.method),
      datasets: [
        {
          label: "Amount",
          data: data.withdrawals.byMethod.map((m: any) => m.amount),
        },
      ],
    }}
    title="Withdrawals by Payment Method"
    height={320}
    titleColor={chartTitleColor}
    textColor={chartTextColor}
    gridColor={chartGridColor}
    tooltipBgColor={tooltipBgColor}
    tooltipTitleColor={tooltipTitleColor}
    tooltipBodyColor={tooltipBodyColor}
    tooltipBorderColor={tooltipBorderColor}
  />
)}
        </div>

        {/* Top Withdrawal Requests */}
        {!loading && data?.withdrawals.topRequests && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Top Withdrawal Requests
            </h3>
            <div className="space-y-3">
              {data.withdrawals.topRequests.map((req: any, index: number) => (
                <motion.div
                  key={req.astrologerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-xs">
                      #{index + 1}
                    </div>
                    <img
                      src={avatar(req.profileImage)}
                      alt={req.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {req.name}
                      </div>
                      <div className="text-xs text-gray-500">{req.requests} requests</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#FF6B35]">
                      {formatCurrency(req.totalAmount)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Commission Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Commission Overview
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Total Commissions
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data?.commissions.totalCommissions || 0)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Admin Earnings
              </div>
              <div className="text-2xl font-bold text-[#FF6B35]">
                {formatCurrency(data?.commissions.adminEarnings || 0)}
              </div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Commission Count
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.commissions.commissionsCount || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}