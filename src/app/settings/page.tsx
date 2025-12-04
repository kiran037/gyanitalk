"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  DollarSign,
  Star,
  User,
  Image,
  Gift,
  Languages,
  Flag,
  TrendingUp,
  Clock,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { motion } from "framer-motion";

interface SettingsOverview {
  statistics: {
    recharge: { total: number; label: string; icon: string };
    horoscopeSigns: { total: number; label: string; icon: string };
    defaultProfiles: { total: number; label: string; icon: string };
    banners: { total: number; active: number; label: string; icon: string };
    gifts: { total: number; label: string; icon: string };
    languages: { total: number; label: string; icon: string };
    systemFlags: { total: number; groups: number; label: string; icon: string };
  };
  recentActivity: {
    recharges: Array<{ type: string; id: number | string; label: string; updated_at: Date }>;
    banners: Array<{ type: string; id: string; label: string; updated_at: Date }>;
    flags: Array<{ type: string; id: number; label: string; group: string; updated_at: Date }>;
  };
  criticalSettings: Array<{
    id: number;
    name: string;
    displayName: string;
    value: string;
    isActive: boolean;
    group: string;
  }>;
}

export default function SettingsPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<SettingsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.success) {
        setOverview(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch overview");
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      title: "Recharge Amounts",
      icon: DollarSign,
      href: "/settings/recharge",
      color: "from-blue-500 to-blue-600",
      stat: overview?.statistics.recharge.total || 0,
    },
    {
      title: "Horoscope Signs",
      icon: Star,
      href: "/settings/horoscope-signs",
      color: "from-purple-500 to-purple-600",
      stat: overview?.statistics.horoscopeSigns.total || 0,
    },
    {
      title: "Default Profiles",
      icon: User,
      href: "/settings/default-profiles",
      color: "from-green-500 to-green-600",
      stat: overview?.statistics.defaultProfiles.total || 0,
    },
    {
      title: "Banners",
      icon: Image,
      href: "/settings/banners",
      color: "from-orange-500 to-orange-600",
      stat: overview?.statistics.banners.total || 0,
    },
    {
      title: "Gifts",
      icon: Gift,
      href: "/settings/gifts",
      color: "from-pink-500 to-pink-600",
      stat: overview?.statistics.gifts.total || 0,
    },
    {
      title: "Languages",
      icon: Languages,
      href: "/settings/languages",
      color: "from-indigo-500 to-indigo-600",
      stat: overview?.statistics.languages.total || 0,
    },
    {
      title: "System Flags",
      icon: Flag,
      href: "/settings/system-flags",
      color: "from-red-500 to-red-600",
      stat: overview?.statistics.systemFlags.total || 0,
      badge: "Core",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings Dashboard"
        subtitle="Manage all system configurations from one place"
        badge={{ text: "Overview", variant: "blue" }}
      />

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Settings</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview
                      ? overview.statistics.recharge.total +
                        overview.statistics.horoscopeSigns.total +
                        overview.statistics.defaultProfiles.total +
                        overview.statistics.banners.total +
                        overview.statistics.gifts.total +
                        overview.statistics.languages.total +
                        overview.statistics.systemFlags.total
                      : 0}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Banners</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview?.statistics.banners.active || 0}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Flag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">System Flags</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview?.statistics.systemFlags.total || 0}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Languages className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Languages</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {overview?.statistics.languages.total || 0}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Access</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <motion.button
              key={link.href}
              onClick={() => router.push(link.href)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 text-left hover:shadow-lg transition-all group"
              whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.5)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${link.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded">
                    {link.badge}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                {link.title}
              </h3>
              <div className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FFB347] bg-clip-text text-transparent">
                {link.stat}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Activity & Critical Settings */}
      {overview && !loading && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Updates</h3>
            </div>
            <div className="space-y-3">
              {[
                ...overview.recentActivity.recharges,
                ...overview.recentActivity.banners,
                ...overview.recentActivity.flags.slice(0, 3),
              ]
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5)
                .map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-1.5"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Critical Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flag className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Critical Flags</h3>
            </div>
            <div className="space-y-3">
              {overview.criticalSettings.slice(0, 5).map((setting) => (
                <div
                  key={setting.id}
                  className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {setting.displayName}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        setting.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {setting.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <code className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {setting.name}
                  </code>
                  <div className="mt-1 text-xs text-[#FF6B35] font-medium">
                    Value: {setting.value}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}