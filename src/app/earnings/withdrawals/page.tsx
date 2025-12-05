// app/earnings/withdrawals/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  TrendingUp,
  Wallet
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { WithdrawalFilters } from "@/components/earnings/WithdrawalFilters";
import { WithdrawalTable } from "@/components/earnings/WithdrawalTable";
import { WithdrawalDetailModal } from "@/components/earnings/WithdrawalDetailModal";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";

interface Withdrawal {
  id: string;
  astrologerId: string;
  withdrawAmount: string;
  status: string;
  paymentMethod: number | null;
  upiId: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  accountHolderName: string | null;
  created_at: string;
  updated_at: string;
  astrologer: {
    id: string;
    name: string;
    email: string;
    contactNo: string;
    profileImage: string | null;
  } | null;
  withdrawmethod: {
    id: number;
    method_name: string;
  } | null;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    startDate: "",
    endDate: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  const addToast = useToast();

  useEffect(() => {
    fetchWithdrawals();
  }, [pagination.page, filters, search]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (search) params.append("search", search);
      if (filters.status) params.append("status", filters.status);
      if (filters.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/earnings/withdrawals?${params}`);
      const data = await response.json();

      if (data.success) {
        setWithdrawals(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }));

        // ✅ Use global stats from backend (all pages with current filters)
        if (data.stats) {
          setStats({
            pending: data.stats.pending ?? 0,
            approved: data.stats.approved ?? 0,
            rejected: data.stats.rejected ?? 0,
            totalAmount: data.stats.totalAmount ?? 0
          });
        }
      }

    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
      addToast("error", "Error", "Failed to fetch withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/earnings/withdrawals/${selectedWithdrawal.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modifiedBy: 1 })
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Withdrawal approved successfully");
        setShowApproveModal(false);
        setSelectedWithdrawal(null);
        fetchWithdrawals();
      } else {
        addToast("error", "Error", data.error || "Failed to approve withdrawal");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to approve withdrawal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/earnings/withdrawals/${selectedWithdrawal.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modifiedBy: 1,
          reason: "Rejected by admin"
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", "Withdrawal rejected successfully");
        setShowRejectModal(false);
        setSelectedWithdrawal(null);
        fetchWithdrawals();
      } else {
        addToast("error", "Error", data.error || "Failed to reject withdrawal");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to reject withdrawal");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/earnings/withdrawals/bulk-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawalIds: selectedIds,
          modifiedBy: 1
        })
      });

      const data = await response.json();

      if (data.success) {
        addToast("success", "Success", `Approved ${data.data.approved.length} withdrawals`);
        if (data.data.failed.length > 0) {
          addToast("warning", "Warning", `Failed to approve ${data.data.failed.length} withdrawals`);
        }
        setSelectedIds([]);
        fetchWithdrawals();
      } else {
        addToast("error", "Error", "Failed to bulk approve");
      }
    } catch (error) {
      addToast("error", "Error", "Failed to bulk approve");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-6">
      <PageHeader
        title="Withdrawal Requests"
        subtitle="Manage astrologer withdrawal requests"
        badge={{ text: "FINANCIAL", variant: "orange" }}
        actions={
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="primary"
                icon={<CheckCircle className="w-4 h-4" />}
                onClick={handleBulkApprove}
                loading={actionLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                Approve Selected ({selectedIds.length})
              </Button>
            )}
            <Button
              variant="outline"
              icon={<Download className="w-4 h-4" />}
              onClick={() => window.open(`/api/earnings/reports/withdrawals?format=csv`, '_blank')}
            >
              Export
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase">Pending</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting approval</div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase">Approved</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Successfully processed</div>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Rejected</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Request declined</div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-5 shadow-sm text-white"
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-semibold uppercase opacity-90">Total Amount</span>
          </div>
          <div className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString('en-IN')}</div>
          <div className="text-xs opacity-80 mt-1">
            Total for all filtered withdrawals
          </div>

        </motion.div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by astrologer name..."
            className="md:col-span-2"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Released">Approved</option>
            <option value="Reject">Rejected</option>
          </select>

          <Button
            variant="outline"
            icon={showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'More'} Filters
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <WithdrawalFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="mt-6">
        <WithdrawalTable
          withdrawals={withdrawals}
          loading={loading}
          selectedIds={selectedIds}
          onSelectIds={setSelectedIds}
          onViewDetail={(withdrawal) => {
            setSelectedWithdrawal(withdrawal);
            setShowDetailModal(true);
          }}
          onApprove={(withdrawal) => {
            setSelectedWithdrawal(withdrawal);
            setShowApproveModal(true);
          }}
          onReject={(withdrawal) => {
            setSelectedWithdrawal(withdrawal);
            setShowRejectModal(true);
          }}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
            className="px-6"
          >
            Previous
          </Button>
          <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
            className="px-6"
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      {showDetailModal && selectedWithdrawal && (
        <WithdrawalDetailModal
          withdrawal={selectedWithdrawal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedWithdrawal(null);
          }}
          onActionComplete={fetchWithdrawals}
        />
      )}

      <ActionModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Withdrawal"
        message={`Are you sure you want to approve this withdrawal request of ₹${selectedWithdrawal ? parseFloat(selectedWithdrawal.withdrawAmount).toLocaleString('en-IN') : '0'}? This will deduct the amount from the astrologer's balance.`}
        confirmText="Approve"
        type="info"
        loading={actionLoading}
      />

      <ActionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Withdrawal"
        message={`Are you sure you want to reject this withdrawal request of ₹${selectedWithdrawal ? parseFloat(selectedWithdrawal.withdrawAmount).toLocaleString('en-IN') : '0'}?`}
        confirmText="Reject"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}