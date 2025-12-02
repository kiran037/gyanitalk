
// ===================================
// FILE: components/notifications/NotificationStats.tsx
// ===================================
"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Send, Eye, Bell, Calendar } from "lucide-react";

interface StatsData {
  overview: {
    totalNotifications: number;
    totalSent: number;
    totalRead: number;
    totalUnread: number;
    readRate: string;
  };
  typeBreakdown: Array<{
    type: number;
    count: number;
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    created_at: string;
    sent: number;
    read: number;
  }>;
}

export default function NotificationStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchStats();
  }, [days]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/notifications/stats?days=${days}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels: Record<number, string> = {
    0: "System / General",
    1: "Chat / Call",
    2: "Promotional",
    3: "Order Updates",
    4: "Wallet Updates",
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading...</div>;
  }

  if (!stats) {
    return <div>Failed to load statistics</div>;
  }

  return (
    <div className="space-y-6">
      {/* Time Period Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-600">Total Sent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.overview.totalSent.toLocaleString()}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-600">Read Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.overview.readRate}
          </p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-600">Total Read</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.overview.totalRead.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-600">Unread</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.overview.totalUnread.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Type Breakdown */}
      {stats.typeBreakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            By Type
          </h4>
          <div className="space-y-2">
            {stats.typeBreakdown.map((item) => (
              <div
                key={item.type}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {typeLabels[item.type] || `Type ${item.type}`}
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      {stats.recentNotifications.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Recent Notifications
          </h4>
          <div className="space-y-2">
            {stats.recentNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {notif.title}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                  <span>
                    {notif.read} / {notif.sent} read
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
