
"use client";

import { Search } from "lucide-react";
import { cx } from "@/components/GlassUI/GlassKit";

export default function SearchInput({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void 
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or user ID..."
        className={cx(
          "w-full rounded-2xl border px-4 py-3 pl-10 text-sm outline-none",
          "border-slate-200 bg-white text-slate-900",
          "dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100",
          "focus:ring-2 focus:ring-blue-500/50"
        )}
      />
    </div>
  );
}