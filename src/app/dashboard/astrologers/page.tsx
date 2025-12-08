"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { PieChart } from "@/components/dashboard/charts/PieChart";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { Star, Users, TrendingUp, Clock, Award, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";


export default function AstrologersDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("last_30_days");
  const [customDate, setCustomDate] = useState({ startDate: "", endDate: "" });
  const [activeTab, setActiveTab] = useState<"revenue" | "rating" | "consultations">("revenue");

  const { resolvedTheme } = useTheme();            // 👈 theme
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

  const router = useRouter();

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

      const response = await fetch(`/api/dashboard/astrologers?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch astrologers data:", error);
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
          title="Astrologer Performance"
          subtitle="Monitor astrologer activity, ratings, and performance metrics"
          badge={{ text: "ASTROLOGERS", variant: "purple" }}
          leftActions={<BackButton />}
        />

        <DateFilterButtons
          activeFilter={filter}
          onFilterChange={setFilter}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Astrologers"
            value={data?.summary.totalAstrologers || 0}
            icon={<Star className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Active Astrologers"
            value={data?.summary.activeAstrologers || 0}
            icon={<Users className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Online Now"
            value={data?.summary.onlineAstrologers || 0}
            icon={<TrendingUp className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="New This Period"
            value={data?.summary.newAstrologers || 0}
            icon={<Award className="w-5 h-5" />}
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
            title="Avg. Wait Time"
            value={`${data?.summary.avgWaitTime || 0} min`}
            icon={<Clock className="w-5 h-5" />}
            loading={loading}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Completion Rates
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Chat Completion Rate
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {data?.performance.chatCompletionRate.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data?.performance.chatCompletionRate || 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Call Completion Rate
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {data?.performance.callCompletionRate.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${data?.performance.callCompletionRate || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rating Trend */}
          {!loading && data?.charts.ratingTrend && (
            <LineChart
              data={{
                labels: data.charts.ratingTrend.map((item: any) =>
                  new Date(item.date).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })
                ),
                datasets: [
                  {
                    label: "Average Rating",
                    data: data.charts.ratingTrend.map((item: any) => item.avgRating),
                  },
                ],
              }}
              title="Rating Trend"
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

        {/* Leaderboards */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Leaderboards
            </h3>
            <div className="flex gap-2">
              {(["revenue", "rating", "consultations"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {!loading &&
              data?.leaderboards[activeTab === "revenue" ? "byRevenue" : activeTab === "rating" ? "byRating" : "byConsultations"]?.map(
                (astro: any, index: number) => (
                  <motion.div
                    key={astro.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <img
                        src={avatar(astro.profileImage)}
                        alt={astro.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {astro.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {astro.experience && `${astro.experience}y exp`}
                          {astro.reviewCount && ` • ${astro.reviewCount} reviews`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {activeTab === "revenue" && (
                        <>
                          <div className="font-bold text-[#FF6B35] text-lg">
                            {formatCurrency(astro.revenue)}
                          </div>
                          <div className="text-sm text-gray-500">{astro.consultations} orders</div>
                        </>
                      )}
                      {activeTab === "rating" && (
                        <>
                          <div className="font-bold text-yellow-500 text-lg flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current" />
                            {astro.avgRating.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">{astro.reviewCount} reviews</div>
                        </>
                      )}
                      {activeTab === "consultations" && (
                        <div className="font-bold text-blue-500 text-lg">
                          {astro.consultations} sessions
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              )}
          </div>
        </div>

        {/* Skill & Experience Distribution */}
        <div className="grid lg:grid-cols-2 gap-6">
          {!loading && data?.charts.skillDistribution && (
            <PieChart
              data={{
                labels: Object.keys(data.charts.skillDistribution),
                data: Object.values(data.charts.skillDistribution),
              }}
              title="Skill Distribution"
              height={350}
              titleColor={chartTitleColor}
              textColor={chartTextColor}
              tooltipBgColor={tooltipBgColor}
              tooltipTitleColor={tooltipTitleColor}
              tooltipBodyColor={tooltipBodyColor}
              tooltipBorderColor={tooltipBorderColor}
            />
          )}

          {!loading && data?.charts.experienceDistribution && (
            <BarChart
              data={{
                labels: Object.keys(data.charts.experienceDistribution),
                datasets: [
                  {
                    label: "Astrologers",
                    data: Object.values(data.charts.experienceDistribution),
                  },
                ],
              }}
              title="Experience Distribution"
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
      </div>
    </div>
  );
}