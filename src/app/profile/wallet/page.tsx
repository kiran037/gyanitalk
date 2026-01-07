"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  History,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// Helper: Safely format transaction date
const formatTransactionDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "Date unavailable";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function WalletPage() {
  const [walletInfo, setWalletInfo] = useState<{
    balance: number;
    total_credited: number;
    total_debited: number;
    recent_transactions: Array<{
      id: number;
      amount: number;
      transactionType: string | null;
      isCredit: boolean;
      created_at: string;
    }>;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const res = await fetch("/api/landing/profile/wallet");
        const json = await res.json();

        if (json.success && json.data) {
          setWalletInfo(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
        <p className="text-gray-500 text-lg">Loading your wallet...</p>
      </div>
    );
  }

  if (!walletInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load wallet information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-5xl mx-auto px-4 md:px-0">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/profile"
          className="lg:hidden p-3 rounded-xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all shadow-sm"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Link>

        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            My Wallet
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            View balance and transaction history
          </p>
        </div>
      </div>

      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6B35] via-[#FF8F50] to-[#FFB347] p-6 md:p-8 text-white shadow-2xl shadow-orange-500/20"
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur border border-white/10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active
            </span>
          </div>
          <CreditCard className="h-8 w-8 opacity-80" />
        </div>

        <div className="relative z-10 mt-8">
          <p className="text-white/80 text-sm md:text-base font-medium">
            Available Balance
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 tracking-tight">
            ₹{walletInfo.balance.toFixed(2)}
          </h2>
        </div>

        <div className="relative z-10 mt-10">
          <button className="w-full flex items-center justify-center gap-3 bg-white text-[#FF6B35] font-bold py-4 rounded-2xl shadow-lg hover:bg-gray-50 active:scale-95 transition-all text-base">
            <Plus className="h-5 w-5" />
            Add Money
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Credited</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ₹{walletInfo.total_credited.toFixed(2)}
            </p>
          </div>
          <div className="h-12 w-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center">
            <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ₹{walletInfo.total_debited.toFixed(2)}
            </p>
          </div>
          <div className="h-12 w-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center">
            <ArrowDownLeft className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm"
      >
        <div className="p-5 md:p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-[#FF6B35]" />
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              Recent Transactions
            </h2>
          </div>
          <Link
            href="/profile/wallet/transactions"
            className="text-sm font-bold text-[#FF6B35] hover:text-[#e55a2b] transition-colors uppercase tracking-wide"
          >
            View All
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {walletInfo.recent_transactions.length > 0 ? (
            walletInfo.recent_transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      txn.isCredit
                        ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {txn.isCredit ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {txn.transactionType || "Wallet Transaction"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTransactionDate(txn.created_at)}
                    </p>
                  </div>
                </div>

                <p
                  className={`font-bold text-lg ${
                    txn.isCredit
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {txn.isCredit ? "+" : "-"}₹{txn.amount.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              No transactions yet
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}