"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LifeBuoy, Star, MessageCircle, Clock } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

interface SupportHistoryProps {
  userId: string;
}

export function SupportHistory({ userId }: SupportHistoryProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    fetchSupport();
  }, [userId]);

  const fetchSupport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-activities/${userId}/support`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        addToast("error", "Error", "Failed to load support data");
      }
    } catch (error) {
      console.error(error);
      addToast("error", "Error", "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">No data available</div>;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Tickets</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.tickets.total}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Rating</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.ticketReviews.averageRating.toFixed(1)}
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reviews</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.ticketReviews.total}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Response Time</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.tickets.averageResponseTimeHours 
              ? `${data.tickets.averageResponseTimeHours.toFixed(1)}h`
              : "N/A"}
          </p>
        </motion.div>
      </div>

      {/* Tickets by Status */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-[#FF6B35]" />
          Tickets by Status
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {data.tickets.byStatus.map((status: any, i: number) => (
            <motion.div
              key={status.status}
              className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-2 ${getStatusColor(status.status)}`}>
                {status.status || "Unknown"}
              </span>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.count}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Tickets */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Tickets</h3>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {data.tickets.recent.length > 0 ? (
            data.tickets.recent.map((ticket: any, i: number) => (
              <motion.div
                key={ticket.id}
                className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">#{ticket.ticketNumber}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {ticket.subject}
                    </h4>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {ticket.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Category: <span className="font-medium">{ticket.category || "General"}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">
                      Created: {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    {ticket.updatedAt && (
                      <span className="text-gray-400">
                        Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No tickets found
            </p>
          )}
        </div>
      </motion.div>

      {/* Ticket Reviews & App Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Reviews */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Ticket Reviews
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.ticketReviews.recent.length > 0 ? (
              data.ticketReviews.recent.map((review: any, i: number) => (
                <motion.div
                  key={review.id}
                  className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-gray-500">#{review.ticketNumber}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3 h-3 ${
                            idx < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                    {review.subject}
                  </p>
                  {review.review && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {review.review}
                    </p>
                  )}
                  <span className="text-xs text-gray-400 mt-2 block">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No reviews yet
              </p>
            )}
          </div>
        </motion.div>

        {/* App Reviews */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            App Reviews
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.appReviews.recent.length > 0 ? (
              data.appReviews.recent.map((review: any, i: number) => (
                <motion.div
                  key={review.id}
                  className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {review.review}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No app reviews yet
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}