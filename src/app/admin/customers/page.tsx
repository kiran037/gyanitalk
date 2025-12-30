"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, Download, RefreshCw } from "lucide-react";
import StatsCards from "@/components/customers/StatsCards";
import CustomersTable from "@/components/customers/CustomersTable";
import FilterPanel from "@/components/customers/FilterPanel";
import AddCustomerModal from "@/components/customers/AddCustomerModal";
import AddMoneyModal from "@/components/customers/AddMoneyModal";
import { Button } from "@/components/adminUI/Button";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { PageHeader } from "@/components/adminUI/PageHeader";
import { useDebounce } from "@/hooks/useDebounce";
import ExportButton from "@/components/ExportButton";

interface Customer {
  id: string;
  name: string;
  contactNo: string;
  countryCode: string;
  email: string;
  gender: string;
  birthDate: Date | null;
  birthTime: string;
  joinDate: Date | null;
  walletBalance: string;
  isActive: boolean;
  isDelete: boolean;
  location: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  newToday: number;
  totalWalletBalance: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  perPage: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    perPage: 100,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddMoney, setShowAddMoney] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    gender: "",
    minBalance: "",
    maxBalance: "",
    location: "",
    startDate: "",
    endDate: "",
    sortBy: "joinDate",
    sortOrder: "desc",
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchCustomers();
  }, [pagination.currentPage, debouncedSearch, filters]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.perPage.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {} as Record<string, string>),
      });

      const response = await fetch(`/api/customers?${params}`);
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data.users);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCustomers();
  };

  const handleExport = async () => {
    console.log("Exporting customers...");
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "all",
      gender: "",
      minBalance: "",
      maxBalance: "",
      location: "",
      startDate: "",
      endDate: "",
      sortBy: "joinDate",
      sortOrder: "desc",
    });
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Customers"
          subtitle="Manage and monitor all your customers"
        />

        {/* Stats Cards */}
        {stats && <StatsCards stats={stats} loading={loading} />}

        {/* Main Content Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-lg overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 sm:p-6 border-b border-gray-200/60 dark:border-gray-700/60 space-y-4">
            {/* Top Row - Search & Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name, phone, email, or ID..."
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
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

                <ExportButton
                  type="json"
                  getJsonData={async () => customers}
                  filename="customers.xlsx"
                  sheetName="Customers"
                  variant="outline"
                  size="md"
                  className="hidden md:flex flex-shrink-0"
                  buttonText="Export"
                />


                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowAddMoney(true)}
                  className="flex-shrink-0"
                >
                  Add Money
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowAddCustomer(true)}
                  icon={<Plus className="w-4 h-4" />}
                  className="flex-shrink-0"
                >
                  <span className="hidden sm:inline">Add Customer</span>
                </Button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            )}

            {/* Results Info */}
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {customers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {pagination.totalCount}
                </span>{" "}
                customers
              </p>

              {(debouncedSearch || Object.values(filters).some((v) => v && v !== "all")) && (
                <button
                  onClick={handleResetFilters}
                  className="text-[#FF6B35] hover:text-[#FF6B35]/80 font-medium transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <CustomersTable
            customers={customers}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, currentPage: page }))
            }
          />
        </div>
      </div>

      {/* Modals */}
      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onSuccess={fetchCustomers}
      />

      <AddMoneyModal
        isOpen={showAddMoney}
        onClose={() => setShowAddMoney(false)}
        onSuccess={fetchCustomers}
      />
    </div>
  );
}