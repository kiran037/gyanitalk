"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { PieChart } from "@/components/dashboard/charts/PieChart";
import { MessageSquare, Phone, Video, Clock, TrendingUp, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConsultationsDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState("last_30_days");
  const [customDate, setCustomDate] = useState({ startDate: "", endDate: "" });

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

      const response = await fetch(`/api/dashboard/consultations?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch consultations data:", error);
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
          title="Consultation Analytics"
          subtitle="Track consultation patterns, peak hours, and service performance"
          badge={{ text: "CONSULTATIONS", variant: "orange" }}
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
            title="Total Consultations"
            value={data?.summary.totalConsultations || 0}
            icon={<TrendingUp className="w-5 h-5" />}
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
            title="Chat Sessions"
            value={data?.summary.chats.count || 0}
            icon={<MessageSquare className="w-5 h-5" />}
            trend={
              data?.summary.chats.comparison
                ? {
                    value: data.summary.chats.comparison.changePercent,
                    isPositive: data.summary.chats.comparison.isIncrease,
                  }
                : undefined
            }
            loading={loading}
          />
          <StatCard
            title="Audio Calls"
            value={data?.summary.calls.audio || 0}
            icon={<Phone className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Video Calls"
            value={data?.summary.calls.video || 0}
            icon={<Video className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Free Sessions"
            value={(data?.summary.chats.free || 0) + (data?.summary.calls.free || 0)}
            icon={<Clock className="w-5 h-5" />}
            loading={loading}
          />
        </div>

        {/* Daily Trend */}
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
                  label: "Chats",
                  data: data.charts.dailyTrend.map((item: any) => item.chats),
                  borderColor: "rgba(255, 107, 53, 1)",
                },
                {
                  label: "Calls",
                  data: data.charts.dailyTrend.map((item: any) => item.calls),
                  borderColor: "rgba(59, 130, 246, 1)",
                },
                {
                  label: "Video Calls",
                  data: data.charts.dailyTrend.map((item: any) => item.videoCalls),
                  borderColor: "rgba(16, 185, 129, 1)",
                },
              ],
            }}
            title="Daily Consultation Trend"
            height={350}
          />
        )}

        {/* Peak Hours & Peak Days */}
        <div className="grid lg:grid-cols-2 gap-6">
          {!loading && data?.charts.peakHours && (
            <BarChart
              data={{
                labels: data.charts.peakHours.map((h: any) => `${h.hour}:00`),
                datasets: [
                  {
                    label: "Chats",
                    data: data.charts.peakHours.map((h: any) => h.chats),
                    backgroundColor: "rgba(255, 107, 53, 0.8)",
                  },
                  {
                    label: "Calls",
                    data: data.charts.peakHours.map((h: any) => h.calls),
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                  },
                ],
              }}
              title="Peak Hours Analysis"
              height={350}
            />
          )}

          {!loading && data?.charts.peakDays && (
            <BarChart
              data={{
                labels: data.charts.peakDays.map((d: any) => d.dayName),
                datasets: [
                  {
                    label: "Chats",
                    data: data.charts.peakDays.map((d: any) => d.chats),
                    backgroundColor: "rgba(255, 107, 53, 0.8)",
                  },
                  {
                    label: "Calls",
                    data: data.charts.peakDays.map((d: any) => d.calls),
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                  },
                ],
              }}
              title="Peak Days Analysis"
              height={350}
            />
          )}
        </div>

        {/* Status Breakdown & Duration */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chat Status */}
          {!loading && data?.statusBreakdown.chat && (
            <PieChart
              data={{
                labels: data.statusBreakdown.chat.map((s: any) => s.status),
                data: data.statusBreakdown.chat.map((s: any) => s.count),
              }}
              title="Chat Status Distribution"
              height={350}
            />
          )}

          {/* Call Status */}
          {!loading && data?.statusBreakdown.call && (
            <PieChart
              data={{
                labels: data.statusBreakdown.call.map((s: any) => s.status),
                data: data.statusBreakdown.call.map((s: any) => s.count),
              }}
              title="Call Status Distribution"
              height={350}
            />
          )}
        </div>

        {/* Duration Analysis */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Average Duration Analysis
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chat Duration
                </span>
                <span className="text-2xl font-bold text-[#FF6B35]">
                  {data?.duration.avgChatDuration.toFixed(1) || 0} min
                </span>
              </div>
              <div className="space-y-2">
                {data?.duration.distribution &&
                  Object.entries(data.duration.distribution).map(([range, values]: [string, any]) => (
                    <div key={range}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{range}</span>
                        <span className="text-gray-900 dark:text-white">{values.chats}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-[#FF6B35] h-2 rounded-full"
                          style={{
                            width: `${
                              ((values.chats /
                                Object.values(data.duration.distribution).reduce(
                                  (sum: number, v: any) => sum + v.chats,
                                  0
                                )) *
                                100) || 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Call Duration
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {data?.duration.avgCallDuration.toFixed(1) || 0} min
                </span>
              </div>
              <div className="space-y-2">
                {data?.duration.distribution &&
                  Object.entries(data.duration.distribution).map(([range, values]: [string, any]) => (
                    <div key={range}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{range}</span>
                        <span className="text-gray-900 dark:text-white">{values.calls}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              ((values.calls /
                                Object.values(data.duration.distribution).reduce(
                                  (sum: number, v: any) => sum + v.calls,
                                  0
                                )) *
                                100) || 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue from Consultations */}
        {!loading && data?.revenue && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Revenue from Consultations
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {data.revenue.map((item: any) => (
                <div key={item.type} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                    {item.type} Revenue
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}