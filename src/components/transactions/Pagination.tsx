// src/components/transactions/Pagination.tsx
import { GlassCard } from "@/components/GlassUI/GlassKit";
import { cn } from "@/lib/utils";

export function Pagination({
  totalPages,
  currentPage,
  buildHref,
}: {
  totalPages: number;
  currentPage: number;
  buildHref: (pageNum: number) => string;
}) {
  return (
    <div className="flex justify-center pt-4">
      <GlassCard className="p-2" hover={false}>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            const isCurrent = pageNum === currentPage;
            const shouldShow =
              pageNum <= 3 ||
              pageNum === totalPages ||
              pageNum === currentPage ||
              pageNum === currentPage - 1 ||
              pageNum === currentPage + 1;

            if (!shouldShow) {
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <span key={i} className="px-2 py-1 text-slate-400 text-sm">
                    …
                  </span>
                );
              }
              return null;
            }

            return (
              <a
                key={i}
                href={buildHref(pageNum)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isCurrent
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)]"
                    : "text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/[0.08]"
                )}
              >
                {pageNum === totalPages ? "Last" : pageNum}
              </a>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
