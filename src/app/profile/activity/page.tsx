"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Monitor,
  Smartphone,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  id: string;
  ipAddress: string;
  userAgent: string;
  method: string;
  success: boolean;
  created_at: string;
}

export default function ActivityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    const profilePromise = !profile
      ? fetch("/api/landing/profile")
      : Promise.resolve(null);
    const activityPromise = fetch(
      `/api/landing/profile/activity?page=${page}&limit=10`,
    );

    const [profileRes, activityRes] = await Promise.all([
      profilePromise,
      activityPromise,
    ]);

    if (profileRes) {
      const profileData = await profileRes.json();
      if (profileData.success) setProfile(profileData.data);
    }

    const activityData = await activityRes.json();
    if (activityData.success) {
      setLogs(activityData.data.logs);
      setPagination(activityData.data.pagination);
    }
    setLoading(false);
  };

  const getDeviceIcon = (ua: string) => {
    if (ua.toLowerCase().includes("mobile"))
      return <Smartphone className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  if (!profile) return null;

  return (
    <div className="w-full space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-start gap-4">
        <Link
          href="/profile"
          className="mt-1 rounded-xl border border-gray-100 bg-white p-2.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-white/10 dark:bg-[#111] dark:text-gray-200 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            Login Activity
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 md:text-base">
            Details of your activities
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-20 dark:border-white/5 dark:bg-[#111]">
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-[#FF6B35]" />
            <p className="text-sm text-gray-500">Loading activity log...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white px-4 py-20 text-center dark:border-white/5 dark:bg-[#111]">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 dark:bg-white/5">
              <Shield className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
              No Activity Recorded
            </h3>
            <p className="text-gray-500">
              Security logs will appear here when you login.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white dark:border-white/5 dark:bg-[#111]">
              <div className="divide-y divide-gray-100 dark:divide-white/5">
                {logs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
                          log.success
                            ? "bg-green-50 text-green-600 dark:bg-green-900/10 dark:text-green-400"
                            : "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
                        }`}
                      >
                        {getDeviceIcon(log.userAgent)}
                      </div>
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {log.success
                              ? "Successful Login"
                              : "Failed Login Attempt"}
                          </span>
                          {log.success ? (
                            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            IP: {log.ipAddress}
                          </div>
                          <div className="hidden sm:block">•</div>
                          <div className="max-w-[200px] truncate">
                            {log.method}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-400 dark:bg-white/5 sm:self-center">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(log.created_at), "MMM d, h:mm a")}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#111] dark:hover:bg-white/5"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-white/10 dark:bg-[#111] dark:hover:bg-white/5"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
