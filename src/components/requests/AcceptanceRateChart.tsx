// ===================================
// FILE: components/requests/AcceptanceRateChart.tsx
// ===================================

"use client";

import { DailyTrend } from "@/lib/requests/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

interface AcceptanceRateChartProps {
  data: DailyTrend[];
  type: "call" | "chat" | "combined";
  loading?: boolean;
}

export function AcceptanceRateChart({ data, type, loading = false }: AcceptanceRateChartProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
        <p className="text-gray-500">No data available for the selected period</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    acceptanceRate: parseFloat(item.acceptanceRate),
    completionRate: parseFloat(item.completionRate),
    total: item.total,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {type === "call" ? "Call" : type === "chat" ? "Chat" : "Combined"} Acceptance Rate Trend
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Daily acceptance and completion rates over time
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            style={{ fontSize: "12px" }}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
            labelStyle={{ fontWeight: "bold", marginBottom: "8px" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="acceptanceRate"
            stroke="#FF6B35"
            strokeWidth={3}
            name="Acceptance Rate (%)"
            dot={{ fill: "#FF6B35", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="completionRate"
            stroke="#10b981"
            strokeWidth={3}
            name="Completion Rate (%)"
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Avg Acceptance</p>
          <p className="text-lg font-bold text-[#FF6B35]">
            {(chartData.reduce((sum, item) => sum + item.acceptanceRate, 0) / chartData.length).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Avg Completion</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {(chartData.reduce((sum, item) => sum + item.completionRate, 0) / chartData.length).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Total Requests</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {chartData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}