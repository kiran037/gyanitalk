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
  MoreVertical
} from "lucide-react";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { WithdrawalFilters } from "@/components/earnings/WithdrawalFilters";
import { WithdrawalTable } from "@/components/earnings/WithdrawalTable";
import { WithdrawalDetailModal } from "@/components/earnings/WithdrawalDetailModal";
import { ActionModal } from "@/components/adminUI/ActionModal";
import { useToast } from "@/components/Toast/ToastProvider";
import type { Withdrawal } from "@/types/earnings";


export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
                onClick={handleBulkApprove}
                loading={actionLoading}
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

      {/* Filters */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
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
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <Button
            variant="outline"
            icon={<Filter className="w-4 h-4" />}
          >
            More Filters
          </Button>
        </div>

        <WithdrawalFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
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
        <div className="mt-6 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={pagination.page === pagination.totalPages}
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
        />
      )}

      <ActionModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Approve Withdrawal"
        message="Are you sure you want to approve this withdrawal request? This will deduct the amount from the astrologer's balance."
        confirmText="Approve"
        type="info"
        loading={actionLoading}
      />

      <ActionModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Reject Withdrawal"
        message="Are you sure you want to reject this withdrawal request?"
        confirmText="Reject"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}