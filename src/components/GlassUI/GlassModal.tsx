// src/components/GlassUI/GlassModal.tsx
"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "./GlassKit";

export default function GlassModal({
  open,
  onClose,
  title,
  children,
  /** Default matches your coupon modal width */
  maxWidth = "max-w-4xl",
  /** Optional right-aligned header content */
  headerRight,
  /** Optional sticky footer (actions) */
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const labelId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC + focus trap + lock body scroll
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const f = root.querySelectorAll<HTMLElement>(
          'a[href],button,textarea,input,select,[tabindex]:not([tabindex="-1"])'
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey) {
          if (active === first || !root.contains(active)) {
            e.preventDefault();
            (last as HTMLElement).focus();
          }
        } else {
          if (active === last || !root.contains(active)) {
            e.preventDefault();
            (first as HTMLElement).focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Autofocus first focusable
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>(
          'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )
        ?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? labelId : undefined}
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop (subtle blur) */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog wrapper */}
      <div
        className={cx("relative z-10 w-full", maxWidth)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Glass card */}
        <div
          ref={dialogRef}
          className={cx(
            "overflow-hidden rounded-3xl border border-white/20",
            "bg-white/75 dark:bg-white/[0.08] backdrop-blur-2xl bg-clip-padding",
            "shadow-[0_30px_120px_rgba(0,0,0,0.35)]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/20 bg-gradient-to-r from-white/60 to-white/40 dark:from-white/[0.06] dark:to-white/[0.04] px-6 py-4">
            <div className="min-w-0">
              <h2
                id={labelId}
                className="text-lg font-semibold text-slate-900 dark:text-white truncate"
              >
                {title || "Dialog"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {headerRight}
              <button
                onClick={onClose}
                aria-label="Close"
                className={cx(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl",
                  "border border-white/40 dark:border-white/10",
                  "bg-white/70 dark:bg-white/[0.06]",
                  "text-slate-700 dark:text-slate-300",
                  "hover:bg-white/90 dark:hover:bg-white/[0.12] transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                )}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Body (inner scroll, aligned scrollbar) */}
          <div className="gm-body px-6 py-6 max-h-[72vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer (optional) */}
          {footer ? (
            <div className="flex items-center justify-end gap-3 border-t border-white/20 bg-white/40 dark:bg-white/[0.04] px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>

      {/* Scoped, minimal styles: glassy file input + Lucide Upload icon via data-URI */}
      <style jsx global>{`
        .gm-body input[type="file"] {
          appearance: none;
          border-radius: 0.75rem; /* rounded-xl */
          border: 1px solid rgba(148, 163, 184, 0.6); /* slate-300-ish */
          background: rgba(255, 255, 255, 0.9);
          padding: 0.45rem 0.75rem; /* match inputs */
          font-size: 0.875rem; /* text-sm */
          color: #0f172a; /* slate-900 */
          outline: none;
        }
        .dark .gm-body input[type="file"] {
          border-color: rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: #e5e7eb; /* slate-200 */
        }
        .gm-body input[type="file"]:focus-visible {
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.45);
        }

        /* Native button styled with a Lucide Upload icon (data-URI) */
        .gm-body input[type="file"]::file-selector-button {
          margin-right: 0.75rem;
          height: 2.25rem;
          padding: 0 0.75rem;
          border-radius: 0.75rem; /* rounded-xl */
          border: 1px solid rgba(148, 163, 184, 0.6);
          background: rgba(255, 255, 255, 0.9);
          color: #0f172a;
          cursor: pointer;
          transition: background-color 140ms ease, border-color 140ms ease, transform 120ms ease;

          display: inline-flex;
          align-items: center;
          gap: 0.5rem;

          /* show the upload icon before the text */
          background-image: none;
          position: relative;
        }
        /* pseudo element for the icon */
        .gm-body input[type="file"]::file-selector-button::before {
          content: "";
          width: 18px;
          height: 18px;
          display: inline-block;
          background-repeat: no-repeat;
          background-position: center;
          background-size: 18px 18px;
          /* Lucide Upload icon path */
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23677485' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/></svg>");
          margin-right: 0.25rem;
        }

        .gm-body input[type="file"]::file-selector-button:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: rgba(148, 163, 184, 0.9);
        }
        .gm-body input[type="file"]::file-selector-button:active {
          transform: scale(0.98);
        }

        .dark .gm-body input[type="file"]::file-selector-button {
          border-color: rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.08);
          color: #e5e7eb;
        }
        .dark .gm-body input[type="file"]::file-selector-button::before {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'/><polyline points='17 8 12 3 7 8'/><line x1='12' y1='3' x2='12' y2='15'/></svg>");
        }
        .dark .gm-body input[type="file"]::file-selector-button:hover {
          background: rgba(255, 255, 255, 0.10);
          border-color: rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>,
    document.body
  );
}
