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
  TrendingUp,
  PieChart as PieChartIcon,
  CreditCard,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function RevenueDashboardPage() {
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

      const response = await fetch(`/api/dashboard/revenue?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch revenue data:", error);
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
          title="Revenue Analytics"
          subtitle="Track revenue streams and financial performance"
          badge={{ text: "FINANCIAL", variant: "green" }}
          leftActions={<BackButton />}
        />

        <DateFilterButtons
          activeFilter={filter}
          onFilterChange={setFilter}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(data?.summary.totalRevenue || 0)}
            icon={<DollarSign className="w-5 h-5" />}
            trend={
              data?.summary.comparison
                ? {
                    value: data.summary.comparison.changePercent,
                    isPositive: data.summary.comparison.isIncrease,
                  }
                : undefined
            }
            loading={loading}
          />
          <StatCard
            title="Admin Earnings"
            value={formatCurrency(data?.summary.adminEarnings || 0)}
            icon={<TrendingUp className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Astrologer Earnings"
            value={formatCurrency(data?.summary.astrologerEarnings || 0)}
            icon={<PieChartIcon className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Wallet Transactions"
            value={data?.walletStats.transactionCount || 0}
            icon={<CreditCard className="w-5 h-5" />}
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Revenue Trend */}
{!loading && data?.charts.dailyTrend && (
  <LineChart
    data={{
      labels: data.charts.dailyTrend.map((item: any) =>
        new Date(item.date).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          label: "Chat",
          data: data.charts.dailyTrend.map((item: any) => item.chat),
          borderColor: "rgba(255, 107, 53, 1)",
        },
        {
          label: "Call",
          data: data.charts.dailyTrend.map((item: any) => item.call),
          borderColor: "rgba(59, 130, 246, 1)",
        },
        {
          label: "Product",
          data: data.charts.dailyTrend.map((item: any) => item.product),
          borderColor: "rgba(16, 185, 129, 1)",
        },
        {
          label: "Report",
          data: data.charts.dailyTrend.map((item: any) => item.report),
          borderColor: "rgba(139, 92, 246, 1)",
        },
      ],
    }}
    title="Revenue by Service Type"
    height={350}
    titleColor={chartTitleColor}
    textColor={chartTextColor}
    gridColor={chartGridColor}
    tooltipBgColor={tooltipBgColor}
    tooltipTitleColor={tooltipTitleColor}
    tooltipBodyColor={tooltipBodyColor}
    tooltipBorderColor={tooltipBorderColor}
  />
)}

          {/* Revenue by Service */}
 {!loading && data?.revenueByService && (
  <PieChart
    data={{
      labels: ["Chat", "Call", "Product", "Report", "Course"],
      data: [
        data.revenueByService.chat.revenue,
        data.revenueByService.call.revenue,
        data.revenueByService.product.revenue,
        data.revenueByService.report.revenue,
        data.revenueByService.course.revenue,
      ],
    }}
    title="Revenue Distribution"
    height={350}
    titleColor={chartTitleColor}
    textColor={chartTextColor}
    tooltipBgColor={tooltipBgColor}
    tooltipTitleColor={tooltipTitleColor}
    tooltipBodyColor={tooltipBodyColor}
    tooltipBorderColor={tooltipBorderColor}
  />
)}
        </div>

        {/* Top Astrologers & Payment Methods */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Revenue Generating Astrologers */}
          {!loading && data?.charts.topAstrologers && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Top Revenue Generating Astrologers
              </h3>
              <div className="space-y-3">
                {data.charts.topAstrologers.map((astro: any, index: number) => (
                  <motion.div
                    key={astro.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-xs">
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
                          {astro.orders} orders • {astro.experience}y exp
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

          {/* Payment Methods */}
      {!loading && data?.charts.paymentMethods && (
  <BarChart
    data={{
      labels: data.charts.paymentMethods.map((pm: any) => pm.method),
      datasets: [
        {
          label: "Amount",
          data: data.charts.paymentMethods.map((pm: any) => pm.amount),
        },
      ],
    }}
    title="Payment Methods Distribution"
    height={350}
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

        {/* Service Breakdown Table */}
        {!loading && data?.revenueByService && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Revenue Breakdown by Service
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Service
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Revenue
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Orders
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.revenueByService).map(([key, service]: [string, any]) => (
                    <tr
                      key={key}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white capitalize">
                        {key}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                        {formatCurrency(service.revenue)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right text-gray-600 dark:text-gray-400">
                        {service.count}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-[#FF6B35]">
                        {service.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}