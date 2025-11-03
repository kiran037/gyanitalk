// // components/details/walletHistory.tsx
"use client";

import { format } from "date-fns";
import { GlassCard } from "@/components/GlassUI/GlassKit";

export default function WalletTransactionList({
  transactions,
  isUser,
}: {
  transactions: any[];
  isUser: boolean;
}) {
  return (
    <div className="p-6">
      <GlassCard>
        <div className="relative px-4 pt-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Wallet Transactions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Credits & debits from sessions/orders</p>
        </div>

        <div className="relative grid grid-cols-4 gap-3 border-t border-white/60 dark:border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <div>Title</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Total Min</div>
          <div className="text-right">Date</div>
        </div>

        <div className="relative divide-y divide-white/60 dark:divide-white/10">
          {transactions?.length ? (
            transactions.map((txn) => {
              const type = txn?.transactionType || "-";
              const name =
                isUser === true
                  ? txn?.order_request?.astrologer?.name || txn?.order_request?.aiAstrologer?.name
                  : txn?.order_request?.user?.name || "Unknown";
              const title = name && type ? `${name} → ${type}` : name || type || "-";
              const isCredit = Number(txn?.isCredit) === 1;
              const date = txn?.created_at ? format(new Date(txn.created_at), "dd MMM yyyy, hh:mm a") : "N/A";

              return (
                <div key={txn.id} className="grid grid-cols-4 items-center gap-3 px-4 py-3 text-sm text-slate-800 dark:text-slate-200">
                  <div className="truncate">{title}</div>
                  <div className={["text-right font-semibold tabular-nums", isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"].join(" ")}>
                    {isCredit ? "+ " : "- "}₹{txn?.amount || 0}
                  </div>
                  <div className="text-right">{txn?.order_request?.totalMin || 0} min</div>
                  <div className="text-right text-slate-500 dark:text-slate-400">{date}</div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No transactions found.</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
