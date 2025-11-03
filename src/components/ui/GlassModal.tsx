"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function GlassModal({
  open,
  onClose,
  title,
  children,
  /** Optional: widen the modal */
  maxWidthClass = "max-w-3xl",
  /** Optional: add height or more classes to the panel (e.g., h-[86vh]) */
  panelClassName = "",
  /** Optional: remove default body padding so content can go full height */
  noBodyPadding = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidthClass?: string;
  panelClassName?: string;
  noBodyPadding?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={[
          "w-full rounded-3xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.08] backdrop-blur-2xl shadow-2xl overflow-hidden",
          maxWidthClass,
          panelClassName,
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/[0.06]">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title ?? "Chat History"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/60 dark:hover:bg-white/[0.12]"
          >
            <X className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        <div className={noBodyPadding ? "h-full" : "p-4"}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
