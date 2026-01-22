// ===================================
// FILE: components/requests/RequestStatusBadge.tsx
// ===================================

"use client";

import { getStatusColor } from "@/lib/requests/utils";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface RequestStatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export function RequestStatusBadge({ status, size = "md" }: RequestStatusBadgeProps) {
  const icons = {
    Pending: Clock,
    Confirmed: AlertCircle,
    Completed: CheckCircle,
    Rejected: XCircle,
  };

  const Icon = icons[status as keyof typeof icons] || Clock;

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${getStatusColor(
        status
      )} ${sizes[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {status}
    </motion.span>
  );
}