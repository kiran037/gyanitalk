// // components/details/notification.tsx
"use client";

import { format } from "date-fns";
import { GlassCard } from "@/components/GlassUI/GlassKit";

export default function NoitificationsList({ noitifications = [] }: { noitifications?: any[] }) {
  return (
    <div className="p-6">
      <GlassCard>
        <div className="relative px-4 pt-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Recent alerts and messages</p>
        </div>

        <div className="relative grid grid-cols-4 gap-3 border-t border-white/60 dark:border-white/10 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <div>#</div><div>Title</div><div>Description</div><div className="text-right">Date</div>
        </div>

        <div className="relative divide-y divide-white/60 dark:divide-white/10">
          {noitifications.length ? (
            noitifications.map((n, i) => {
              const date = n?.created_at ? format(new Date(n.created_at), "dd MMM yyyy, hh:mm a") : "N/A";
              return (
                <div key={n.id} className="grid grid-cols-4 items-start gap-3 px-4 py-3 text-sm">
                  <div className="text-slate-500 dark:text-slate-400">{i + 1}</div>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-slate-900 dark:text-white">{n.title || "Untitled"}</div>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-slate-700 dark:text-slate-300">{n.description || "-"}</div>
                  </div>
                  <div className="text-right text-slate-500 dark:text-slate-400">{date}</div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No notifications found.</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
