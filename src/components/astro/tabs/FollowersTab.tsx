"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import { Users, Calendar } from "lucide-react";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";

export function FollowersTab({ astrologerId }: { astrologerId: string }) {
  const addToast = useToast();
  const [followers, setFollowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowers();
  }, [astrologerId]);

  const fetchFollowers = async () => {
    try {
      const response = await fetch(`/api/astrologers/${astrologerId}/followers`);
      const data = await response.json();
      if (data.success) setFollowers(data.data);
    } catch (error) {
      addToast("error", "Error", "Failed to fetch followers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Followers ({followers.length})
      </h2>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : followers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Followers</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followers.map((follower, index) => (
            <motion.div
              key={follower.id}
              className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={avatar(follower.user?.profile)}
                  alt={follower.user?.name || "User"}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {follower.user?.name || "Unknown"}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(follower.created_at).toLocaleDateString()}
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