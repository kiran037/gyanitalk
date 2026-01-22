// ===================================
// FILE: components/requests/AssignmentHistoryTimeline.tsx
// ===================================

"use client";

import { AssignmentHistoryItem } from "@/lib/requests/types";
import { formatDateTime } from "@/lib/requests/utils";
import { Clock, CheckCircle, XCircle, AlertTriangle, Radio } from "lucide-react";
import { motion } from "framer-motion";

interface AssignmentHistoryTimelineProps {
  history: AssignmentHistoryItem[];
}

export function AssignmentHistoryTimeline({ history }: AssignmentHistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No assignment history yet</p>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: Clock,
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        label: "Pending",
      },
      accepted: {
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-100 dark:bg-green-900/30",
        label: "Accepted",
      },
      timeout: {
        icon: AlertTriangle,
        color: "text-orange-600 dark:text-orange-400",
        bg: "bg-orange-100 dark:bg-orange-900/30",
        label: "Timeout",
      },
      rejected: {
        icon: XCircle,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-100 dark:bg-red-900/30",
        label: "Rejected",
      },
    };

    return configs[status as keyof typeof configs] || configs.pending;
  };

  return (
    <div className="space-y-4">
      {history.map((item, index) => {
        const config = getStatusConfig(item.status);
        const Icon = config.icon;
        const isLast = index === history.length - 1;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
          >
            {/* Timeline Icon */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center ${config.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              {!isLast && (
                <div className="w-0.5 h-full min-h-12 bg-gray-200 dark:bg-gray-700 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {item.group_id ? `Group ${item.group_id}` : "Broadcast to All"}
                    </h4>
                    <p className={`text-sm font-medium ${config.color}`}>
                      {config.label}
                    </p>
                  </div>
                  {item.group_id === null && (
                    <Radio className="w-5 h-5 text-[#FF6B35]" />
                  )}
                </div>

                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                  <p>
                    <span className="font-medium">Assigned:</span>{" "}
                    {formatDateTime(item.assigned_at)}
                  </p>
                  {item.timeout_at && (
                    <p>
                      <span className="font-medium">Timeout:</span>{" "}
                      {formatDateTime(item.timeout_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}