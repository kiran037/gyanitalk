"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DollarSign, Star, User, Image, Gift, 
  Languages, Flag, TrendingUp, Clock, 
  Activity, ArrowRight, AlertTriangle, CheckCircle2
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { motion } from "framer-motion";

// --- Types ---
interface SettingsOverview {
  statistics: {
    recharge: { total: number; label: string };
    horoscopeSigns: { total: number; label: string };
    defaultProfiles: { total: number; label: string };
    banners: { total: number; active: number; label: string };
    gifts: { total: number; label: string };
    languages: { total: number; label: string };
    systemFlags: { total: number; groups: number; label: string };
  };
  recentActivity: {
    recharges: ActivityItem[];
    banners: ActivityItem[];
    flags: ActivityItem[];
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

interface ActivityItem {
    type: string; 
    id: number | string; 
    label: string; 
    updated_at: Date;
    description?: string;
}

// --- Helpers ---
const timeAgo = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
};

export default function SettingsPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<SettingsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      // Simulating API call for this example. Replace with actual fetch.
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.success) {
        setOverview(data.data);
      } else {
         setError(true);
      }
    } catch (error) {
      console.error("Failed to fetch overview", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getCombinedActivity = () => {
      if(!overview) return [];
      const { recharges, banners, flags } = overview.recentActivity;
      const all = [...recharges, ...banners, ...flags];
      return all.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 6);
  }

  const quickLinks = [
    {
      title: "Recharge Amounts",
      icon: DollarSign,
      href: "/admin/settings/recharge",
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-500",
      text: "text-blue-600",
      stat: overview?.statistics.recharge.total || 0,
    },
    {
      title: "Horoscope Signs",
      icon: Star,
      href: "/admin/settings/horoscope-signs",
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-500",
      text: "text-purple-600",
      stat: overview?.statistics.horoscopeSigns.total || 0,
    },
    {
      title: "Banners",
      icon: Image,
      href: "/admin/settings/banners",
      color: "from-orange-500 to-orange-600",
      bg: "bg-orange-500",
      text: "text-orange-600",
      stat: overview?.statistics.banners.total || 0,
      subStat: `${overview?.statistics.banners.active || 0} Active`
    },
    {
      title: "System Flags",
      icon: Flag,
      href: "/admin/settings/system-flags",
      color: "from-red-500 to-red-600",
      bg: "bg-red-500",
      text: "text-red-600",
      stat: overview?.statistics.systemFlags.total || 0,
      badge: "Core",
    },
    {
      title: "Languages",
      icon: Languages,
      href: "/admin/settings/languages",
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-500",
      text: "text-indigo-600",
      stat: overview?.statistics.languages.total || 0,
    },
    {
        title: "Default Profiles",
        icon: User,
        href: "/admin/settings/default-profiles",
        color: "from-green-500 to-green-600",
        bg: "bg-green-500",
        text: "text-green-600",
        stat: overview?.statistics.defaultProfiles.total || 0,
      },
  ];

  if (error && !loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Failed to load Dashboard</h3>
            <p className="text-gray-500 mb-4">Could not fetch settings data.</p>
            <button onClick={() => window.location.reload()} className="text-sm text-blue-600 hover:underline">
                Try again
            </button>
        </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Settings Dashboard"
        subtitle="Manage all system configurations from one place"
        badge={{ text: "Overview", variant: "blue" }}
      />

      {/* Top Stats Cards - Clickable */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-32" />
          ))
        ) : (
          <>
            <Link href="/admin/settings/system-flags" className="block group">
                <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className="w-16 h-16 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <Flag className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Flags</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {overview?.statistics.systemFlags.total || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Across {overview?.statistics.systemFlags.groups} groups</div>
                </motion.div>
            </Link>

            <Link href="/admin/settings/banners" className="block group">
                <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Image className="w-16 h-16 text-green-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                         <div className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Banners</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {overview?.statistics.banners.active || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">out of {overview?.statistics.banners.total} total</div>
                </motion.div>
            </Link>

            <Link href="/admin/settings/languages" className="block group">
                <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Languages className="w-16 h-16 text-purple-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Languages className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Languages</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {overview?.statistics.languages.total || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Supported locales</div>
                </motion.div>
            </Link>

            <Link href="/admin/settings/recharge" className="block group">
                <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-16 h-16 text-orange-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                         <div className="p-2.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                            <Gift className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Recharge Packs</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {overview?.statistics.recharge.total || 0}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Active packages</div>
                </motion.div>
            </Link>
          </>
        )}
      </div>

      {/* Quick Links Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Access</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <motion.button
              key={link.href}
              onClick={() => router.push(link.href)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 text-left hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-900/50 transition-all group w-full"
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${link.bg} bg-opacity-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <link.icon className={`w-6 h-6 ${link.text}`} />
                </div>
                {link.badge && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-bold uppercase tracking-wide rounded-full">
                    {link.badge}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">
                        {link.title}
                    </h3>
                    <div className="text-xs text-gray-500 mt-1">{link.stat} items</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all text-[#FF6B35]">
                    <ArrowRight className="w-4 h-4" />
                  </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom Section: Activity & Critical */}
      {overview && !loading && (
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <Clock className="w-5 h-5 text-[#FF6B35]" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
            </div>
            <div className="space-y-4">
              {getCombinedActivity().length > 0 ? getCombinedActivity().map((item, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 group-hover:bg-[#FF6B35] transition-colors mt-2" />
                        {i !== 5 && <div className="w-px h-full bg-gray-100 dark:bg-gray-700 my-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-[#FF6B35] transition-colors">
                                Updated {item.label}
                            </p>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {timeAgo(item.updated_at)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                           Type: {item.type} • ID: {item.id}
                        </p>
                    </div>
                  </div>
              )) : (
                  <div className="text-center py-10 text-gray-400 text-sm">No recent activity found.</div>
              )}
            </div>
          </motion.div>

          {/* Critical Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Critical Flags</h3>
            </div>
            <div className="space-y-3">
              {overview.criticalSettings.length > 0 ? overview.criticalSettings.slice(0, 5).map((setting) => (
                <div
                  key={setting.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {setting.displayName || setting.name}
                    </span>
                    {setting.isActive ? (
                         <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                         <div className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <code className="text-gray-500 dark:text-gray-400 font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                        {setting.name}
                    </code>
                    <span className="text-[#FF6B35] font-medium truncate max-w-[100px]" title={setting.value}>
                         {setting.value}
                    </span>
                  </div>
                </div>
              )) : (
                 <div className="text-center py-10 text-gray-400 text-sm">No critical flags configured.</div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link href="/admin/settings/system-flags" className="text-xs font-medium text-center block text-gray-500 hover:text-[#FF6B35]">
                    View all system flags
                </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}