// ===================================
// FILE: components/notifications/NotificationDetails.tsx
// ===================================
"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Eye,
  EyeOff,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface NotificationDetailsProps {
  notificationId: string;
}

interface NotificationDetail {
  id: string;
  title: string;
  description: string;
  created_at: string;
  stats: {
    totalSent: number;
    readCount: number;
    unreadCount: number;
    readRate: string;
  };
  userNotifications: Array<{
    id: string;
    userId: string;
    is_read: boolean;
    created_at: string;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }>;
}

export default function NotificationDetails({
  notificationId,
}: NotificationDetailsProps) {
  const [notification, setNotification] = useState<NotificationDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [notificationId]);

  const fetchDetails = async () => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`);
      const data = await response.json();

      if (data.success) {
        setNotification(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          Failed to load notification details
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {notification.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {notification.description}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Sent on {new Date(notification.created_at).toLocaleString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Total Sent</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {notification.stats.totalSent.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">Read</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {notification.stats.readCount.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
            <EyeOff className="w-4 h-4" />
            <span className="text-xs font-medium">Unread</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {notification.stats.unreadCount.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-[#FF6B35] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Read Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {notification.stats.readRate}
          </p>
        </div>
      </div>

      {/* Recent Recipients */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Recent Recipients ({notification.userNotifications.length} shown)
        </h4>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {notification.userNotifications.slice(0, 20).map((un) => (
            <div
              key={un.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    un.is_read ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {un.user.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {un.user.email || `User ID: ${un.userId}`}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  un.is_read
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-400"
                }`}
              >
                {un.is_read ? "Read" : "Unread"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
