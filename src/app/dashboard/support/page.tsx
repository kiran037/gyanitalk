"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { PieChart } from "@/components/dashboard/charts/PieChart";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import {
  MessageCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  AlertCircle,
  ThumbsUp,
  Award,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function SupportDashboardPage() {
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

      const response = await fetch(`/api/dashboard/support?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch support data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title="Support & Satisfaction Analytics"
          subtitle="Monitor ticket resolution, customer satisfaction, and review metrics"
          badge={{ text: "SUPPORT", variant: "blue" }}
          leftActions={<BackButton />}
        />

        <DateFilterButtons
          activeFilter={filter}
          onFilterChange={setFilter}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
        />

        {/* Ticket Summary Cards */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#FF6B35]" />
            Ticket Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard
              title="Total Tickets"
              value={data?.tickets.summary.total || 0}
              icon={<MessageCircle className="w-5 h-5" />}
              trend={
                data?.tickets.summary.comparison
                  ? {
                    value: data.tickets.summary.comparison.changePercent,
                    isPositive: data.tickets.summary.comparison.isIncrease,
                  }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Open Tickets"
              value={data?.tickets.summary.open || 0}
              icon={<AlertCircle className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Closed Tickets"
              value={data?.tickets.summary.closed || 0}
              icon={<CheckCircle className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Resolution Rate"
              value={`${data?.tickets.summary.resolutionRate.toFixed(1) || 0}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Avg. Resolution Time"
              value={`${data?.tickets.summary.avgResolutionTime.toFixed(1) || 0}h`}
              icon={<Clock className="w-5 h-5" />}
              loading={loading}
            />
          </div>
        </div>

        {/* Daily Ticket Trend & Status Distribution */}
        <div className="grid lg:grid-cols-2 gap-6">
          {!loading && data?.tickets.charts.dailyTrend && (
            <LineChart
              data={{
                labels: data.tickets.charts.dailyTrend.map((item: any) =>
                  new Date(item.date).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })
                ),
                datasets: [
                  {
                    label: "Created",
                    data: data.tickets.charts.dailyTrend.map((item: any) => item.created),
                    borderColor: "rgba(255, 107, 53, 1)",
                  },
                  {
                    label: "Resolved",
                    data: data.tickets.charts.dailyTrend.map((item: any) => item.resolved),
                    borderColor: "rgba(16, 185, 129, 1)",
                  },
                ],
              }}
              title="Daily Ticket Trend"
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

          {!loading && data?.tickets.byStatus && (
            <PieChart
              data={{
                labels: data.tickets.byStatus.map((s: any) => s.status),
                data: data.tickets.byStatus.map((s: any) => s.count),
              }}
              title="Tickets by Status"
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

        {/* Tickets by Category */}
        {!loading && data?.tickets.byCategory && (
          <BarChart
            data={{
              labels: data.tickets.byCategory.map((c: any) => c.categoryName),
              datasets: [
                {
                  label: "Tickets",
                  data: data.tickets.byCategory.map((c: any) => c.count),
                },
              ],
            }}
            title="Tickets by Category"
            height={350}
            horizontal
            titleColor={chartTitleColor}
            textColor={chartTextColor}
            gridColor={chartGridColor}
            tooltipBgColor={tooltipBgColor}
            tooltipTitleColor={tooltipTitleColor}
            tooltipBodyColor={tooltipBodyColor}
            tooltipBorderColor={tooltipBorderColor}
          />
        )}

        {/* User Reviews Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#FF6B35]" />
            User Reviews & Ratings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Reviews"
              value={data?.userReviews.summary.total || 0}
              icon={<Star className="w-5 h-5" />}
              trend={
                data?.userReviews.summary.comparison
                  ? {
                    value: data.userReviews.summary.comparison.changePercent,
                    isPositive: data.userReviews.summary.comparison.isIncrease,
                  }
                  : undefined
              }
              loading={loading}
            />
            <StatCard
              title="Average Rating"
              value={data?.userReviews.summary.avgRating.toFixed(1) || 0}
              icon={<Star className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Blocked Reviews"
              value={data?.userReviews.summary.blocked || 0}
              icon={<AlertCircle className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Reported Reviews"
              value={data?.userReviews.summary.reported || 0}
              icon={<AlertCircle className="w-5 h-5" />}
              loading={loading}
            />
          </div>
        </div>

        {/* Review Distribution & Top Reviewed Astrologers */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          {!loading && data?.userReviews.distribution && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Rating Distribution
              </h3>
              <div className="space-y-3">
                {data.userReviews.distribution.map((rating: any) => (
                  <div key={rating.rating}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {rating.rating} Stars
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {rating.count} ({rating.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${rating.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sentiment Analysis */}
          {!loading && data?.userReviews.sentiment && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Sentiment Analysis
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Positive (4-5 stars)
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {data.userReviews.sentiment.positive}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(data.userReviews.sentiment.positive /
                            data.userReviews.summary.total) *
                          100
                          }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                      Neutral (3 stars)
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {data.userReviews.sentiment.neutral}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${(data.userReviews.sentiment.neutral /
                            data.userReviews.summary.total) *
                          100
                          }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      Negative (1-2 stars)
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {data.userReviews.sentiment.negative}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(data.userReviews.sentiment.negative /
                            data.userReviews.summary.total) *
                          100
                          }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Reviewed Astrologers */}
        {!loading && data?.userReviews.topReviewed && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#FF6B35]" />
              Top Reviewed Astrologers
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.userReviews.topReviewed.map((astro: any, index: number) => (
                <motion.div
                  key={astro.astrologerId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {astro.name}
                      </div>
                      <div className="text-xs text-gray-500">{astro.reviewCount} reviews</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900 dark:text-white">
                      {astro.avgRating.toFixed(1)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Satisfaction Scores */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-[#FF6B35]" />
            Customer Satisfaction Scores
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Customer Satisfaction (CSAT)
                  </div>
                  <div className="text-xs text-gray-500">
                    % of customers rating 4-5 stars
                  </div>
                </div>
                <ThumbsUp className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-5xl font-bold text-green-600 dark:text-green-400">
                {data?.satisfaction.csat.toFixed(1) || 0}%
              </div>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Net Promoter Score (NPS)
                  </div>
                  <div className="text-xs text-gray-500">Promoters minus Detractors</div>
                </div>
                <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {data?.satisfaction.nps.toFixed(1) || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Review Ratings */}
        {!loading && data?.ticketReviews && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Ticket Review Ratings
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Average Rating
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {data.ticketReviews.averageRating.toFixed(1)}
                  </div>
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Total Reviews
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {data.ticketReviews.totalReviews}
                </div>
              </div>
            </div>
            {data.ticketReviews.distribution && (
              <div className="mt-6 space-y-2">
                {data.ticketReviews.distribution.map((rating: any) => (
                  <div key={rating.rating} className="flex items-center gap-3">
                    <span className="text-sm w-8 text-gray-600 dark:text-gray-400">
                      {rating.rating}★
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${(rating.count / data.ticketReviews.totalReviews) * 100
                            }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm w-12 text-right text-gray-600 dark:text-gray-400">
                      {rating.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}