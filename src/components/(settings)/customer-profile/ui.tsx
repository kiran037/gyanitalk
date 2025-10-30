"use client";

import React from "react";

export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`
        relative rounded-2xl overflow-hidden
        bg-white/70 dark:bg-slate-800/50
        border border-slate-200/80 dark:border-white/10
        backdrop-blur-xl shadow-md
        transition-all duration-200
        hover:shadow-xl hover:-translate-y-0.5
        p-5 ${className}
      `}
    >
      {children}
    </div>
  );
}

export function GlowButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  loading,
  type = "button",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700",
    secondary:
      "bg-white/90 dark:bg-slate-700/70 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 hover:bg-white",
    ghost: "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-700/50",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium
        transition-all active:scale-[0.98]
        ${variants[variant]}
        ${disabled || loading ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02]"}
        ${className}
      `}
    >
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
