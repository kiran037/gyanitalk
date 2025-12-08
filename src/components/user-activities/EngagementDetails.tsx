"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Ban, Star, Gift, Bell } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";

interface EngagementDetailsProps {
  userId: string;
}

export function EngagementDetails({ userId }: EngagementDetailsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    fetchEngagement();
  }, [userId]);

  const fetchEngagement = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-activities/${userId}/engagement`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        addToast("error", "Error", "Failed to load engagement data");
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
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">No data available</div>;

  return (
    <div className="space-y-6">
      {/* Following & Blocked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Following */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Following ({data.following.total})
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.following.astrologers.length > 0 ? (
              data.following.astrologers.map((astro: any, i: number) => (
                <motion.div
                  key={astro.id}
                  className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <img
                    src={avatar(astro.profileImage)}
                    alt={astro.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {astro.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {astro.primarySkill}
                    </p>
                    <p className="text-xs text-gray-400">
                      Followed {new Date(astro.followedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                Not following anyone yet
              </p>
            )}
          </div>
        </motion.div>

        {/* Blocked */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Blocked ({data.blocked.total})
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.blocked.astrologers.length > 0 ? (
              data.blocked.astrologers.map((astro: any, i: number) => (
                <motion.div
                  key={astro.id}
                  className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <img
                    src={avatar(astro.profileImage)}
                    alt={astro.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-red-200 dark:ring-red-900"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {astro.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {astro.reason}
                    </p>
                    <p className="text-xs text-gray-400">
                      Blocked {new Date(astro.blockedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No blocked astrologers
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Reviews & Gifts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Reviews ({data.reviews.total})
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.reviews.recent.length > 0 ? (
              data.reviews.recent.map((review: any, i: number) => (
                <motion.div
                  key={review.id}
                  className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <img
                      src={avatar(review.astrologer?.profileImage)}
                      alt={review.astrologer?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {review.astrologer?.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
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
                        <span className="text-xs text-gray-500 ml-1">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {review.review}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                    {review.isPublic && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No reviews yet
              </p>
            )}
          </div>
        </motion.div>

        {/* Gifts */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-500" />
              Gifts Sent ({data.gifts.total})
            </h3>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {data.gifts.recent.length > 0 ? (
              data.gifts.recent.map((gift: any, i: number) => (
                <motion.div
                  key={gift.id}
                  className="flex items-center gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <img
                    src={avatar(gift.giftImage)}
                    alt={gift.giftName}
                    className="w-12 h-12 rounded-lg object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {gift.giftName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      To: {gift.astrologer?.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(gift.sentAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-bold text-[#FF6B35]">
                        ₹{gift.amount}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No gifts sent yet
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Notifications */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Recent Notifications
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {data.notifications.unread} unread
          </span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {data.notifications.recent.length > 0 ? (
            data.notifications.recent.map((notif: any, i: number) => (
              <motion.div
                key={notif.id}
                className={`p-3 rounded-lg ${
                  notif.isRead
                    ? "bg-gray-50/50 dark:bg-gray-800/50"
                    : "bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {notif.description}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                  )}
                </div>
                <span className="text-xs text-gray-400 mt-2 block">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No notifications
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}