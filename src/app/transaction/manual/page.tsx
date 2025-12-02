// app/transaction/manual/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { useDebounce } from "@/hooks/useDebounce";
import ExportButton from "@/components/ExportButton";
import ManualStatsCards from "@/components/transaction/ManualStatsCards";
import ManualFilterPanel from "@/components/transaction/ManualFilterPanel";
import ManualTransactionsTable from "@/components/transaction/ManualTransactionsTable";
import ApproveRejectModal from "@/components/transaction/ApproveRejectModal";
import type { ManualTransaction } from "@/types/transactions";


interface Statistics {
  totalManualPayments: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  pendingAmount: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function ManualTransactionsPage() {
  const [transactions, setTransactions] = useState<ManualTransaction[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ManualTransaction | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);

  const [filters, setFilters] = useState({
    paymentStatus: "pending", // Default to pending
    startDate: "",
    endDate: "",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.currentPage, debouncedSearch, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.itemsPerPage.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });

      const response = await fetch(`/api/transactions/manual?${params}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
        setStatistics(data.statistics);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch manual transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      paymentStatus: "pending",
      startDate: "",
      endDate: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleApproveClick = (transaction: ManualTransaction) => {
    setSelectedTransaction(transaction);
    setShowApproveModal(true);
  };

  const handleApproveSuccess = () => {
    setShowApproveModal(false);
    setSelectedTransaction(null);
    fetchTransactions();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50/30 to-white-50/30 dark:from-black-900 dark:to-black-800">
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader
          title="Manual Payment Approvals"
          subtitle="Review and approve manual payment requests"
        />

        {statistics && <ManualStatsCards stats={statistics} loading={loading} />}

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200/60 dark:border-gray-700/60 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by user or reference ID..."
                  className="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={<Filter className="w-4 h-4" />}
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline">Filters</span>
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={fetchTransactions}
                  icon={<RefreshCw className="w-4 h-4" />}
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <ExportButton
                  type="json"
                  getJsonData={async () => transactions}
                  filename="manual_payments.xlsx"
                  sheetName="Manual Payments"
                  variant="outline"
                  size="md"
                  className="hidden md:flex flex-shrink-0"
                  buttonText="Export"
                />
              </div>
            </div>

            {showFilters && (
              <ManualFilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            )}

            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {transactions.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {pagination.totalItems}
                </span>{" "}
                manual payments
              </p>

              {(debouncedSearch || Object.values(filters).some((v) => v && v !== "pending")) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <ManualTransactionsTable
            transactions={transactions}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, currentPage: page }))
            }
            onApproveClick={handleApproveClick}
          />
        </div>
      </div>

      {selectedTransaction && (
        <ApproveRejectModal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          onSuccess={handleApproveSuccess}
        />
      )}
    </div>
  );
}