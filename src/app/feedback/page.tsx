// src/app/feedback/page.tsx
"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { GlassCard, glass, cx } from "@/components/GlassUI/GlassKit";
import FeedbackTable from "@/components/feedback/FeedbackTable";

function FeedbackPageInner() {
  const sp = useSearchParams();
  const page = useMemo(() => parseInt(sp.get("page") || "1", 10), [sp]);
  const search = useMemo(() => sp.get("search") || "", [sp]);
  const startDate = useMemo(() => sp.get("startDate") || undefined, [sp]);
  const endDate = useMemo(() => sp.get("endDate") || undefined, [sp]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full space-y-6 p-6 md:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback</h1>
        </div>

        {/* filters */}
        <GlassCard className="p-5">
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by user"
              className={cx(glass.input, "min-w-[240px]")}
            />
            <input
              type="date"
              name="startDate"
              defaultValue={startDate}
              className={glass.input}
            />
            <input
              type="date"
              name="endDate"
              defaultValue={endDate}
              className={glass.input}
            />

            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-3 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            >
              Search
            </button>

            {(search || startDate || endDate) && (
              <a
                href="?page=1"
                className={cx(glass.btnSecondary, "h-9")}
              >
                Clear
              </a>
            )}
          </form>
        </GlassCard>

        <Suspense fallback={<div className="p-8 text-center text-sm">Loading…</div>}>
          <FeedbackTable page={page} search={search} startDate={startDate} endDate={endDate} />
        </Suspense>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <FeedbackPageInner />
    </Suspense>
  );
}
