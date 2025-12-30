// app/supports/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Mail, Ticket, HelpCircle, Star, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface StatsData {
  contacts: {
    total: number;
    recent: Array<{
      id: number;
      contact_name: string;
      contact_email: string;
      created_at: string;
    }>;
  };
  tickets: {
    stats: {
      total: number;
      open: number;
      inProgress: number;
      resolved: number;
      closed: number;
    };
    recent: Array<{
      id: string;
      ticketNumber: string;
      subject: string;
      ticketStatus: string;
      created_at: string;
      user: {
        name: string;
        email: string;
      } | null;
    }>;
    byCategory: Array<{
      categoryId: string;
      categoryName: string;
      count: number;
    }>;
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
  faq: {
    categories: number;
    questions: number;
    answers: number;
    activeCategories: number;
    activeQuestions: number;
  };
}

export default function SupportDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("");

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        const days = parseInt(dateRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        params.append("startDate", startDate.toISOString());
      }

      const response = await fetch(`/api/support/stats?${params}`);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PageHeader
            title="Support Dashboard"
            subtitle="Overview of support activities and metrics"
            badge={{ text: "ANALYTICS", variant: "green" }}
            actions={
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50"
              >
                <option value="">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            }
          />
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Link href="/supports/contact" className="group">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 group-hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.contacts.total}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Contacts</p>
            </div>
          </Link>

          <Link href="/supports/tickets" className="group">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 group-hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.tickets.stats.total}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
            </div>
          </Link>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.reviews.averageRating.toFixed(1)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating ({stats.reviews.totalReviews} reviews)</p>
          </div>

          <Link href="/supports/faq" className="group">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6 group-hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.faq.questions}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">FAQ Questions</p>
            </div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ticket Status Breakdown */}
          <motion.div
            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ticket Status</h3>
            <div className="space-y-3">
              {[
                { label: "Open", value: stats.tickets.stats.open, color: "blue", icon: Clock },
                { label: "In Progress", value: stats.tickets.stats.inProgress, color: "purple", icon: AlertCircle },
                { label: "Resolved", value: stats.tickets.stats.resolved, color: "green", icon: CheckCircle },
                { label: "Closed", value: stats.tickets.stats.closed, color: "gray", icon: CheckCircle },
              ].map((item) => {
                const Icon = item.icon;
                const percentage = stats.tickets.stats.total > 0
                  ? (item.value / stats.tickets.stats.total) * 100
                  : 0;
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 text-${item.color}-500`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{item.value}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`bg-${item.color}-500 h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Tickets by Category */}
          <motion.div
            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Tickets by Category</h3>
            <div className="space-y-3">
              {stats.tickets.byCategory.slice(0, 5).map((cat) => {
                const percentage = stats.tickets.stats.total > 0
                  ? (cat.count / stats.tickets.stats.total) * 100
                  : 0;
                return (
                  <div key={cat.categoryId}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{cat.categoryName}</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{cat.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#FF6B35] to-[#FFB347] h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Contacts */}
          <motion.div
            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Contacts</h3>
              <Link href="/supports/contact" className="text-sm text-[#FF6B35] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats.contacts.recent.map((contact) => (
                <div key={contact.id} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-white/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center text-white font-bold text-sm">
                    {contact.contact_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{contact.contact_name}</p>
                    <p className="text-xs text-gray-500 truncate">{contact.contact_email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(contact.created_at)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Tickets */}
          <motion.div
            className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Tickets</h3>
              <Link href="/supports/tickets" className="text-sm text-[#FF6B35] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {stats.tickets.recent.map((ticket) => (
                <div key={ticket.id} className="p-3 bg-white/60 dark:bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-[#FF6B35]">{ticket.ticketNumber}</p>
                    <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{ticket.subject}</p>
                  {ticket.user && (
                    <p className="text-xs text-gray-500 mt-1">{ticket.user.name}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* FAQ Stats */}
        <motion.div
          className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">FAQ Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Categories", value: stats.faq.categories },
              { label: "Questions", value: stats.faq.questions },
              { label: "Answers", value: stats.faq.answers },
              { label: "Active Categories", value: stats.faq.activeCategories },
              { label: "Active Questions", value: stats.faq.activeQuestions },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 bg-white/60 dark:bg-white/5 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{item.value}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}