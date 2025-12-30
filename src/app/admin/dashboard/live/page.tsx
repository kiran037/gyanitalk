"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { StatCard } from "@/components/adminUI/StatCard";
import {
  MessageCircle,
  Phone,
  Users,
  Video,
  Clock,
  TrendingUp,
  Activity,
  DollarSign,
  MapPin,
  Zap,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { avatar } from "@/lib/images";
import { useRouter } from "next/navigation";

export default function LiveDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const router = useRouter();

  const BackButton = () => (
    <button
      onClick={() => router.back()}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
    </button>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/live");
        const result = await response.json();

        if (result.success) {
          setData(result.data);
          setLastUpdate(new Date());
        }
      } catch (error) {
        console.error("Failed to fetch live data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Live Activity Monitor"
            subtitle="Real-time platform activity and system metrics"
            badge={{ text: "LIVE", variant: "green" }}
            leftActions={<BackButton />}
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Live
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Last updated: {formatTime(lastUpdate)}
            </div>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#FF6B35]" />
            Active Sessions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            <StatCard
              title="Active Chats"
              value={data?.realtime.activeChats || 0}
              icon={<MessageCircle className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Active Calls"
              value={data?.realtime.activeCalls || 0}
              icon={<Phone className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Online Astrologers"
              value={data?.realtime.onlineAstrologers || 0}
              icon={<Users className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Online Users"
              value={data?.realtime.onlineUsers || 0}
              icon={<Users className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="Live Streams"
              value={data?.realtime.liveStreamingSessions || 0}
              icon={<Video className="w-5 h-5" />}
              loading={loading}
            />
            <StatCard
              title="In Waitlist"
              value={data?.realtime.waitlistCount || 0}
              icon={<Clock className="w-5 h-5" />}
              loading={loading}
            />
          </div>
        </div>

        {/* Revenue Ticker & System Load */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Revenue (Last Hour)
            </h3>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent mb-2">
              {formatCurrency(data?.revenue.lastHour || 0)}
            </div>
            <div className="text-sm text-gray-500">
              {data?.revenue.transactions || 0} transactions
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              System Load
            </h3>
            <div
              className={`text-3xl font-bold mb-2 ${
                data?.systemLoad.loadStatus === "high"
                  ? "text-red-600"
                  : data?.systemLoad.loadStatus === "medium"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {data?.systemLoad.loadStatus || "Low"}
            </div>
            <div className="text-sm text-gray-500">
              {data?.systemLoad.totalActiveSessions || 0} active sessions
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Avg. Wait Time
            </h3>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {data?.realtime.avgWaitTime || 0} min
            </div>
            <div className="text-sm text-gray-500">
              Load ratio: {data?.systemLoad.waitlistRatio?.toFixed(2) || 0}
            </div>
          </div>
        </div>

        {/* Recent Activity - Chats & Calls */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Chats */}
          {!loading && data?.recentActivity.chats && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#FF6B35]" />
                Recent Chat Activity
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.recentActivity.chats.slice(0, 10).map((chat: any, index: number) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={avatar(chat.user.profile)}
                        alt={chat.user.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {chat.user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          with {chat.astrologer.name}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                        chat.status === "Accepted" || chat.status === "InProgress"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                      }`}
                    >
                      {chat.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Calls */}
          {!loading && data?.recentActivity.calls && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#FF6B35]" />
                Recent Call Activity
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.recentActivity.calls.slice(0, 10).map((call: any, index: number) => (
                  <motion.div
                    key={call.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={avatar(call.user.profile)}
                        alt={call.user.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {call.user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {call.type === "video" ? "Video" : "Audio"} • {call.astrologer.name}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                        call.status === "Accepted" || call.status === "InProgress"
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                      }`}
                    >
                      {call.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Streamers & Waitlist */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Live Streaming Astrologers */}
          {!loading && data?.liveStreamers && data.liveStreamers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-[#FF6B35]" />
                Live Streaming Astrologers
              </h3>
              <div className="space-y-3">
                {data.liveStreamers.map((streamer: any, index: number) => (
                  <motion.div
                    key={streamer.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 rounded-lg"
                  >
                    <div className="relative">
                      <img
                        src={avatar(streamer.astrologer.profileImage)}
                        alt={streamer.astrologer.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {streamer.astrologer.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {streamer.astrologer.skill}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-full flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      LIVE
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Waitlist */}
          {!loading && data?.waitlist && data.waitlist.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FF6B35]" />
                Current Waitlist ({data.waitlist.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.waitlist.slice(0, 10).map((item: any, index: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar(item.profile)}
                        alt={item.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.userName}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {item.requestType}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{item.waitTime}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Busiest Astrologers & Recent Transactions */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Busiest Astrologers */}
          {!loading && data?.busiestAstrologers && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                Currently Busiest Astrologers
              </h3>
              <div className="space-y-3">
                {data.busiestAstrologers.map((astro: any, index: number) => (
                  <motion.div
                    key={astro.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-full flex items-center justify-center text-white font-bold text-xs">
                        #{index + 1}
                      </div>
                      <img
                        src={avatar(astro.profileImage)}
                        alt={astro.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {astro.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {astro.chatStatus} • {astro.callStatus}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#FF6B35]">
                        {astro.activeSessions}
                      </div>
                      <div className="text-xs text-gray-500">sessions</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          {!loading && data?.revenue.recentTransactions && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#FF6B35]" />
                Recent Transactions
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.revenue.recentTransactions.slice(0, 10).map((txn: any, index: number) => (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {txn.user.name}
                      </div>
                      <div className="text-xs text-gray-500">{txn.method}</div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="text-sm font-bold text-[#FF6B35]">
                        {formatCurrency(txn.amount)}
                      </div>
                      <span
                        className={`text-xs ${
                          txn.status === "success"
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Users by Location */}
        {!loading && data?.usersByLocation && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FF6B35]" />
              Active Users by Location
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {data.usersByLocation.map((location: any, index: number) => (
                <motion.div
                  key={location.location}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {location.location}
                  </div>
                  <div className="text-2xl font-bold text-[#FF6B35]">
                    {location.count}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}