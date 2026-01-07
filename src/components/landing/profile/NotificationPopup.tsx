"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Clock, Inbox } from "lucide-react";
import Link from "next/link";

type TabType = "today" | "week" | "earlier";

interface Notification {
  id: string;
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
}

// Helper: Format Time
const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function NotificationPopup({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void 
}) {
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Track IDs marked in this session to avoid spamming API
  const markedIdsRef = useRef<Set<string>>(new Set());

  // 1. Fetch when Open or Tab Changes
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(activeTab);
    } else {
      markedIdsRef.current.clear(); // Reset tracking when closed
    }
  }, [isOpen, activeTab]);

  // 2. Auto-Mark Read Logic (Instagram Style)
  useEffect(() => {
    if (loading || notifications.length === 0 || !isOpen) return;

    const unreadIds = notifications
      .filter((n) => !n.is_read && !markedIdsRef.current.has(n.id))
      .map((n) => n.id);

    if (unreadIds.length > 0) {
      unreadIds.forEach((id) => markedIdsRef.current.add(id));

      fetch("/api/landing/profile/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds: unreadIds }),
      })
      .then(() => {
        // Decrease global badge count optimistically
        setUnreadCount(prev => Math.max(0, prev - unreadIds.length));
      })
      .catch((e) => console.error("Auto-read error", e));
    }
  }, [notifications, isOpen, loading]);

  const fetchNotifications = async (tab: TabType) => {
    setLoading(true);
    try {
      // ✅ Restored TAB param
      const res = await fetch(`/api/landing/profile/notifications?tab=${tab}&limit=15`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unread_count);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop" // ✅ Explicit Key
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        />
      )}

      {isOpen && (
        <motion.div
          key="popup-content" // ✅ Explicit Key
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed right-4 top-20 z-50 flex max-h-[80vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-[#111] dark:ring-white/10 sm:right-6 md:w-[400px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-5 py-4 backdrop-blur-md dark:border-white/5 dark:bg-[#111]/80">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6B35] px-1.5 text-[10px] font-bold text-white shadow-sm shadow-orange-500/20">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ✅ Tabs Section Restored */}
          <div className="flex border-b border-gray-100 bg-gray-50/80 p-1 dark:border-white/5 dark:bg-white/5">
            {(["today", "week", "earlier"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabPopup"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === "today" ? "Today" : tab === "week" ? "This Week" : "Earlier"}
                </span>
              </button>
            ))}
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain bg-[#FAFAFA] dark:bg-black/20 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-gray-200 border-t-[#FF6B35]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-white/5">
                  <Inbox className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">No notifications</p>
                <p className="text-xs text-gray-500">
                  {activeTab === "today" ? "Nothing new today" : "No history here"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`group relative p-4 transition-all hover:bg-gray-50 dark:hover:bg-white/5 ${
                      !notif.is_read ? "bg-white dark:bg-[#111]" : "bg-[#FAFAFA] dark:bg-black/40"
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="pt-1">
                        {notif.is_read ? (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/5">
                            <Bell className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-[#FF6B35] dark:bg-orange-500/10">
                            <div className="h-2 w-2 rounded-full bg-[#FF6B35] animate-pulse" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-semibold leading-tight ${
                            !notif.is_read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"
                          }`}>
                            {notif.title}
                          </h4>
                          <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-gray-400">
                            {formatTime(notif.created_at)}
                          </span>
                        </div>
                        
                        <p className={`text-xs leading-relaxed ${
                          !notif.is_read ? "text-gray-600 dark:text-gray-300" : "text-gray-500 dark:text-gray-600"
                        }`}>
                          {notif.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Unread Indicator Bar */}
                    {!notif.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF6B35]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 bg-white p-3 dark:border-white/5 dark:bg-[#111]">
            <Link
              href="/notifications"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              View Full History
            </Link>
          </div>
        </motion.div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px; /* Hidden but functional */
        }
      `}</style>
    </AnimatePresence>
  );
}