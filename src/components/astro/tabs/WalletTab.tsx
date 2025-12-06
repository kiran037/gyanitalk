"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import { Button } from "@/components/adminUI/Button";
import { Wallet, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { motion } from "framer-motion";

export function WalletTab({ astrologerId }: { astrologerId: string }) {
  const addToast = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ walletBalance: "0", totalCredit: "0", totalDebit: "0" });

  useEffect(() => {
    fetchWalletTransactions();
  }, [astrologerId, pagination.page]);

  const fetchWalletTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/astrologers/${astrologerId}/wallet-transactions?page=${pagination.page}&limit=${pagination.limit}`
      );
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data);
        setPagination(data.pagination);
        setStats(data.stats);
      }
    } catch (error) {
      addToast("error", "Error", "Failed to fetch wallet transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{stats.walletBalance}
          </p>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Credit</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{stats.totalCredit}
          </p>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Debit</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₹{stats.totalDebit}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Transaction History
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Transactions
          </h3>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {tx.isCredit ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {tx.transactionType || "Transaction"}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(tx.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    tx.isCredit
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {tx.isCredit ? "+" : "-"}₹{tx.amount}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}