import Image from "next/image";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import moment from "moment";
import { getWalletTransactions } from "@/app/(transactions)/fetch";
import { isValidImageUrl } from "@/components/functions";

// ==============================
// Modern Breadcrumb Component
// ==============================
function ModernBreadcrumb({ pageName }: { pageName: string }) {
  return (
    <div className="flex items-center space-x-2 mb-8">
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
        <span className="hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer transition-colors">
          Dashboard
        </span>
        <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 dark:text-white font-medium">{pageName}</span>
      </div>
    </div>
  );
}

// ==============================
// Modern Loading Skeleton
// ==============================
function ModernTransactionsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// Modern Transaction Card Component
// ========================================
function TransactionCard({ item, index }: { item: any; index: number }) {
  return (
    <div 
      className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-gray-900/20 hover:-translate-y-1 animate-in slide-in-from-bottom-4 fade-in"
      style={{ 
        animationDelay: `${index * 50}ms`
      }}
    >
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Image
              src={
                isValidImageUrl(item?.user?.profile)
                  ? `${process.env.NEXT_PUBLIC_BASEURL}${item?.user?.profile}`
                  : "https://gyanitalk.com/build/assets/images/person.png"
              }
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-blue-200 dark:group-hover:ring-blue-800 transition-all duration-200"
              width={48}
              height={48}
              alt={item?.user?.name || "User"}
            />
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800",
              item.isCredit ? "bg-green-500" : "bg-red-500"
            )} />
          </div>
          
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item?.user?.name || "Unknown User"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {item.transactionType || "General Transaction"}
            </p>
          </div>
        </div>

        {/* Amount & Status */}
        <div className="text-right space-y-2">
          <div className="flex items-center space-x-3">
            <span className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
              item.isCredit 
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              <div className={cn(
                "w-1.5 h-1.5 rounded-full mr-1.5",
                item.isCredit ? "bg-green-500" : "bg-red-500"
              )} />
              {item.isCredit ? "Credit" : "Debit"}
            </span>
            
            <div className="text-right">
              <div className={cn(
                "text-lg font-bold",
                item.isCredit 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                {item.isCredit ? "+" : "-"}₹{Number(item.amount).toFixed(2)}
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {item.created_at
              ? moment(item.created_at).utcOffset("+05:30").format("MMM DD, YYYY • hh:mm A")
              : "Date unavailable"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ========================================
// Modern Pagination Component  
// ========================================
function ModernPagination({ 
  totalPages, 
  currentPage, 
  search, 
  startDate, 
  endDate 
}: {
  totalPages: number;
  currentPage: number;
  search: string;
  startDate?: string;
  endDate?: string;
}) {
  const buildUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    if (pageNum > 1) params.append('page', pageNum.toString());
    if (search) params.append('search', search);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center space-x-2 pt-8">
      {/* Previous Button */}
      {currentPage > 1 && (
        <a
          href={buildUrl(currentPage - 1)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </a>
      )}

      {/* Page Numbers */}
      <div className="flex space-x-1">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const isCurrent = pageNum === currentPage;
          const shouldShow =
            pageNum <= 3 ||
            pageNum === totalPages ||
            Math.abs(pageNum - currentPage) <= 1;

          if (!shouldShow) {
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return (
                <span key={i} className="px-3 py-2 text-gray-400 dark:text-gray-500">
                  ...
                </span>
              );
            }
            return null;
          }

          return (
            <a
              key={i}
              href={buildUrl(pageNum)}
              className={cn(
                "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                isCurrent
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
              )}
            >
              {pageNum}
            </a>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages && (
        <a
          href={buildUrl(currentPage + 1)}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-200"
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      )}
    </div>
  );
}

// ========================================
// Modern Transactions Table
// ========================================
export async function TransactionsTable({
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
  const result = await getWalletTransactions({
    page,
    limit,
    search,
    startDate,
    endDate,
  });

  const { records, totalPages, currentPage, summary } = result;

  // Use summary stats from the API (calculated from entire dataset)
  const totalCredits = summary?.totalCredits || 0;
  const totalDebits = summary?.totalDebits || 0;
  const netAmount = totalCredits - totalDebits;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Wallet Transactions
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track all wallet activities and transaction history
          </p>
        </div>

        <div className="flex items-center space-x-4">
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Total Credits</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{totalCredits.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">Total Debits</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">₹{totalDebits.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className={cn(
          "p-6 rounded-xl border",
          netAmount >= 0 
            ? "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
            : "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className={cn(
                "text-sm font-medium",
                netAmount >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
              )}>
                Net Balance
              </p>
              <p className={cn(
                "text-2xl font-bold",
                netAmount >= 0 ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300"
              )}>
                ₹{Math.abs(netAmount).toFixed(2)}
              </p>
            </div>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              netAmount >= 0 ? "bg-blue-500" : "bg-orange-500"
            )}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {records.length > 0 ? (
          records.map((item: any, index: number) => (
            <TransactionCard key={index} item={item} index={index} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No transactions found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or date filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <ModernPagination 
          totalPages={totalPages}
          currentPage={currentPage}
          search={search}
          startDate={startDate}
          endDate={endDate}
        />
      )}


    </div>
  );
}

// =======================
// Main Page Component
// =======================
export default async function TransactionPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; startDate?: string; endDate?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full mx-auto">
        <ModernBreadcrumb pageName="Wallet Transactions" />
        <Suspense fallback={<ModernTransactionsSkeleton />}>
          <TransactionsTable 
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