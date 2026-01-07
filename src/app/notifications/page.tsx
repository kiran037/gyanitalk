// ============================================
// app/notifications/page.tsx
// ============================================
"use client";

import { useState, useEffect, useRef } from "react";
import LandingWrapper from "@/components/landing/LandingWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Clock, 
  MailOpen, 
  Inbox,
  CheckCircle2
} from "lucide-react";

// --- Utility: Relative Time ---
const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// --- Types ---
interface Notification {
  id: string;
  title: string;
  description: string;
  is_read: boolean;
  created_at: string;
}

type TabType = "today" | "week" | "earlier";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Ref to ensure we don't spam the mark-read API
  const hasMarkedReadRef = useRef(false);

  // --- Fetch Data ---
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tab: activeTab,
        limit: "50", 
      });

      const res = await fetch(`/api/landing/profile/notifications?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setNotifications(data.data.notifications);
        if (!hasMarkedReadRef.current) {
          setUnreadCount(data.data.unread_count);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeTab]);

  // --- Auto Mark Read Logic ---
  useEffect(() => {
    if (!loading && unreadCount > 0 && !hasMarkedReadRef.current) {
      hasMarkedReadRef.current = true;

      fetch("/api/landing/profile/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllOnOpen: true }),
      })
      .then(() => {
        setUnreadCount(0); 
      })
      .catch((e) => console.error("Auto-read error", e));
    }
  }, [loading, unreadCount]);

  return (
    <LandingWrapper>
      <div className="relative min-h-screen bg-[#FAFAFA] pb-20 dark:bg-[#050505]">
        
        {/* Background Decor */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
           <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[100px]" />
           <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl px-4 pt-24 sm:px-6 md:pt-32 lg:px-8">
          
          {/* === HEADER SECTION === */}
          <div className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
                Activity
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                You have <span className="font-bold text-[#FF6B35]">{unreadCount}</span> new updates.
              </p>
            </div>

            {/* === CLEAN TEXT TABS === */}
            <div className="w-full md:w-auto">
              <div className="flex w-full items-center rounded-full bg-gray-100 p-1 dark:bg-white/5 md:w-auto">
                {[
                  { id: "today", label: "Today" },
                  { id: "week", label: "This Week" },
                  { id: "earlier", label: "All" },
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`relative flex-1 rounded-full px-6 py-2 text-sm font-semibold transition-all md:flex-initial ${
                        isActive
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute inset-0 rounded-full bg-white shadow-sm dark:bg-[#222]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* === LIST SECTION === */}
          <div className="min-h-[400px]">
            {loading ? (
              // Skeletons
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#111]"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1 space-y-3 py-1">
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              // Empty State
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white/50 py-24 text-center dark:border-gray-800 dark:bg-white/5"
              >
                <div className="mb-4 rounded-full bg-gray-50 p-5 dark:bg-gray-800">
                   <Inbox className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  No notifications
                </h3>
                <p className="mt-1 max-w-xs text-sm text-gray-500">
                  {activeTab === 'today' 
                    ? "It's quiet here today." 
                    : activeTab === 'week' 
                    ? "Nothing new this week."
                    : "No older history found."}
                </p>
              </motion.div>
            ) : (
              // List
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {notifications.map((notif, index) => (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className={`group relative flex gap-4 overflow-hidden rounded-2xl border p-4 transition-all md:p-5
                        ${
                          !notif.is_read
                            ? "border-orange-100 bg-white shadow-md shadow-orange-500/5 dark:border-orange-900/30 dark:bg-[#161616]"
                            : "border-transparent bg-white hover:border-gray-200 hover:shadow-sm dark:border-transparent dark:bg-[#111] dark:hover:border-gray-700"
                        }
                      `}
                    >
                      {/* Unread Indicator Line */}
                      {!notif.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6B35]" />
                      )}

                      {/* Icon Container */}
                      <div className="relative shrink-0">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border shadow-sm md:h-12 md:w-12
                          ${!notif.is_read 
                            ? "border-orange-100 bg-orange-50 text-[#FF6B35] dark:border-orange-900/40 dark:bg-orange-900/20" 
                            : "border-gray-100 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900"
                          }`}
                        >
                          {notif.is_read ? <MailOpen className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                        </div>
                        {/* Pulse Dot */}
                        {!notif.is_read && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#FF6B35]"></span>
                          </span>
                        )}
                      </div>

                      {/* Text Content */}
                      <div className="flex flex-1 flex-col justify-center">
                        <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                          <h4 className={`text-sm font-bold leading-snug md:text-base ${!notif.is_read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                            {notif.title}
                          </h4>
                          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-gray-400 md:text-xs">
                            <Clock className="h-3 w-3" />
                            {timeAgo(notif.created_at)}
                          </span>
                        </div>
                        
                        <p className={`mt-1 text-xs leading-relaxed md:text-sm ${!notif.is_read ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-500"}`}>
                          {notif.description}
                        </p>
                      </div>

                      {/* Read Status Check (Visual) */}
                      {!notif.is_read && (
                        <div className="hidden items-center self-center pl-2 md:flex">
                          <div className="rounded-full bg-orange-50 p-2 text-[#FF6B35] dark:bg-orange-900/20">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>

          {/* End of List Message */}
          {!loading && notifications.length > 0 && (
            <div className="mt-12 flex justify-center">
              <span className="text-xs font-medium text-gray-400">
                End of {activeTab} updates
              </span>
            </div>
          )}

        </div>
      </div>
    </LandingWrapper>
  );
}