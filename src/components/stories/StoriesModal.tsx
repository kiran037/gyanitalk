"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "@/components/stories/utils";
import { glass } from "@/components/GlassUI/GlassKit";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
};

export default function GlassModal({ open, onClose, title, children, maxWidth = "max-w-3xl" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div className={cx("relative z-10 w-full", maxWidth)} onMouseDown={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/85 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.35)] dark:bg-slate-900/75">
          <div className="flex items-center justify-between border-b border-white/20 bg-white/60 px-6 py-4 dark:bg-white/[0.06]">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title || "Preview"}</h3>
            <button onClick={onClose} className={cx(glass.btnSecondary, "h-8 px-2")} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[80vh] overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
