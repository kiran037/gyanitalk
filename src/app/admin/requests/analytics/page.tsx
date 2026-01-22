// ===================================
// FILE: app/admin/requests/analytics/page.tsx
// ===================================

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { AnalyticsOverviewCards } from "@/components/requests/AnalyticsOverviewCards";
import { AcceptanceRateChart } from "@/components/requests/AcceptanceRateChart";
import { GroupPerformanceTable } from "@/components/requests/GroupPerformanceTable";
import { GroupPerformanceCard } from "@/components/requests/GroupPerformanceCard";
import {
  useAnalyticsOverview,
  useGroupPerformance,
  useAcceptanceRate,
} from "@/lib/requests/hooks";
import { BarChart3, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const [days, setDays] = useState(7);
  const [chartType, setChartType] = useState<"call" | "chat" | "combined">("combined");

  const { data: overview, loading: overviewLoading } = useAnalyticsOverview(days);
  const { data: groupPerformance, loading: groupsLoading } = useGroupPerformance(days);
  const { data: acceptanceData, loading: acceptanceLoading } = useAcceptanceRate(days);

  const handleDateFilterChange = (filter: string) => {
    const daysMap: Record<string, number> = {
      today: 1,
      last_7_days: 7,
      last_30_days: 30,
      last_3_months: 90,
      last_6_months: 180,
      last_1_year: 365,
    };
    setDays(daysMap[filter] || 7);
  };

  return (
    <div className="space-y-6 p-10">
      {/* Header */}
      <PageHeader
        title="Analytics Dashboard"
        subtitle={`Performance metrics for the last ${days} day${days !== 1 ? "s" : ""}`}
        badge={{ text: "Analytics", variant: "purple" }}
      />

      {/* Date Filter */}
      <DateFilterButtons
        activeFilter={
          days === 1
            ? "today"
            : days === 7
            ? "last_7_days"
            : days === 30
            ? "last_30_days"
            : days === 90
            ? "last_3_months"
            : days === 180
            ? "last_6_months"
            : "last_1_year"
        }
        onFilterChange={handleDateFilterChange}
      />

      {/* Overview Cards */}
      <AnalyticsOverviewCards data={overview} loading={overviewLoading} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Acceptance Rate Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Acceptance & Completion Trends
              </h2>
            </div>

            {/* Chart Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setChartType("combined")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartType === "combined"
                    ? "bg-[#FF6B35] text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Combined
              </button>
              <button
                onClick={() => setChartType("call")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartType === "call"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Calls
              </button>
              <button
                onClick={() => setChartType("chat")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartType === "chat"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Chats
              </button>
            </div>
          </div>

          {acceptanceData ? (
            <AcceptanceRateChart
              data={
                chartType === "combined"
                  ? acceptanceData.dailyTrends.calls.map((call, i) => ({
                      ...call,
                      acceptanceRate: (
                        (parseFloat(call.acceptanceRate) +
                          parseFloat(acceptanceData.dailyTrends.chats[i]?.acceptanceRate || "0")) /
                        2
                      ).toFixed(2),
                      completionRate: (
                        (parseFloat(call.completionRate) +
                          parseFloat(acceptanceData.dailyTrends.chats[i]?.completionRate || "0")) /
                        2
                      ).toFixed(2),
                    }))
                  : chartType === "call"
                  ? acceptanceData.dailyTrends.calls
                  : acceptanceData.dailyTrends.chats
              }
              type={chartType}
              loading={acceptanceLoading}
            />
          ) : (
            <AcceptanceRateChart data={[]} type={chartType} loading={acceptanceLoading} />
          )}
        </div>
      </div>

      {/* Group Performance Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-[#FF6B35]" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Group Performance Comparison
          </h2>
        </div>

        {/* Performance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {groupPerformance.slice(0, 6).map((group) => (
            <GroupPerformanceCard key={group.groupId} group={group} />
          ))}
        </div>

        {/* Performance Table */}
        <GroupPerformanceTable groups={groupPerformance} loading={groupsLoading} />
      </div>

      {/* Summary */}
      {overview && (
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] rounded-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm opacity-90">Total Requests</p>
              <p className="text-2xl font-bold">{overview.summary.totalRequests}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Acceptance Rate</p>
              <p className="text-2xl font-bold">{overview.rates.acceptanceRate}%</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Completion Rate</p>
              <p className="text-2xl font-bold">{overview.rates.completionRate}%</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Active Astrologers</p>
              <p className="text-2xl font-bold">{overview.summary.activeAstrologers}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}