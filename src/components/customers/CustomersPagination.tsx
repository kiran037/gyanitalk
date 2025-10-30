// src/components/customers/CustomersPagination.tsx
"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildPageHref } from "./utils";
import { GlassCard } from "@/components/GlassUI/GlassKit";

export default function CustomersPagination({
  totalPages,
  currentPage,
  search,
  startDate,
  endDate,
}: {
  totalPages: number;
  currentPage: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </p>

        <div className="flex items-center gap-1">
          {currentPage > 1 && (
            <Link
              href={buildPageHref({
                page: currentPage - 1,
                search: search ?? null,
                startDate: startDate ?? null,
                endDate: endDate ?? null,
              })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.09] transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Prev
            </Link>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => {
              const pageNum = i + 1;
              const isCurrent = pageNum === currentPage;
              const show =
                pageNum <= 3 || pageNum === totalPages || pageNum === currentPage || pageNum === currentPage - 1 || pageNum === currentPage + 1;

              if (!show) {
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={i} className="px-1 text-slate-400 text-sm">
                      …
                    </span>
                  );
                }
                return null;
              }

              return (
                <Link
                  key={i}
                  href={buildPageHref({
                    page: pageNum,
                    search: search ?? null,
                    startDate: startDate ?? null,
                    endDate: endDate ?? null,
                  })}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-xl font-medium transition text-sm",
                    isCurrent
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                      : "bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.09]"
                  )}
                >
                  {pageNum}
                </Link>
              );
            })}
          </div>

          {currentPage < totalPages && (
            <Link
              href={buildPageHref({
                page: currentPage + 1,
                search: search ?? null,
                startDate: startDate ?? null,
                endDate: endDate ?? null,
              })}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm bg-white/60 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/[0.09] transition"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
