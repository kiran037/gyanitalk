// src/components/GlassUI/GlassKit.tsx
import React from "react";

export const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

export const glass = {
  // Card / container
  surface:
    // box
    "relative isolate overflow-hidden rounded-3xl border " +
    // LIGHT: stronger border + higher white for contrast
    "border-slate-200 bg-white/90 " +
    // When blur is supported, soften the fill (keeps border readable)
    "supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-125 " +
    // DARK
    "dark:border-white/10 dark:bg-white/[0.06] dark:supports-[backdrop-filter]:bg-white/[0.06] dark:supports-[backdrop-filter]:backdrop-blur-2xl " +
    // shadow (subtle)
    "shadow-[0_8px_28px_rgba(16,24,40,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.40)]",

  // Hover depth (kept minimal so it doesn’t glow/halo)
  lift:
    "transition-[box-shadow,transform,background-color] duration-200 ease-out " +
    "hover:shadow-[0_14px_40px_rgba(16,24,40,0.10)] dark:hover:shadow-[0_18px_60px_rgba(0,0,0,0.55)] " +
    "hover:bg-white/95 supports-[backdrop-filter]:hover:bg-white/75",

  // Inputs (clear border + solid fill in light mode)
  input:
    "rounded-2xl border px-4 py-2.5 text-sm outline-none " +
    // LIGHT
    "border-slate-200 bg-white text-slate-900 " +
    // DARK
    "dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-100 " +
    // focus
    "focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0 ",

  // Primary button (unchanged look)
  btnPrimary:
    "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 " +
    "px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] " +
    "transition hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",

  // Secondary button (solid in light, glass in dark)
  btnSecondary:
    "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition " +
    // LIGHT
    "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 " +
    // DARK
    "dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.10] " +
    // focus
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40",

  chipOn:
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold " +
    "bg-emerald-500 text-white border border-emerald-400/70 shadow-sm",

  chipOff:
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold " +
    "bg-rose-500 text-white border border-rose-400/70 shadow-sm",
};

export function GlassCard({
  children,
  className = "",
  hover = true,
}: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return <div className={cx(glass.surface, hover && glass.lift, className)}>{children}</div>;
}
