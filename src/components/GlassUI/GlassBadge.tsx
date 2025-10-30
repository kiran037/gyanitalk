// components/GlassUI/GlassBadge.tsx
"use client";

import { cx } from "./GlassKit";

type Variant =
  | "emerald"
  | "rose"
  | "blue"
  | "amber"
  | "slate";

const tone: Record<Variant, string> = {
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  rose:    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  blue:    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  amber:   "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  slate:   "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
};

export function GlassBadge({
  children,
  variant = "slate",
  className = "",
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// helper to map common status strings
export function statusToVariant(s?: string): Variant {
  switch (s) {
    case "Completed":
    case "Confirmed":
      return "emerald";
    case "Rejected":
      return "rose";
    case "Accepted":
      return "blue";
    case "Pending":
      return "amber";
    default:
      return "slate";
  }
}
