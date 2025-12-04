
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Eye,
  Users,
  Calendar,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { Modal } from "@/components/adminUI/Modal";
import NotificationDetails from "./NotificationDetails";

interface Notification {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  totalSent: number;
  readCount: number;
  unreadCount: number;
}

interface NotificationListProps {
  search: string;
  refreshTrigger: number;
  onRefresh: () => void;
}

export default function NotificationList({
  search,
  refreshTrigger,
  onRefresh,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [page, search, refreshTrigger]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
      });

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      } else {
        alert("Failed to delete notification");
      }
    } catch (error) {
      alert("Error deleting notification");
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReadPercentage = (notification: Notification) => {
    if (notification.totalSent === 0) return 0;
    return ((notification.readCount / notification.totalSent) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No Notifications Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {search ? "Try adjusting your search" : "Create your first notification to get started"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#FF6B35]/50 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-[#FF6B35]/10 rounded-lg flex-shrink-0">
                    <Bell className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {notification.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{notification.totalSent.toLocaleString()}</span>
                    <span>sent</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-medium">{notification.readCount.toLocaleString()}</span>
                    <span>read</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span className="font-medium">{getReadPercentage(notification)}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">{formatDate(notification.created_at)}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FFB347] rounded-full transition-all"
                      style={{
                        width: `${getReadPercentage(notification)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => {
                    setSelectedNotification(notification.id);
                    setShowDetailsModal(true);
                  }}
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => handleDelete(notification.id)}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    page === pageNum
                      ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white shadow-lg"
                      : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#FF6B35]/50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Notification Details"
        size="lg"
      >
        {selectedNotification && (
          <NotificationDetails notificationId={selectedNotification} />
        )}
      </Modal>
    </>
  );
}