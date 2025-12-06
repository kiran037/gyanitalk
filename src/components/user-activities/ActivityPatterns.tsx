"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Calendar, Users, DollarSign, ShoppingBag } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

interface ActivityPatternsProps {
  userId: string;
}

export function ActivityPatterns({ userId }: ActivityPatternsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    fetchPatterns();
  }, [userId]);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-activities/${userId}/patterns`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        addToast("error", "Error", "Failed to load activity patterns");
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
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return <div className="text-center py-12 text-gray-600 dark:text-gray-400">No data available</div>;

  const maxActivity = Math.max(...data.weeklyPattern.map((d: any) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chats Trend */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Chat Trends
          </h3>
          <div className="space-y-2">
            {data.trends.chats.slice(0, 6).map((item: any, i: number) => (
              <motion.div
                key={item.month}
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.month}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Calls Trend */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Call Trends
          </h3>
          <div className="space-y-2">
            {data.trends.calls.slice(0, 6).map((item: any, i: number) => (
              <motion.div
                key={item.month}
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.month}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Orders Trend */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            Order Trends
          </h3>
          <div className="space-y-2">
            {data.trends.orders.slice(0, 6).map((item: any, i: number) => (
              <motion.div
                key={item.month}
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.month}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</div>
                 <div className="text-xs text-gray-500">
  ₹{Number(item.total ?? 0).toFixed(0)}
</div>

                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Weekly Pattern & Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Pattern */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#FF6B35]" />
            Weekly Activity Pattern
          </h3>
          <div className="space-y-3">
            {data.weeklyPattern.map((day: any, i: number) => (
              <motion.div
                key={day.day}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 font-medium">{day.day}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(day.count / maxActivity) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white w-12 text-right">
                  {day.count}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recharge Pattern */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#FF6B35]" />
            Recharge Pattern
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Recharges</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.rechargePattern.total}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Avg Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{data.rechargePattern.averageRecharge.toFixed(0)}
                </p>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                Recent Recharges
              </p>
              {data.rechargePattern.last6Months.slice(0, 8).map((recharge: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {new Date(recharge.date).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{recharge.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Chatted Astrologers */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF6B35]" />
            Most Chatted
          </h3>
          <div className="space-y-3">
            {data.preferences.topChattedAstrologers.length > 0 ? (
              data.preferences.topChattedAstrologers.map((astro: any, i: number) => (
                <motion.div
                  key={astro.id}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-6">#{i + 1}</span>
                    <span className="text-sm text-gray-900 dark:text-white truncate">{astro.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#FF6B35]">{astro.count}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
            )}
          </div>
        </motion.div>

        {/* Top Called Astrologers */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#FF6B35]" />
            Most Called
          </h3>
          <div className="space-y-3">
            {data.preferences.topCalledAstrologers.length > 0 ? (
              data.preferences.topCalledAstrologers.map((astro: any, i: number) => (
                <motion.div
                  key={astro.id}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-6">#{i + 1}</span>
                    <span className="text-sm text-gray-900 dark:text-white truncate">{astro.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#FF6B35]">{astro.count}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
            )}
          </div>
        </motion.div>

        {/* Favorite Categories */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#FF6B35]" />
            Favorite Categories
          </h3>
          <div className="space-y-3">
            {data.preferences.favoriteCategories.length > 0 ? (
              data.preferences.favoriteCategories.map((cat: any, i: number) => (
                <motion.div
                  key={cat.id}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-6">#{i + 1}</span>
                    <span className="text-sm text-gray-900 dark:text-white truncate">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#FF6B35]">{cat.count}</span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}