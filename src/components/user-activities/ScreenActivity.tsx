"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, Calendar, TrendingUp, Activity, AlertCircle } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { Input } from "@/components/adminUI/Input";
import moment from "moment";

interface ScreenActivityProps {
  userId: string;
}

export function ScreenActivity({ userId }: ScreenActivityProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(moment().format("DD-MM-YYYY"));
  
  // Ref to store the abort controller so we can cancel requests if user clicks fast
  const abortControllerRef = useRef<AbortController | null>(null);
  const addToast = useToast();

  useEffect(() => {
    fetchScreens();

    // Cleanup: cancel request if component unmounts or dependency changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedDate]);

  const fetchScreens = async () => {
    // 1. Cancel previous request if exists to SAVE QUOTA
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(
        `/api/user-activities/${userId}/screens?date=${selectedDate}`, 
        { signal: abortControllerRef.current.signal }
      );

      // 2. Handle Quota Exceeded specifically
      if (res.status === 429) {
        const errData = await res.json();
        setErrorMsg("System busy (Quota Exceeded). Please wait 1 minute.");
        addToast("warning", "System Busy", "Too many requests. Please wait a moment.");
        setLoading(false);
        return;
      }

      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        // Handle API logic errors
        addToast("error", "Error", result.error || "Failed to load screen activity");
        setErrorMsg(result.error || "Failed to load data");
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        // Request cancelled intentionally, do nothing
        return;
      }
      console.error(error);
      addToast("error", "Error", "Network connection failed");
      setErrorMsg("Network error occurred");
    } finally {
      // Only stop loading if we haven't aborted
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (!dateValue) return;
    const formattedDate = moment(dateValue).format("DD-MM-YYYY");
    setSelectedDate(formattedDate);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State UI
  if (errorMsg && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-600 dark:text-gray-400 space-y-4">
        <AlertCircle className="w-10 h-10 text-orange-500" />
        <p>{errorMsg}</p>
        <button 
          onClick={fetchScreens}
          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">No data available</div>;

  // 4. Safe access for analytics
  const topScreens = data.analytics?.topScreens || [];
  const maxCount = Math.max(...topScreens.map((s: any) => s.count), 1);

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FF6B35]" />
            Select Date
          </h3>
          <Input
            type="date"
            value={moment(selectedDate, "DD-MM-YYYY").format("YYYY-MM-DD")}
            onChange={handleDateChange}
            className="w-auto"
          />
        </div>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Activities</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.activities?.total || 0}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Unique Screens</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.analytics?.uniqueScreens || 0}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Session Time</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.analytics?.sessionDurationMinutes || 0}m
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Shown</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.activities?.shown || 0}</p>
        </motion.div>
      </div>

      {/* Top Screens */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
          Most Visited Screens
        </h3>

        <div className="space-y-3">
          {topScreens.length > 0 ? (
            topScreens.map((screen: any, i: number) => (
              <motion.div
                key={screen.screen}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-xs font-bold text-gray-400 w-8">#{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {screen.screen}
                    </span>
                    <span className="text-sm font-bold text-[#FF6B35]">{screen.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(screen.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No screen data</p>
          )}
        </div>
      </motion.div>

      {/* Recent Activities */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#FF6B35]" />
          Recent Screen Navigation
        </h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {data.activities?.recent?.length > 0 ? (
            data.activities.recent.map((activity: any, i: number) => (
              <motion.div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#FF6B35] rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.screenName}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : "N/A"}
                </span>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No activities found</p>
          )}
        </div>
      </motion.div>

      {/* Weekly Trend */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#FF6B35]" />
          Last 7 Days Activity
        </h3>

        <div className="space-y-3">
          {data.weeklyTrend?.length > 0 ? (
            data.weeklyTrend.map((day: any, i: number) => {
              const maxWeekCount = Math.max(...data.weeklyTrend.map((d: any) => d.count), 1);
              return (
                <motion.div
                  key={day.date}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-24">{day.date}</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.count / maxWeekCount) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                    {day.count}
                  </span>
                </motion.div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No weekly data</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}