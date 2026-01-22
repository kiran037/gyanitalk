// ===================================
// FILE: components/requests/GroupPerformanceTable.tsx
// ===================================

"use client";

import { GroupPerformance } from "@/lib/requests/types";
import { ArrowUpDown, Users } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface GroupPerformanceTableProps {
  groups: GroupPerformance[];
  loading: boolean;
}

type SortField = "assigned" | "accepted" | "completed" | "acceptanceRate" | "completionRate";
type SortDirection = "asc" | "desc";

export function GroupPerformanceTable({ groups, loading }: GroupPerformanceTableProps) {
  const [sortField, setSortField] = useState<SortField>("assigned");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedGroups = [...groups].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    if (sortField === "acceptanceRate" || sortField === "completionRate") {
      aValue = parseFloat(a[sortField]);
      bValue = parseFloat(b[sortField]);
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }

    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  const getPerformanceColor = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate >= 80) return "text-green-600 dark:text-green-400";
    if (numRate >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="animate-pulse p-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          ))}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Group Data
        </h3>
        <p className="text-gray-500">No performance data available for groups.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Group Name
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:text-[#FF6B35]"
                onClick={() => handleSort("assigned")}
              >
                <div className="flex items-center gap-2">
                  Assigned
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:text-[#FF6B35]"
                onClick={() => handleSort("accepted")}
              >
                <div className="flex items-center gap-2">
                  Accepted
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:text-[#FF6B35]"
                onClick={() => handleSort("completed")}
              >
                <div className="flex items-center gap-2">
                  Completed
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:text-[#FF6B35]"
                onClick={() => handleSort("acceptanceRate")}
              >
                <div className="flex items-center gap-2">
                  Acceptance Rate
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase cursor-pointer hover:text-[#FF6B35]"
                onClick={() => handleSort("completionRate")}
              >
                <div className="flex items-center gap-2">
                  Completion Rate
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                Timeout
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedGroups.map((group, index) => (
              <motion.tr
                key={group.groupId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {group.groupName?.[0] || "G"}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {group.groupName || `Group ${group.groupId}`}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {group.assigned.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {group.accepted.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {group.completed.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${getPerformanceColor(group.acceptanceRate)}`}>
                    {group.acceptanceRate}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${getPerformanceColor(group.completionRate)}`}>
                    {group.completionRate}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {group.timeout.toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}