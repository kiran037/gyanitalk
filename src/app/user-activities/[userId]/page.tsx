"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  TrendingUp,
  MessageSquare,
  PhoneCall,
  ShoppingBag,
  Wallet,
  Star,
  Heart,
  Gift,
  Smartphone,
  LifeBuoy,
  BookOpen,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { UserOverviewCards } from "@/components/user-activities/UserOverviewCards";
import { ActivityPatterns } from "@/components/user-activities/ActivityPatterns";
import { EngagementDetails } from "@/components/user-activities/EngagementDetails";
import { SupportHistory } from "@/components/user-activities/SupportHistory";
import { ContentEngagement } from "@/components/user-activities/ContentEngagement";
import { DeviceInfo } from "@/components/user-activities/DeviceInfo";
import { ScreenActivity } from "@/components/user-activities/ScreenActivity";
import { useToast } from "@/components/Toast/ToastProvider";
import { avatar } from "@/lib/images";

interface UserOverview {
  user: {
    id: string;
    name: string;
    email: string;
    profile: string;
    joinedAt: string;
    isActive: boolean;
  };
  engagement: any;
  wallet: any;
  support: any;
  content: any;
  device: any;
}

export default function UserActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [data, setData] = useState<UserOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const addToast = useToast();

  useEffect(() => {
    if (userId) {
      fetchUserOverview();
    }
  }, [userId]);

  const fetchUserOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user-activities/${userId}/overview`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        addToast("error", "Error", result.error || "Failed to load user data");
      }
    } catch (error) {
      console.error(error);
      addToast("error", "Error", "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { id: "patterns", label: "Patterns", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "engagement", label: "Engagement", icon: <Heart className="w-4 h-4" /> },
    { id: "support", label: "Support", icon: <LifeBuoy className="w-4 h-4" /> },
    { id: "content", label: "Content", icon: <BookOpen className="w-4 h-4" /> },
    { id: "devices", label: "Devices", icon: <Smartphone className="w-4 h-4" /> },
    { id: "screens", label: "Screens", icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 107, 53, 0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="relative z-10 p-6 lg:p-8 space-y-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => router.back()}
          >
            Back to List
          </Button>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        ) : data ? (
          <>
            {/* User Header */}
            <motion.div
              className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-6 flex-wrap">
                <img
                  src={avatar(data.user.profile)}
                  alt={data.user.name}
                  className="w-20 h-20 rounded-full ring-4 ring-[#FF6B35]/20 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {data.user.name}
                    </h1>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        data.user.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      {data.user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span>{data.user.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span>ID: {data.user.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(data.user.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "overview" && <UserOverviewCards userId={userId} initialData={data} />}
              {activeTab === "patterns" && <ActivityPatterns userId={userId} />}
              {activeTab === "engagement" && <EngagementDetails userId={userId} />}
              {activeTab === "support" && <SupportHistory userId={userId} />}
              {activeTab === "content" && <ContentEngagement userId={userId} />}
              {activeTab === "devices" && <DeviceInfo userId={userId} />}
              {activeTab === "screens" && <ScreenActivity userId={userId} />}
            </motion.div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">User not found</p>
          </div>
        )}
      </div>
    </div>
  );
}