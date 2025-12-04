"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Plus,
  Users,
  TrendingUp,
  Eye,
  Send,
  BarChart3,
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Modal } from "@/components/adminUI/Modal";
import NotificationForm from "@/components/notifications/NotificationForm";
import NotificationList from "@/components/notifications/NotificationList";
import NotificationStats from "@/components/notifications/NotificationStats";
import AudienceModal from "@/components/notifications/AudienceModal";

interface NotificationStats {
  totalNotifications: number;
  totalSent: number;
  totalRead: number;
  totalUnread: number;
  readRate: string;
}

export default function NotificationsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/notifications/stats?days=30");
      const data = await response.json();
      if (data.success) {
        setStats(data.data.overview);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleNotificationCreated = () => {
    setShowCreateModal(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50/30 to-white-50/30 dark:from-black-900 dark:to-black-800">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <PageHeader
          title="Notifications"
          subtitle="Send and manage push notifications to your users"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<BarChart3 className="w-4 h-4" />}
                onClick={() => setShowStatsModal(true)}
              >
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Users className="w-4 h-4" />}
                onClick={() => setShowAudienceModal(true)}
              >
                Audience
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Notification
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        {stats && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Sent
                </p>
                <Send className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalSent.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Read Rate
                </p>
                <Eye className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.readRate}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Read
                </p>
                <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalRead.toLocaleString()}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Unread
                </p>
                <Bell className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUnread.toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Search & Filters */}
        <motion.div
          className="mt-8 flex items-center justify-between gap-4 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search notifications..."
            className="flex-1 max-w-md"
          />
        </motion.div>

        {/* Notification List */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <NotificationList
            search={search}
            refreshTrigger={refreshTrigger}
            onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
          />
        </motion.div>

        {/* Modals */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Notification"
          size="xl"
        >
          <NotificationForm onSuccess={handleNotificationCreated} />
        </Modal>

        <Modal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          title="Notification Analytics"
          size="lg"
        >
          <NotificationStats />
        </Modal>

        <Modal
          isOpen={showAudienceModal}
          onClose={() => setShowAudienceModal(false)}
          title="Audience Overview"
          size="md"
        >
          <AudienceModal />
        </Modal>
      </div>
    </div>
  );
}