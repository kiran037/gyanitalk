// components/customerscompo/tabs/NotificationsTab.tsx
import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/adminUI/Button";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: number;
  isRead: boolean | null;
  createdAt: Date;
}

interface NotificationsTabProps {
  customerId: string;
}

export default function NotificationsTab({ customerId }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/notifications?page=${page}&limit=50`);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {unreadCount > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>{unreadCount}</strong> unread notification{unreadCount > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Notifications</h3>
          <p className="text-gray-600 dark:text-gray-400">No notifications have been sent to this customer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl transition-colors ${
                notif.isRead
                  ? "bg-gray-50/50 dark:bg-gray-900/30"
                  : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    notif.isRead
                      ? "bg-gray-200 dark:bg-gray-700"
                      : "bg-blue-100 dark:bg-blue-900/30"
                  }`}
                >
                  {notif.isRead ? (
                    <Check className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{notif.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{notif.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(notif.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
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
    </div>
  );
}