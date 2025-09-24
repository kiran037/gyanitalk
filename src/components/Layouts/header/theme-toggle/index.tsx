
"use client";

import { useEffect, useState, KeyboardEvent } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const SIZE_MAP: Record<
  Size,
  { track: string; knob: string; translate: string }
> = {
  sm: { track: "h-7 w-12 p-1", knob: "h-5 w-5", translate: "translate-x-5" },
  md: { track: "h-9 w-16 p-1", knob: "h-7 w-7", translate: "translate-x-7" },
  lg: { track: "h-10 w-20 p-1", knob: "h-8 w-8", translate: "translate-x-10" },
};

export function ThemeToggleSwitch({
  size = "md",
  className,
  label = "Toggle theme",
}: {
  size?: Size;
  className?: string;
  label?: string;
}) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md animate-pulse",
          SIZE_MAP[size].track,
          className
        )}
      />
    );
  }

  const isDark = (resolvedTheme || theme) === "dark";
  const toggle = () => setTheme(isDark ? "light" : "dark");
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const SZ = SIZE_MAP[size];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggle}
      onKeyDown={onKeyDown}
      className={cn(
        "group relative inline-flex items-center rounded-full outline-none",
        "backdrop-blur-xl border border-white/35 dark:border-white/10",
        "transition-[box-shadow,background] duration-300",
        // OS-like frosted track with subtle tint shift
        isDark
          ? "bg-slate-900/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.35)]"
          : "bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_rgba(2,6,23,0.08)]",
        "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_28px_rgba(2,6,23,0.14)]",
        "focus-visible:ring-2 focus-visible:ring-sky-300/60 dark:focus-visible:ring-sky-500/40",
        SZ.track,
        className
      )}
      data-state={isDark ? "on" : "off"}
    >
      {/* single, soft hover sweep */}
      <span aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
        <span
          className={cn(
            "absolute -left-full top-0 h-full w-1/2",
            "bg-gradient-to-r from-white/0 via-white/35 to-white/0",
            "transition-transform duration-700",
            "group-hover:translate-x-[220%]"
          )}
        />
      </span>

      {/* faint inner bevel for track */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-[1px] rounded-full",
          isDark
            ? "bg-gradient-to-b from-white/5 via-transparent to-black/20"
            : "bg-gradient-to-b from-white/70 via-white/30 to-white/10"
        )}
      />

      {/* Glass knob (neutral — no sun/moon) */}
      <span
        aria-hidden
        className={cn(
          "relative z-10 rounded-full transition-transform duration-300 will-change-transform",
          SZ.knob,
          isDark ? SZ.translate : "translate-x-0",
          // neutral glass with inner shadow + subtle edge
          "bg-white/90 dark:bg-slate-200/90 backdrop-blur-md",
          "shadow-[inset_0_-1px_0_rgba(0,0,0,0.12),0_6px_12px_rgba(2,6,23,0.25)]",
          "border border-white/70 dark:border-white/20"
        )}
      >
        {/* tiny gloss highlight (OS style) */}
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full",
            "bg-[radial-gradient(120%_70%_at_10%_0%,rgba(255,255,255,0.9),rgba(255,255,255,0)_60%)]",
            "opacity-70"
          )}
        />
      </span>

      {/* subtle outer glow that shifts with theme */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full transition-shadow duration-300",
          isDark
            ? "shadow-[0_0_20px_rgba(56,189,248,0.15)]"
            : "shadow-[0_0_20px_rgba(255,255,255,0.35)]"
        )}
      />
    </button>
  );
}
