// ===================================
// FILE: components/notifications/NotificationForm.tsx
// ===================================
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/adminUI/Button";
import { Input } from "@/components/adminUI/Input";
import {
  Users,
  UserCheck,
  Star,
  Wallet,
  Send,
  TestTube,
  Sparkles,
} from "lucide-react";

interface NotificationFormProps {
  onSuccess: () => void;
}

interface AudienceCounts {
  all_users: number;
  active_users: number;
  all_astrologers: number;
  users_with_wallet: number;
}

export default function NotificationForm({ onSuccess }: NotificationFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAudience: "all_users",
    notificationType: 0,
  });
  const [loading, setLoading] = useState(false);
  const [testUserId, setTestUserId] = useState("");
  const [audienceCounts, setAudienceCounts] = useState<AudienceCounts | null>(
    null
  );

  useEffect(() => {
    fetchAudienceCounts();
  }, []);

  const fetchAudienceCounts = async () => {
    try {
      const response = await fetch("/api/notifications/audience");
      const data = await response.json();
      if (data.success) {
        setAudienceCounts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch audience counts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sendImmediately: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `Notification sent successfully!\nSent: ${data.data.stats.sentCount}\nFailed: ${data.data.stats.failedCount}`
        );
        onSuccess();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to send notification");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSend = async () => {
    if (!testUserId) {
      alert("Please enter a user ID for test send");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          userId: parseInt(testUserId),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `Test notification sent successfully to ${data.data.userName || "user"}!`
        );
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Failed to send test notification");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const audiences = [
    {
      value: "all_users",
      label: "All Users",
      icon: <Users className="w-4 h-4" />,
      count: audienceCounts?.all_users || 0,
    },
    {
      value: "active_users",
      label: "Active Users",
      description: "Last 30 days",
      icon: <UserCheck className="w-4 h-4" />,
      count: audienceCounts?.active_users || 0,
    },
    {
      value: "all_astrologers",
      label: "All Astrologers",
      icon: <Star className="w-4 h-4" />,
      count: audienceCounts?.all_astrologers || 0,
    },
    {
      value: "users_with_wallet",
      label: "Users with Wallet",
      icon: <Wallet className="w-4 h-4" />,
      count: audienceCounts?.users_with_wallet || 0,
    },
  ];

  const notificationTypes = [
    { value: 0, label: "System / General" },
    { value: 1, label: "Chat / Call Related" },
    { value: 2, label: "Promotional" },
    { value: 3, label: "Order Updates" },
    { value: 4, label: "Wallet Updates" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title & Description */}
      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Notification Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter a catchy title..."
          required
          icon={<Sparkles className="w-4 h-4" />}
        />

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Write your notification message..."
            required
            rows={4}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
          />
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>
      </div>

      {/* Target Audience */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
          Target Audience <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {audiences.map((audience) => (
            <button
              key={audience.value}
              type="button"
              onClick={() =>
                setFormData({ ...formData, targetAudience: audience.value })
              }
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.targetAudience === audience.value
                  ? "border-[#FF6B35] bg-[#FF6B35]/5"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    formData.targetAudience === audience.value
                      ? "bg-[#FF6B35] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {audience.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {audience.label}
                  </p>
                  {audience.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {audience.description}
                    </p>
                  )}
                  <p className="text-xs text-[#FF6B35] font-medium mt-1">
                    {audience.count.toLocaleString()} users
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Notification Type */}
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notification Type
        </label>
        <select
          value={formData.notificationType}
          onChange={(e) =>
            setFormData({
              ...formData,
              notificationType: parseInt(e.target.value),
            })
          }
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
        >
          {notificationTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Test Send */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
          Test Send (Optional)
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter User ID for testing..."
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
            type="number"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleTestSend}
            disabled={!formData.title || !formData.description || loading}
            icon={<TestTube className="w-4 h-4" />}
          >
            Test
          </Button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Send a test notification before broadcasting to all users
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!formData.title || !formData.description}
          icon={<Send className="w-4 h-4" />}
        >
          Send Notification
        </Button>
      </div>
    </form>
  );
}