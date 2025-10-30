"use client";

import React from "react";
import { X } from "lucide-react";
import { GlowButton } from "./ui";

export default function CustomerProfileModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[2000] flex items-center justify-center px-4 py-8"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div
        className={`
          relative w-full max-w-md rounded-2xl overflow-hidden
          border border-slate-200/80 dark:border-white/10
          bg-white/85 dark:bg-slate-900/75 backdrop-blur-xl shadow-2xl
        `}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <GlowButton variant="ghost" onClick={onClose}>
            <X size={16} />
            <span className="sr-only">Close</span>
          </GlowButton>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
