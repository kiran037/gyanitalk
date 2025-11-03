// src/components/transactions/WalletCard.tsx
import Image from "next/image";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import { GlassBadge } from "@/components/GlassUI/GlassBadge";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidImageUrl } from "@/components/functions";

function creditVariant(isCredit: boolean): "emerald" | "rose" {
  return isCredit ? "emerald" : "rose";
}
function amountTint(isCredit: boolean) {
  return isCredit
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";
}

export function WalletCard({
  item,
  formatDate,
  formatTime,
}: {
  item: any;
  formatDate: (d?: string | null) => string;
  formatTime: (d?: string | null) => string;
}) {
  const isCredit = !!item.isCredit;

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/50 dark:ring-white/10">
              <Image
                src={
                  isValidImageUrl(item?.user?.profile)
                    ? `${process.env.NEXT_PUBLIC_BASEURL}${item?.user?.profile}`
                    : "https://gyanitalk.com/build/assets/images/person.png"
                }
                alt={item?.user?.name || "User"}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center",
                isCredit ? "bg-emerald-500" : "bg-rose-500"
              )}
              title={isCredit ? "Credit" : "Debit"}
            >
              <User className="w-3 h-3 text-white" />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
              {item?.user?.name || "Unknown User"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">
              {item.transactionType || "Wallet Transaction"}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <div className={cn("text-base font-bold", amountTint(isCredit))}>
              {isCredit ? "+" : "-"}₹{Number(item.amount).toFixed(2)}
            </div>
            {typeof item.balance_after !== "undefined" && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Balance: ₹{Number(item.balance_after).toFixed(2)}
              </div>
            )}
          </div>

          <div className="min-w-24 text-right">
            <GlassBadge variant={creditVariant(isCredit)}>{isCredit ? "CREDIT" : "DEBIT"}</GlassBadge>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 text-right min-w-28">
            <div className="font-medium">{formatDate(item.created_at)}</div>
            <div className="opacity-75">{formatTime(item.created_at)}</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

WalletCard.Empty = function Empty() {
  return (
    <GlassCard className="py-16" hover={false}>
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No transactions found</h3>
        <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or date filters.</p>
      </div>
    </GlassCard>
  );
};
