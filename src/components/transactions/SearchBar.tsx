// src/components/transactions/SearchBar.tsx
import { GlassCard } from "@/components/GlassUI/GlassKit";
import { Search, Calendar, Filter } from "lucide-react";

type Option = { label: string; value: string };

export function SearchBar({
  search,
  startDate,
  endDate,
  placeholder = "Search…",
  statusValue,
  statusOptions, // provide to show status select
}: {
  search: string;
  startDate?: string;
  endDate?: string;
  placeholder?: string;
  statusValue?: string;
  statusOptions?: Option[];
}) {
  return (
    <GlassCard className="p-5" hover={false}>
      <form method="get" className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="search"
              defaultValue={search}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Optional status */}
        {statusOptions?.length ? (
          <div className="relative w-full sm:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
            <select
              name="status"
              defaultValue={statusValue ?? ""}
              className="w-full pl-10 pr-8 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 appearance-none cursor-pointer"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        ) : null}

        {/* Dates */}
        <div className="flex gap-2">
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              name="startDate"
              defaultValue={startDate}
              className="pl-10 pr-3 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              name="endDate"
              defaultValue={endDate}
              className="pl-10 pr-3 py-2.5 text-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
        >
          <Filter className="w-4 h-4" />
          Search
        </button>
      </form>
    </GlassCard>
  );
}
