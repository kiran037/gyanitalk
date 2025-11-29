import { useState, useEffect } from "react";
import { ArrowUpCircle, ArrowDownCircle, History } from "lucide-react";
import { Button } from "@/components/adminUI/Button";

interface Transaction {
  id: number;
  amount: string;
  transactionType: string | null;
  transactionId: string | null;
  isCredit: boolean | null;
  orderId: string | null;
  orderType: string | null;
  astrologerName: string | null;
  createdAt: Date;
}

interface TransactionsTabProps {
  customerId: string;
}

export default function TransactionsTab({ customerId }: TransactionsTabProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ totalCredit: "0", totalDebit: "0", netAmount: "0" });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");

  useEffect(() => {
    fetchTransactions();
  }, [page, filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const filterParam = filter !== "all" ? `&type=${filter}` : "";
      const response = await fetch(`/api/customers/${customerId}/transactions?page=${page}&limit=50${filterParam}`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data.transactions);
        setSummary(data.data.summary);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-300">Total Credit</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            ₹{parseFloat(summary.totalCredit).toFixed(2)}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-300">Total Debit</span>
          </div>
          <p className="text-2xl font-bold text-red-900 dark:text-red-100">
            ₹{parseFloat(summary.totalDebit).toFixed(2)}
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Net Amount</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            ₹{parseFloat(summary.netAmount).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setFilter("all"); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === "all"
              ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => { setFilter("credit"); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === "credit"
              ? "bg-green-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Credit
        </button>
        <button
          onClick={() => { setFilter("debit"); setPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === "debit"
              ? "bg-red-500 text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          }`}
        >
          Debit
        </button>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Transactions</h3>
          <p className="text-gray-600 dark:text-gray-400">No transactions found for the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((txn) => (
            <div
              key={txn.id}
              className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    txn.isCredit
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {txn.isCredit ? (
                    <ArrowUpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {txn.transactionType || "Transaction"}
                  </p>
                  {txn.astrologerName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{txn.astrologerName}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(txn.createdAt)}</p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    txn.isCredit
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {txn.isCredit ? "+" : "-"}₹{parseFloat(txn.amount).toFixed(2)}
                </p>
                {txn.transactionId && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {txn.transactionId.substring(0, 12)}...
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}