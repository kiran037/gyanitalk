// components/transaction/WalletTransactionsTable.tsx
import { ChevronLeft, ChevronRight, ArrowUpCircle, ArrowDownCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { avatar } from "@/lib/images";

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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface WalletTransactionsTableProps {
  transactions: WalletTransaction[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function WalletTransactionsTable({
  transactions,
  loading,
  pagination,
  onPageChange,
}: WalletTransactionsTableProps) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 dark:bg-gray-900/20">
            <tr>
              {["User", "Amount", "Type", "Transaction Type", "Related To", "Date & Time"].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 dark:bg-gray-900/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transaction Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Related To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date & Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors"
              >
                {/* User */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar(transaction.user?.profile)}
                      alt={transaction.user?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.user?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.user?.contactNo || transaction.user?.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {transaction.isCredit ? (
                      <ArrowUpCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        transaction.isCredit
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                     {transaction.isCredit ? "+" : "-"}₹{(transaction.amount ?? 0).toLocaleString()}

                    </span>
                  </div>
                </td>

                {/* Type */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      transaction.isCredit
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {transaction.isCredit ? "Credit" : "Debit"}
                  </span>
                </td>

                {/* Transaction Type */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-900 dark:text-white capitalize">
                    {transaction.transactionType?.replace(/_/g, " ") || "N/A"}
                  </span>
                </td>

                {/* Related To */}
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {transaction.astrologer && (
                      <p className="text-gray-900 dark:text-white">
                        {transaction.astrologer.name}
                      </p>
                    )}
                    {transaction.ai_astrologer && (
                      <p className="text-gray-900 dark:text-white">
                        {transaction.ai_astrologer.name} (AI)
                      </p>
                    )}
                    {transaction.orderId && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        Order #{transaction.orderId}
                      </p>
                    )}
                    {!transaction.astrologer && !transaction.ai_astrologer && !transaction.orderId && (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>

                {/* Date & Time */}
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {format(new Date(transaction.created_at), "MMM dd, yyyy")}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(transaction.created_at), "hh:mm a")}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}