// ===================================
// FILE: lib/requests/utils.ts
// ===================================

import { PendingRequest, AssignmentMetadata } from "./types";

/**
 * Format time remaining in human-readable format
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "Expired";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format date/time
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return "N/A";

  const d = typeof date === "string" ? new Date(date) : date;

  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | null): string {
  if (!date) return "N/A";

  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffMins > 0) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  return "Just now";
}

/**
 * Get status color for badges
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  return statusColors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
}

/**
 * Get urgency level based on time remaining
 */
export function getUrgencyLevel(timeRemaining: number): "high" | "medium" | "low" {
  if (timeRemaining < 60) return "high"; // Less than 1 minute
  if (timeRemaining < 120) return "medium"; // Less than 2 minutes
  return "low";
}

/**
 * Get urgency color
 */
export function getUrgencyColor(timeRemaining: number): string {
  const level = getUrgencyLevel(timeRemaining);

  const colors = {
    high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-900/50",
    medium: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-900/50",
    low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-900/50",
  };

  return colors[level];
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): string {
  if (total === 0) return "0.00";
  return ((value / total) * 100).toFixed(2);
}

/**
 * Format assignment history for display
 */
export function formatAssignmentHistory(metadata: AssignmentMetadata | null): string {
  if (!metadata || !metadata.assignment_history.length) {
    return "No assignment history";
  }

  const latest = metadata.assignment_history[metadata.assignment_history.length - 1];

  return `Attempt ${metadata.attempt} - ${latest.status} - Group ${latest.group_id || "Broadcast"}`;
}

/**
 * Sort requests by urgency (time remaining)
 */
export function sortByUrgency(requests: PendingRequest[]): PendingRequest[] {
  return [...requests].sort((a, b) => a.timeRemaining - b.timeRemaining);
}

/**
 * Export to CSV
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format currency (INR)
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Get type badge color
 */
export function getTypeBadgeColor(type: "call" | "chat"): string {
  return type === "call"
    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Generate pagination pages array
 */
export function getPaginationPages(
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return Array.from({ length: maxVisible }, (_, i) => i + 1);
  }

  if (currentPage >= totalPages - 2) {
    return Array.from({ length: maxVisible }, (_, i) => totalPages - maxVisible + i + 1);
  }

  return Array.from({ length: maxVisible }, (_, i) => currentPage - 2 + i);
}