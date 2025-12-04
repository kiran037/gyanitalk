// app/transaction/wallet/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { useDebounce } from "@/hooks/useDebounce";
import ExportButton from "@/components/ExportButton";
import WalletStatsCards from "@/components/transaction/WalletStatsCards";
import WalletFilterPanel from "@/components/transaction/WalletFilterPanel";
import WalletTransactionsTable from "@/components/transaction/WalletTransactionsTable";

interface WalletTransaction {
  id: string;
  amount: number;
  isCredit: boolean;
  transactionType: string;
  transaction_id: string | null;
  orderId: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    profile: string | null;
    contactNo: string;
  } | null;
  astrologer: {
    id: string;
    name: string;
    profileImage: string | null;
  } | null;
  ai_astrologer: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  order_request: {
    id: string;
    orderType: string;
    orderStatus: string;
    totalPayable: string;
  } | null;
}

interface Statistics {
  totalTransactions: number;
  totalAmount: number;
  totalCredit: number;
  totalDebit: number;
  netAmount: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function WalletTransactionsPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
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

  const [filters, setFilters] = useState({
    transactionType: "",
    isCredit: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
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

      const response = await fetch(`/api/transactions/wallet?${params}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
        setStatistics(data.statistics);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch wallet transactions:", error);
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
      transactionType: "",
      isCredit: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <PageHeader
          title="Wallet Transactions"
          subtitle="Track all wallet transactions and user activity"
        />

        {statistics && <WalletStatsCards stats={statistics} loading={loading} />}

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200/60 dark:border-gray-700/60 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by user name, email, phone, or transaction ID..."
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
                  filename="wallet_transactions.xlsx"
                  sheetName="Wallet Transactions"
                  variant="outline"
                  size="md"
                  className="hidden md:flex flex-shrink-0"
                  buttonText="Export"
                />
              </div>
            </div>

            {showFilters && (
              <WalletFilterPanel
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
                transactions
              </p>

              {(debouncedSearch || Object.values(filters).some((v) => v)) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          <WalletTransactionsTable
            transactions={transactions}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, currentPage: page }))
            }
          />
        </div>
      </div>
    </div>
  );
}