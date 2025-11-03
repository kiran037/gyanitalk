// src/components/customers/Meta.tsx
"use client";

import { cn } from "@/lib/utils";

export function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{value}</p>
    </div>
  );
}

export function MetaRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-slate-400 text-[10px] uppercase tracking-wide mb-1">{label}</p>
      <p
        className={cn(
          "font-medium",
          accent ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-700 dark:text-slate-300"
        )}
      >
        {value}
      </p>
    </div>
  );
}
