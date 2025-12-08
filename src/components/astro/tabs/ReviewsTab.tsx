"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";

export function ReviewsTab({ astrologerId }: { astrologerId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [astrologerId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}/reviews`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
        setStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
      {/* Stats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reviews</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Average: <span className="font-semibold text-[#FF6B35]">{stats.averageRating || "0"}</span> ⭐ ({stats.totalReviews || 0} reviews)
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      {stats.ratingDistribution && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{rating}⭐</span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF6B35]"
                    style={{
                      width: `${((stats.ratingDistribution[rating] || 0) / stats.totalReviews) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                  {stats.ratingDistribution[rating] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Reviews</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start gap-3">
                <img
                  src={avatar(review.user?.profile)}
                  alt={review.user?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {review.user?.name || "Anonymous"}
                    </h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{review.review}</p>
                  {review.reply && (
                    <div className="mt-2 pl-3 border-l-2 border-[#FF6B35] bg-white/60 dark:bg-gray-800/60 p-2 rounded">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-semibold text-[#FF6B35]">Reply:</span>
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">{review.reply}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}