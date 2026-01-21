// ===================================
// FILE: components/requests/GroupPerformanceCard.tsx
// ===================================

"use client";

import { GroupPerformance } from "@/lib/requests/types";
import { Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface GroupPerformanceCardProps {
  group: GroupPerformance;
}

export function GroupPerformanceCard({ group }: GroupPerformanceCardProps) {
  const getProgressColor = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate >= 80) return "bg-green-500";
    if (numRate >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-xl flex items-center justify-center text-white">
          <Users className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 dark:text-white">
            {group.groupName || `Group ${group.groupId}`}
          </h3>
          <p className="text-xs text-gray-500">Performance Overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Assigned</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {group.assigned.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {group.completed.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-[#FF6B35]" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Accepted</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {group.accepted.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Timeout</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {group.timeout.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Performance Bars */}
      <div className="space-y-4">
        {/* Acceptance Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Acceptance Rate
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {group.acceptanceRate}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${group.acceptanceRate}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full ${getProgressColor(group.acceptanceRate)}`}
            />
          </div>
        </div>

        {/* Completion Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Completion Rate
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {group.completionRate}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${group.completionRate}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className={`h-full ${getProgressColor(group.completionRate)}`}
            />
          </div>
        </div>

        {/* Timeout Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Timeout Rate
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {group.timeoutRate}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${group.timeoutRate}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-orange-500"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}