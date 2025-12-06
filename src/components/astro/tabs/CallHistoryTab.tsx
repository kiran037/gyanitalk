"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import { Button } from "@/components/adminUI/Button";
import { Phone, Calendar, Clock, Video, Filter } from "lucide-react";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";

export function CallHistoryTab({ astrologerId }: { astrologerId: string }) {
  const addToast = useToast();
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ totalEarnings: 0 });

  useEffect(() => {
    fetchCallHistory();
  }, [astrologerId, pagination.page]);

  const fetchCallHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/astrologers/${astrologerId}/call-history?page=${pagination.page}&limit=${pagination.limit}`
      );
      const data = await response.json();

      if (data.success) {
        setCalls(data.data);
        setPagination(data.pagination);
        setStats(data.stats);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch call history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Call History
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Earnings: <span className="font-semibold text-[#FF6B35]">₹{stats.totalEarnings}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : calls.length === 0 ? (
        <div className="text-center py-12">
          <Phone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Call History
          </h3>
        </div>
      ) : (
        <div className="space-y-4">
          {calls.map((call, index) => (
            <motion.div
              key={call.id}
              className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={avatar(call.user?.profile)}
                    alt={call.user?.name || "User"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {call.user?.name || "Unknown User"}
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(call.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {call.call_duration || "0"} min
                      </div>
                      {call.call_type === 1 && (
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          Video
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{call.deductionFromAstrologer || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Rate: ₹{call.callRate}/min
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}