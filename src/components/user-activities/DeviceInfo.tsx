"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Smartphone, Clock, Bell, Wifi } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

interface DeviceInfoProps {
  userId: string;
}

export function DeviceInfo({ userId }: DeviceInfoProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    fetchDevices();
  }, [userId]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-activities/${userId}/devices`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        addToast("error", "Error", "Failed to load device data");
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
                <div key={j} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Devices</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.totalDevices}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Active</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.activeDevices}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">App Version</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {data.appVersions.current || "N/A"}
          </p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Push Enabled</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.summary.pushNotificationsEnabled ? "Yes" : "No"}
          </p>
        </motion.div>
      </div>

      {/* Devices by Model */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[#FF6B35]" />
          Devices by Model
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.devices.byModel.length > 0 ? (
            data.devices.byModel.map((device: any, i: number) => (
              <motion.div
                key={device.model}
                className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate">
                  {device.model || "Unknown"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {device.count} device{device.count > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-gray-400">
                  Last seen: {new Date(device.lastSeen).toLocaleDateString()}
                </p>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 col-span-full text-center py-8">
              No devices found
            </p>
          )}
        </div>
      </motion.div>

      {/* Device Details */}
      <motion.div
        className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">All Devices</h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {data.devices.details.length > 0 ? (
            data.devices.details.map((device: any, i: number) => (
              <motion.div
                key={device.id}
                className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-[#FF6B35]" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {device.deviceModel || "Unknown Device"}
                      </p>
                      {device.isActive && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {device.deviceManufacturer || "Unknown"} • {device.appVersion || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">App ID</p>
                    <p className="text-gray-900 dark:text-white font-medium">{device.appId}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Location</p>
                    <p className="text-gray-900 dark:text-white font-medium truncate">
                      {device.deviceLocation || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">Last Active</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {device.lastActive ? new Date(device.lastActive).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 mb-1">FCM Token</p>
                    <p className="text-gray-900 dark:text-white font-medium truncate">
                      {device.fcmToken || "N/A"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No devices found</p>
          )}
        </div>
      </motion.div>

      {/* Sessions & Live Streaming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FF6B35]" />
            Recent Sessions ({data.sessions.total})
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data.sessions.recent.length > 0 ? (
              data.sessions.recent.map((session: any, i: number) => (
                <motion.div
                  key={session.id}
                  className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(session.createdAt).toLocaleString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold ${
                        session.isExpired
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {session.isExpired ? "Expired" : "Active"}
                    </span>
                  </div>
                  {session.expiresAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Expires: {new Date(session.expiresAt).toLocaleString()}
                    </p>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No sessions</p>
            )}
          </div>
        </motion.div>

        {/* Live Streaming */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Wifi className="w-5 h-5 text-[#FF6B35]" />
            Live Streaming ({data.liveStreaming.total})
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.liveStreaming.recent.length > 0 ? (
              data.liveStreaming.recent.map((stream: any, i: number) => (
                <motion.div
                  key={stream.id}
                  className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-purple-500" />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Channel: {stream.channelName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                    FCM: {stream.fcmToken}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(stream.updatedAt).toLocaleString()}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No live streams</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* App Versions */}
      {data.appVersions.all.length > 1 && (
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">App Version History</h3>

          <div className="flex flex-wrap gap-2">
            {data.appVersions.all.map((version: string, i: number) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  version === data.appVersions.current
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                {version}
                {version === data.appVersions.current && (
                  <span className="ml-1 text-xs">(Current)</span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}