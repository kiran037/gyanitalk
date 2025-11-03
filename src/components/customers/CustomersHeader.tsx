// src/components/customers/CustomersHeader.tsx
"use client";

import { Users, Wallet } from "lucide-react";
import { GlassCard, glass } from "@/components/GlassUI/GlassKit";

export default function CustomersHeader({
  total,
  onOpenAddMoney,
}: {
  total: number;
  onOpenAddMoney: () => void;
}) {
  return (
    <GlassCard className="p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent pointer-events-none" />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="inline-flex w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-200" />
              <span className="inline-flex w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
              Customer Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Manage and track your customer relationships</p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/[0.06] backdrop-blur-xl shadow-sm">
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Total: {total} customers
            </span>

            <div className="ml-3" />

            <button
              onClick={onOpenAddMoney}
              className={glass.btnPrimary}
              title="Add money to a customer's wallet"
            >
              <Wallet className="h-4 w-4" />
              Add Money
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
