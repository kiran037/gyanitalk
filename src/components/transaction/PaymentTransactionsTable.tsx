// components/transaction/PaymentTransactionsTable.tsx
import { ChevronLeft, ChevronRight, ExternalLink, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { avatar } from "@/lib/images";

interface PaymentTransaction {
  id: number;
  paymentMode: string | null;
  paymentReference: string | null;
  attachment: string | null;
  amount: number | null;
  paymentStatus: string | null;
  orderId: string | null;
  cashback_amount: number | null;
  type: string | null;
  created_at: string | null;
  user: {
    name: string;
    profile: string | null;
    contactNo: string;
  } | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PaymentTransactionsTableProps {
  transactions: PaymentTransaction[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export default function PaymentTransactionsTable({
  transactions,
  loading,
  pagination,
  onPageChange,
}: PaymentTransactionsTableProps) {
  const getStatusBadge = (status: string | null) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      success: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-400" },
      pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-800 dark:text-yellow-400" },
      failed: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-400" },
    };

    const config = statusConfig[status || ""] || statusConfig.pending;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {status || "N/A"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 dark:bg-gray-900/20">
            <tr>
              {["User", "Amount", "Cashback", "Mode", "Status", "Reference", "Date"].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                {[1, 2, 3, 4, 5, 6, 7].map((j) => (
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
    return <div className="text-center py-12"><p className="text-gray-500 dark:text-gray-400">No payments found</p></div>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 dark:bg-gray-900/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Cashback</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={avatar(txn.user?.profile)} alt={txn.user?.name || "User"} className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{txn.user?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{txn.user?.contactNo || "N/A"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                  ₹{txn.amount?.toLocaleString() || 0}
                </td>
                <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400">
                  {txn.cashback_amount ? `₹${txn.cashback_amount}` : "-"}
                </td>
                <td className="px-6 py-4 text-sm capitalize text-gray-900 dark:text-white">{txn.paymentMode || "N/A"}</td>
                <td className="px-6 py-4">{getStatusBadge(txn.paymentStatus)}</td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{txn.paymentReference || "-"}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {txn.created_at && format(new Date(txn.created_at), "MMM dd, yyyy")}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {txn.created_at && format(new Date(txn.created_at), "hh:mm a")}
                    </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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