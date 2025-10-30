// src/components/transactions/ManualCard.tsx
import Link from "next/link";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import { GlassBadge } from "@/components/GlassUI/GlassBadge";
import { ThumbsUp, ThumbsDown, User } from "lucide-react";

function getStatusVariant(status: string): "emerald" | "amber" | "rose" {
  switch (status) {
    case "success":
      return "emerald";
    case "pending":
      return "amber";
    default:
      return "rose";
  }
}

export function ManualCard({
  item,
  onApproveAction,
  onRejectAction,
  formatDate,
  formatTime,
}: {
  item: {
    id: number;
    userId: number;
    amount: number;
    paymentMode: string;
    paymentReference: string | null;
    paymentStatus: string;
    created_at: string | null;
    user?: { name: string | null; contactNo: string | null };
  };
  onApproveAction: (fd: FormData) => Promise<void>;
  onRejectAction: (fd: FormData) => Promise<void>;
  formatDate: (d?: string | null) => string;
  formatTime: (d?: string | null) => string;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: user */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center border border-white/50 dark:border-white/10">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <Link
              href={`/customers/${item.userId}`}
              target="_blank"
              className="font-semibold text-slate-900 dark:text-white text-sm capitalize hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:underline block truncate"
            >
              {item.user?.name || "Unknown User"}
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Link
                href={`/customers/${item.userId}`}
                target="_blank"
                className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
              >
                {item.user?.contactNo || "--"}
              </Link>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="font-mono">#{item.id}</span>
            </p>
          </div>
        </div>

        {/* Right: amount / status / date / actions */}
        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <div className="text-base font-bold text-slate-900 dark:text-white">₹{Number(item.amount).toFixed(2)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{item.paymentMode || "N/A"}</div>
          </div>

          <div className="text-center min-w-24">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Ref ID</div>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
              {item.paymentReference ? (
                <span className="truncate block">
                  {item.paymentReference.length > 12 ? `${item.paymentReference.slice(0, 12)}...` : item.paymentReference}
                </span>
              ) : (
                "--"
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 min-w-32">
            <GlassBadge variant={getStatusVariant(item.paymentStatus)}>{item.paymentStatus?.toUpperCase() || "N/A"}</GlassBadge>
            <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
              <div className="font-medium">{formatDate(item.created_at)}</div>
              <div className="opacity-75">{formatTime(item.created_at)}</div>
            </div>
          </div>

          <div className="flex gap-2 min-w-24">
            {item.paymentStatus === "pending" ? (
              <>
                <form action={onApproveAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="status" value="success" />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                    title="Mark as Success"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                </form>
                <form action={onRejectAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="status" value="failed" />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
                    title="Mark as Failed"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

ManualCard.Empty = function Empty() {
  return (
    <GlassCard className="py-16" hover={false}>
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
          <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No manual payments found</h3>
        <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
      </div>
    </GlassCard>
  );
};
