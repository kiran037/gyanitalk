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
const formatTransactionDate = (
  dateString: string | null | undefined,
): string => {
  if (!dateString) return "Date unavailable";
  const date = new Date(dateString);
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#FF6B35]" />
        <p className="text-lg text-gray-500">Loading your wallet...</p>
      </div>
    );
  }

  if (!walletInfo) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Unable to load wallet information.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 md:space-y-8 md:px-0">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/profile"
          className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#111] dark:hover:bg-white/5 lg:hidden"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            My Wallet
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 md:text-base">
            View balance and transaction history
          </p>
        </div>
      </div>

      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF6B35] via-[#FF8F50] to-[#FFB347] p-6 text-white shadow-2xl shadow-orange-500/20 md:p-8"
      >
        <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
        <div className="absolute right-0 top-0 h-72 w-72 -translate-y-1/2 translate-x-1/3 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/20 px-4 py-1.5 backdrop-blur">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active
            </span>
          </div>
          <CreditCard className="h-8 w-8 opacity-80" />
        </div>

        <div className="relative z-10 mt-8">
          <p className="text-sm font-medium text-white/80 md:text-base">
            Available Balance
          </p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            ₹{walletInfo.balance.toFixed(2)}
          </h2>
        </div>

        <div className="relative z-10 mt-10">
          {/* LINK TO THE NEW PAGE */}
          <Link
            href="/profile/recharge"
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white py-4 text-base font-bold text-[#FF6B35] shadow-lg transition-all hover:bg-gray-50 active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Add Money
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111]"
        >
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Credited
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              ₹{walletInfo.total_credited.toFixed(2)}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/20">
            <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-[#111]"
        >
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Spent
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              ₹{walletInfo.total_debited.toFixed(2)}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
            <ArrowDownLeft className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-[#111]"
      >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5 dark:border-white/5 dark:bg-white/5 md:p-6">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-[#FF6B35]" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Transactions
            </h2>
          </div>
          <Link
            href="/profile/wallet/transactions"
            className="text-sm font-bold uppercase tracking-wide text-[#FF6B35] transition-colors hover:text-[#e55a2b]"
          >
            View All
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {walletInfo.recent_transactions.length > 0 ? (
            walletInfo.recent_transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                      txn.isCredit
                        ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {txn.isCredit ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {txn.transactionType || "Wallet Transaction"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatTransactionDate(txn.created_at)}
                    </p>
                  </div>
                </div>

                <p
                  className={`text-lg font-bold ${
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