"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import { DateFilterButtons } from "@/components/adminUI/DateFilterButtons";
import { LineChart } from "@/components/dashboard/charts/LineChart";
import { PieChart } from "@/components/dashboard/charts/PieChart";
import { BarChart } from "@/components/dashboard/charts/BarChart";
import { Users, TrendingUp, Wallet, UserCheck, Target, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";
import { useRouter } from "next/navigation";

export default function UsersDashboardPage() {
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

      const response = await fetch(`/api/dashboard/users?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch users data:", error);
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
          title="User Analytics"
          subtitle="Monitor user growth, engagement, and behavior patterns"
          badge={{ text: "USERS", variant: "blue" }}
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
            title="New Users"
            value={data?.summary.newUsers || 0}
            icon={<Users className="w-5 h-5" />}
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
            title="Total Active Users"
            value={data?.summary.totalActiveUsers || 0}
            icon={<UserCheck className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Current Active"
            value={data?.summary.currentActiveUsers || 0}
            icon={<TrendingUp className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Retention Rate"
            value={`${data?.summary.retentionRate.toFixed(1) || 0}%`}
            icon={<Target className="w-5 h-5" />}
            loading={loading}
          />
          <StatCard
            title="Avg. Consultations"
            value={data?.engagement.avgConsultationsPerUser.toFixed(1) || 0}
            icon={<TrendingUp className="w-5 h-5" />}
            loading={loading}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Registration Trend */}
          {!loading && data?.charts.dailyRegistrations && (
            <LineChart
              data={{
                labels: data.charts.dailyRegistrations.map((item: any) =>
                  new Date(item.date).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })
                ),
                datasets: [
                  {
                    label: "New Users",
                    data: data.charts.dailyRegistrations.map((item: any) => item.count),
                  },
                ],
              }}
              title="Daily User Registration Trend"
              height={350}
            />
          )}

          {/* Gender Distribution */}
          {!loading && data?.demographics.gender && (
            <PieChart
              data={{
                labels: data.demographics.gender.map((g: any) => g.gender),
                data: data.demographics.gender.map((g: any) => g.count),
              }}
              title="Gender Distribution"
              height={350}
            />
          )}
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Age Groups */}
          {!loading && data?.demographics.ageGroups && (
            <BarChart
              data={{
                labels: Object.keys(data.demographics.ageGroups),
                datasets: [
                  {
                    label: "Users",
                    data: Object.values(data.demographics.ageGroups),
                  },
                ],
              }}
              title="Age Distribution"
              height={350}
            />
          )}

          {/* Top Locations */}
          {!loading && data?.demographics.locations && (
            <BarChart
              data={{
                labels: data.demographics.locations.map((l: any) => l.location),
                datasets: [
                  {
                    label: "Users",
                    data: data.demographics.locations.map((l: any) => l.count),
                  },
                ],
              }}
              title="Top Locations"
              height={350}
              horizontal
            />
          )}
        </div>

        {/* Top Spenders & Funnel */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Spenders */}
          {!loading && data?.charts.topSpenders && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#FF6B35]" />
                Top Spending Users
              </h3>
              <div className="space-y-3">
                {data.charts.topSpenders.map((user: any, index: number) => (
                  <motion.div
                    key={user.userId.toString()}
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
                        src={avatar(user.profile)}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">{user.orderCount} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#FF6B35]">
                        {formatCurrency(user.totalSpent)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* User Lifecycle Funnel */}
          {!loading && data?.funnel && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FF6B35]" />
                User Lifecycle Funnel
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Registered", value: data.funnel.registered, color: "bg-blue-500" },
                  {
                    label: "First Consultation",
                    value: data.funnel.firstConsultation,
                    color: "bg-green-500",
                  },
                  { label: "Repeat User", value: data.funnel.repeatUser, color: "bg-orange-500" },
                  {
                    label: "Premium User",
                    value: data.funnel.premiumUser,
                    color: "bg-purple-500",
                  },
                ].map((stage, index) => {
                  const percentage =
                    data.funnel.registered > 0
                      ? ((stage.value / data.funnel.registered) * 100).toFixed(1)
                      : 0;
                  return (
                    <motion.div
                      key={stage.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {stage.label}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {stage.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`${stage.color} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Wallet & Engagement Stats */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Wallet Balance
            </h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data?.wallet.totalBalance || 0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Avg: {formatCurrency(data?.wallet.avgBalance || 0)}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Repeat Users
            </h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.engagement.repeatUsers || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Rate: {data?.engagement.repeatRate.toFixed(1) || 0}%
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Avg. Consultations
            </h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {data?.engagement.avgConsultationsPerUser.toFixed(1) || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Per user</div>
          </div>
        </div>
      </div>
    </div>
  );
}