// components/GlassUI/Segmented.tsx
"use client";

import { cx } from "./GlassKit";

export function Segmented({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (next: string) => void;
  options: readonly string[];
  className?: string;
}) {
  return (
    <div
      className={cx(
        "inline-flex items-center gap-1 rounded-xl p-1",
        "border border-white/50 dark:border-white/10",
        "bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl",
        className
      )}
    >
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={cx(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition",
              active
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/[0.08]"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
