
// ===================================
// FILE: components/notifications/AudienceModal.tsx
// ===================================
"use client";

import { useState, useEffect } from "react";
import { Users, UserCheck, Star, Wallet, TrendingUp } from "lucide-react";

interface AudienceCounts {
  all_users: number;
  active_users: number;
  all_astrologers: number;
  users_with_wallet: number;
}

export default function AudienceModal() {
  const [counts, setCounts] = useState<AudienceCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const response = await fetch("/api/notifications/audience");
      const data = await response.json();

      if (data.success) {
        setCounts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch audience counts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">Loading...</div>;
  }

  if (!counts) {
    return <div>Failed to load audience data</div>;
  }

  const audiences = [
    {
      icon: <Users className="w-6 h-6" />,
      label: "All Users",
      count: counts.all_users,
      color: "blue",
      description: "Total registered users",
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      label: "Active Users",
      count: counts.active_users,
      color: "green",
      description: "Active in last 30 days",
    },
    {
      icon: <Star className="w-6 h-6" />,
      label: "Astrologers",
      count: counts.all_astrologers,
      color: "orange",
      description: "Verified astrologers",
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      label: "With Wallet Balance",
      count: counts.users_with_wallet,
      color: "purple",
      description: "Users with active balance",
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
    green: "bg-green-100 dark:bg-green-900/30 text-green-600",
    orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
  };

  return (
    <div className="space-y-4">
      {audiences.map((audience, index) => (
        <div
          key={index}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-lg ${colorClasses[audience.color]}`}
            >
              {audience.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {audience.count.toLocaleString()}
              </h4>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {audience.label}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {audience.description}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}