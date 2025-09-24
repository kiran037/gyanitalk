import Image from "next/image";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import moment from "moment";
import { getPaymentTransactions, getWalletTransactions } from "../fetch";
import { isValidImageUrl } from "@/components/functions";

// Icons (using Lucide React or similar)
const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

// ==============================
// Compact Skeleton Loader
// ==============================
export function ModernTransactionsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
        <div className="h-6 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                  <div className="h-2 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
                <div className="h-2 w-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// Compact Payment Transactions Component
// ============================================
export async function ModernPaymentTransactionsTable({
  page = 1,
  limit = 15,
  search = "",
  startDate,
  endDate,
}: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { records, totalPages, currentPage } = await getPaymentTransactions({
    page,
    limit,
    search,
    startDate,
    endDate,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800";
      default:
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
    }
  };

  return (
    <div className="space-y-5">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Payment Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {records.length} transactions found
          </p>
        </div>
        
        <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      </div>

      {/* Compact Transaction Cards */}
      <div className="space-y-2">
        {records.map((item: any, index: number) => (
          <div
            key={item.id || index}
            className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:shadow-md hover:shadow-blue-500/5 dark:hover:shadow-blue-400/5 transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-700"
          >
            <div className="flex items-center justify-between">
              {/* Left: User Info */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-200 dark:group-hover:ring-blue-600 transition-all duration-200">
                    <Image
                      src={
                        isValidImageUrl(item?.user?.profile)
                          ? `${process.env.NEXT_PUBLIC_BASEURL}${item?.user?.profile}`
                          : "https://gyanitalk.com/build/assets/images/person.png"
                      }
                      alt={item?.user?.name || "User"}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full text-white flex items-center justify-center">
                    <UserIcon />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item?.user?.name?.trim() || "Unknown User"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    #{item?.id}
                  </p>
                </div>
              </div>

              {/* Right: Transaction Info */}
              <div className="flex items-center gap-6">
                {/* Amount & Payment Info */}
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{Number(item.amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.paymentMode || "N/A"}
                    {item.paymentReference && (
                      <span className="block text-xs mt-0.5 font-mono truncate max-w-20">
                        {item.paymentReference}
                      </span>
                    )}
                  </div>
                </div>

                {/* Cashback */}
                <div className="text-center">
                  <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(item.cashback_amount || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Cashback
                  </div>
                </div>

                {/* Status & Date */}
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={cn(
                      "px-2 py-1 text-xs font-medium rounded border transition-all duration-200",
                      getStatusColor(item.paymentStatus)
                    )}
                  >
                    {item.paymentStatus?.toUpperCase() || "N/A"}
                  </span>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    <div>
                      {item.created_at
                        ? moment(item.created_at)
                            .utcOffset("+05:30")
                            .format("DD MMM YY")
                        : "-"}
                    </div>
                    <div className="text-xs opacity-75">
                      {item.created_at
                        ? moment(item.created_at)
                            .utcOffset("+05:30")
                            .format("HH:mm")
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compact Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1 pt-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: totalPages }, (_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === currentPage;
                const shouldShow =
                  pageNum <= 3 ||
                  pageNum === totalPages ||
                  pageNum === currentPage ||
                  pageNum === currentPage - 1 ||
                  pageNum === currentPage + 1;

                if (!shouldShow) {
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={i} className="px-2 py-1 text-gray-400 text-sm">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <a
                    key={i}
                    href={`?page=${pageNum}${search ? `&search=${search}` : ""}${startDate ? `&startDate=${startDate}` : ""}${endDate ? `&endDate=${endDate}` : ""}`}
                    className={cn(
                      "px-3 py-1.5 rounded text-sm font-medium transition-all duration-200",
                      isCurrent
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                    )}
                  >
                    {pageNum === totalPages ? "Last" : pageNum}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =======================
// Compact Search & Filter Bar
// =======================
function ModernSearchBar({ search, startDate, endDate }: { search: string; startDate?: string; endDate?: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <form method="get" className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <SearchIcon />
          </div>
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by name or contact..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        {/* Date Inputs */}
        <div className="flex gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <CalendarIcon />
            </div>
            <input
              type="date"
              name="startDate"
              defaultValue={startDate}
              className="pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <CalendarIcon />
            </div>
            <input
              type="date"
              name="endDate"
              defaultValue={endDate}
              className="pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <div className="flex items-center gap-2 text-sm">
            <FilterIcon />
            Search
          </div>
        </button>
      </form>
    </div>
  );
}

// =======================
// Main Page Component
// =======================
export default async function ModernTransactionPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; startDate?: string; endDate?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full mx-auto space-y-5">
        {/* Search Bar */}
        <ModernSearchBar search={search} startDate={startDate} endDate={endDate} />

        {/* Transactions */}
        <Suspense fallback={<ModernTransactionsSkeleton />}>
          <ModernPaymentTransactionsTable 
            page={page} 
            search={search} 
            startDate={startDate} 
            endDate={endDate} 
          />
        </Suspense>
      </div>
    </div>
  );
}