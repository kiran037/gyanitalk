// app/earnings/reports/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, TrendingUp, Wallet, Calendar } from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { Button } from "@/components/adminUI/Button";
import { useToast } from "@/components/Toast/ToastProvider";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [loading, setLoading] = useState<string | null>(null);
  const addToast = useToast();

  const handleExport = async (type: string, format: string) => {
    setLoading(type);
    try {
      const params = new URLSearchParams({
        format
      });

      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      window.open(`/api/earnings/reports/${type}?${params}`, '_blank');
      
      addToast("success", "Success", `Report exported successfully`);
    } catch (error) {
      addToast("error", "Error", "Failed to export report");
    } finally {
      setLoading(null);
    }
  };

  const ReportCard = ({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    reportType 
  }: any) => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.3)" }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport(reportType, 'json')}
          loading={loading === reportType}
          disabled={loading !== null && loading !== reportType}
        >
          JSON
        </Button>
        <Button
          variant="primary"
          size="sm"
          icon={<Download className="w-4 h-4" />}
          onClick={() => handleExport(reportType, 'csv')}
          loading={loading === reportType}
          disabled={loading !== null && loading !== reportType}
        >
          Export CSV
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-6">
      <PageHeader
        title="Financial Reports"
        subtitle="Export earnings and transaction reports"
        badge={{ text: "REPORTS", variant: "blue" }}
      />

      {/* Date Range Filter */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Select Date Range (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Withdrawals Report"
          description="Export all withdrawal requests with status and payment details"
          icon={Wallet}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          reportType="withdrawals"
        />

        <ReportCard
          title="Earnings Report"
          description="Export astrologer earnings with balance and transaction summary"
          icon={TrendingUp}
          color="bg-gradient-to-br from-green-500 to-green-600"
          reportType="earnings"
        />

        <ReportCard
          title="Commissions Report"
          description="Export commission records by type and astrologer"
          icon={FileText}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          reportType="commissions"
        />
      </div>

      {/* Info Card */}
      <div className="mt-8 bg-gradient-to-r from-[#FF6B35]/10 to-[#FFB347]/10 border border-[#FF6B35]/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#FFB347] rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Report Information
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>• Reports are generated in real-time based on your selected filters</li>
              <li>• CSV format is recommended for Excel and data analysis</li>
              <li>• JSON format is suitable for API integrations and custom processing</li>
              <li>• Date range filter is optional - leave empty for all-time data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}