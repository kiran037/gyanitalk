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
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

// Helper: Safely format transaction date
const formatTransactionDate = (dateString: string | null | undefined): string => {
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  if (!walletInfo) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-gray-500">Unable to load wallet information.</p>
      </div>
    );
  }

  return (
    // Removed pb-8 to fix excessive bottom margin
    <div className="mx-auto w-full max-w-4xl space-y-5 lg:space-y-8 lg:px-0">
      
      {/* 1. Header Section */}
      <div className="flex items-center gap-3 lg:gap-4 px-4 sm:px-0">
        <Link
          href="/profile"
          className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all active:scale-95 dark:border-white/10 dark:bg-[#1C1C1E] lg:hidden"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Link>

        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-3xl">
            My Wallet
          </h1>
          <p className="hidden text-sm text-gray-500 dark:text-gray-400 lg:block">
            View balance and transaction history
          </p>
        </div>
      </div>

      {/* 2. Wallet Card */}
      <div className="px-4 sm:px-0">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl lg:rounded-3xl bg-gradient-to-br from-[#FF6B35] via-[#FF8F50] to-[#FFB347] p-5 lg:p-8 text-white shadow-xl shadow-orange-500/20"
        >
            {/* Background Effects */}
            <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
            <div className="absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/3 rounded-full bg-white/10 blur-2xl lg:h-72 lg:w-72" />

            <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/20 px-3 py-1 backdrop-blur">
                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider lg:text-xs">
                    Active
                    </span>
                </div>
                <CreditCard className="h-6 w-6 opacity-80 lg:h-8 lg:w-8" />
            </div>

            <div className="relative z-10 mt-6 lg:mt-8">
                <p className="text-xs font-medium text-white/80 lg:text-base">Available Balance</p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight lg:text-5xl">
                    ₹{walletInfo.balance.toFixed(2)}
                </h2>
            </div>

            <div className="relative z-10 mt-6 lg:mt-10">
                <Link
                    href="/profile/recharge"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 lg:py-4 text-sm lg:text-base font-bold text-[#FF6B35] shadow-lg transition-transform active:scale-[0.98]"
                >
                    <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
                    Add Money
                </Link>
            </div>
        </motion.div>
      </div>

      {/* 3. Stats Grid (Compact) */}
      <div className="grid grid-cols-2 gap-3 px-4 sm:px-0 lg:gap-4">
        <div className="flex flex-col justify-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#1C1C1E] lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 lg:text-sm lg:font-normal">Credited</p>
            <p className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white lg:text-2xl">
              ₹{walletInfo.total_credited.toFixed(2)}
            </p>
          </div>
          <div className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20 lg:mt-0 lg:h-12 lg:w-12 lg:rounded-2xl">
            <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400 lg:h-6 lg:w-6" />
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-[#1C1C1E] lg:flex-row lg:items-center lg:justify-between lg:p-6">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 lg:text-sm lg:font-normal">Spent</p>
            <p className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white lg:text-2xl">
              ₹{walletInfo.total_debited.toFixed(2)}
            </p>
          </div>
          <div className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 lg:mt-0 lg:h-12 lg:w-12 lg:rounded-2xl">
            <ArrowDownLeft className="h-4 w-4 text-red-600 dark:text-red-400 lg:h-6 lg:w-6" />
          </div>
        </div>
      </div>

      {/* 4. Transactions List (Tight Layout) */}
      <div className="px-4 sm:px-0">
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-[#1C1C1E]"
        >
            <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-white/5 dark:bg-white/5 lg:p-5">
                <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-[#FF6B35] lg:h-5 lg:w-5" />
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white lg:text-lg">
                    Recent Transactions
                    </h2>
                </div>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-white/5">
            {walletInfo.recent_transactions.length > 0 ? (
                walletInfo.recent_transactions.map((txn) => (
                <div
                    key={txn.id}
                    className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/5 lg:p-5"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full lg:rounded-2xl lg:h-12 lg:w-12 ${
                            txn.isCredit
                                ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                        >
                            {txn.isCredit ? (
                            <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5" />
                            ) : (
                            <ArrowDownLeft className="h-4 w-4 lg:h-5 lg:w-5" />
                            )}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-gray-900 dark:text-white lg:text-base">
                            {txn.transactionType || "Wallet Transaction"}
                            </p>
                            <p className="text-[10px] text-gray-500 lg:text-xs">
                            {formatTransactionDate(txn.created_at)}
                            </p>
                        </div>
                    </div>

                    <p
                    className={`text-sm font-bold lg:text-lg ${
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
                <div className="py-8 text-center text-xs text-gray-500 lg:text-sm">
                No transactions yet
                </div>
            )}
            </div>
        </motion.div>
      </div>
    </div>
  );
}