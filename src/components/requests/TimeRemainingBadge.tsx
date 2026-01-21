// ===================================
// FILE: components/requests/TimeRemainingBadge.tsx
// ===================================

"use client";

import { useCountdown } from "@/lib/requests/hooks";
import { formatTimeRemaining, getUrgencyColor } from "@/lib/requests/utils";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

interface TimeRemainingBadgeProps {
  timeRemaining: number; // seconds
  label?: string;
  showIcon?: boolean;
}

export function TimeRemainingBadge({
  timeRemaining: initialTime,
  label = "Time Left",
  showIcon = true,
}: TimeRemainingBadgeProps) {
  const seconds = useCountdown(initialTime);
  const isExpired = seconds <= 0;
  const isUrgent = seconds < 60;

  return (
    <motion.div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${
        isExpired
          ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-300 dark:border-gray-700"
          : getUrgencyColor(seconds)
      }`}
      animate={
        isUrgent && !isExpired
          ? {
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 0 0 rgba(239, 68, 68, 0)",
                "0 0 0 4px rgba(239, 68, 68, 0.2)",
                "0 0 0 0 rgba(239, 68, 68, 0)",
              ],
            }
          : {}
      }
      transition={{ duration: 1, repeat: isUrgent && !isExpired ? Infinity : 0 }}
    >
      {showIcon && (
        <motion.div
          animate={isUrgent && !isExpired ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: isUrgent && !isExpired ? Infinity : 0 }}
        >
          {isUrgent && !isExpired ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
        </motion.div>
      )}
      <div className="flex flex-col">
        <span className="text-xs opacity-75">{label}</span>
        <span className="font-bold">
          {isExpired ? "Expired" : formatTimeRemaining(seconds)}
        </span>
      </div>
    </motion.div>
  );
}