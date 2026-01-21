// ===================================
// FILE: components/requests/AnalyticsOverviewCards.tsx
// ===================================

"use client";

import { StatCard } from "@/components/adminUI/StatCard";
import { AnalyticsOverview } from "@/lib/requests/types";
import { Phone, MessageSquare, CheckCircle, Clock, Users, XCircle } from "lucide-react";

interface AnalyticsOverviewCardsProps {
  data: AnalyticsOverview | null;
  loading: boolean;
}

export function AnalyticsOverviewCards({ data, loading }: AnalyticsOverviewCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <StatCard
            key={i}
            title="Loading..."
            value="..."
            icon={<Clock className="w-5 h-5" />}
            loading={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Requests"
        value={data.summary.totalRequests.toLocaleString()}
        icon={<Users className="w-5 h-5" />}
      />

      <StatCard
        title="Pending"
        value={data.summary.totalPending.toLocaleString()}
        icon={<Clock className="w-5 h-5" />}
      />

      <StatCard
        title="Completed"
        value={data.summary.totalCompleted.toLocaleString()}
        icon={<CheckCircle className="w-5 h-5" />}
      />

      <StatCard
        title="Acceptance Rate"
        value={`${data.rates.acceptanceRate}%`}
        icon={<CheckCircle className="w-5 h-5" />}
      />

      <StatCard
        title="Call Requests"
        value={data.calls.total.toLocaleString()}
        icon={<Phone className="w-5 h-5" />}
      />

      <StatCard
        title="Chat Requests"
        value={data.chats.total.toLocaleString()}
        icon={<MessageSquare className="w-5 h-5" />}
      />

      <StatCard
        title="Active Astrologers"
        value={data.summary.activeAstrologers.toLocaleString()}
        icon={<Users className="w-5 h-5" />}
      />

      <StatCard
        title="Completion Rate"
        value={`${data.rates.completionRate}%`}
        icon={<CheckCircle className="w-5 h-5" />}
      />
    </div>
  );
}