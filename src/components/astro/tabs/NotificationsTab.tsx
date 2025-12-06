"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";

export function NotificationsTab({ astrologerId }: { astrologerId: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [astrologerId]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}/notifications`);
      const data = await response.json();
      if (data.success) setNotifications(data.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notifications</h2>
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Notifications</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, index) => (
            <motion.div
              key={notif.id}
              className={`p-4 rounded-xl ${notif.is_read ? "bg-gray-50 dark:bg-gray-900/50" : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{notif.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{notif.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(notif.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}