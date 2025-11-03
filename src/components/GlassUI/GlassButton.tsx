///Users/xeoren/gyanitallk-admin/src/components/GlassUI/GlassButton.tsx
"use client";

import { cx } from "./GlassKit";

export default function GlassButton({
  children,
  onClick,
  type = "button",
  icon: Icon,
  variant = "primary",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  icon?: React.ElementType;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const variants: Record<string, string> = {
    primary:
      "text-white bg-gradient-to-r from-blue-600 to-purple-600 " +
      "hover:from-blue-700 hover:to-purple-700 " +
      "shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
    secondary:
      "text-slate-900 dark:text-white bg-white/70 dark:bg-white/[0.08] " +
      "border border-white/30 dark:border-white/10 " +
      "hover:bg-white/90 dark:hover:bg-white/[0.12]",
    ghost:
      "text-slate-700 dark:text-slate-300 bg-transparent " +
      "hover:bg-white/50 dark:hover:bg-white/[0.08] border border-transparent",
    danger:
      "text-white bg-gradient-to-r from-red-500 to-rose-600 " +
      "hover:from-red-600 hover:to-rose-700 " +
      "shadow-[0_8px_20px_rgba(239,68,68,0.25)]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      className={cx(
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
        "transition-all will-change-transform",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        // nice focus ring
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2",
        variants[variant],
        className
      )}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}
