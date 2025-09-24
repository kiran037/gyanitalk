// /src/app/pages/page.tsx
"use client";

import { use, useEffect, useState, useTransition } from "react";
import { X, Edit3 } from "lucide-react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/Toast/ToastProvider"; // if you prefer react-hot-toast, swap accordingly

import { getPages, updatePages, updatePagesStatus } from "./fetch";

/* ======================================
   Tiny utils
====================================== */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const stripHtml = (html: string) => {
  if (typeof window === "undefined") return html;
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

/* ======================================
   Glass atoms (OS-26)
====================================== */
function GlassCard({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl p-5",
        "bg-white/60 dark:bg-white/[0.07] border border-white/30 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_8px_30px_rgba(2,6,23,0.10)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {/* subtle glass sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.06] dark:via-white/[0.03]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function GlassButton(
  { children, className = "", variant = "primary", ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "ghost";
  }
) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60";
  const styles = {
    primary:
      "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_8px_20px_rgba(59,130,246,0.28)]",
    secondary:
      "text-slate-900 dark:text-white bg-white/70 dark:bg-white/[0.08] border border-white/50 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.12]",
    danger:
      "text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_8px_20px_rgba(244,63,94,0.28)]",
    ghost: "text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/[0.08]",
  } as const;
  return (
    <button {...rest} className={cx(base, styles[variant], className)}>
      {children}
    </button>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl px-4 py-2.5 text-sm outline-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/50 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

function GlassTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full rounded-xl px-4 py-3 text-sm outline-none resize-y",
        "bg-white/70 dark:bg-white/[0.08] border border-white/50 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

function GlassSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "w-full rounded-xl px-4 py-2.5 text-sm outline-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/50 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

/* iOS-style glass switch (no text next to it) */
function GlassSwitch({
  checked,
  onChange,
  ariaLabel = "Toggle",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-[28px] w-[52px] rounded-full transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
        "backdrop-blur-md border",
        checked
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 border-white/40 shadow-[0_6px_20px_rgba(59,130,246,0.35)]"
          : "bg-white/40 dark:bg-white/[0.10] border-white/30 dark:border-white/10"
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 left-0.5 h-[24px] w-[24px] rounded-full",
          "bg-white dark:bg-slate-100 shadow-md transition-transform will-change-transform",
          checked ? "translate-x-[24px] shadow-[0_0_0_3px_rgba(255,255,255,0.35)]" : "translate-x-0"
        )}
      />
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
}

/* Full-viewport blur modal */
function GlassModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
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

  return createPortal(
    <div
      className="fixed inset-0 z-[70] grid place-items-center p-4 md:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      aria-modal="true"
      role="dialog"
    >
      {/* Veil covers entire viewport => top is blurred too */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl backdrop-saturate-150" />
      <div
        className={cx(
          "relative w-full rounded-2xl overflow-hidden",
          "bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl",
          maxWidth
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/30 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button className="p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10" onClick={onClose}>
            <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ======================================
   Status Toggle (optimistic)
====================================== */
function PagesStatusToggle({
  id,
  status,
  onLocalChange,
}: {
  id: number;
  status: boolean;
  onLocalChange: (next: boolean) => void; // let parent card update instantly
}) {
  const toast = useToast();
  const [checked, setChecked] = useState<boolean>(status);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setChecked(status), [status]);

  const toggle = (next: boolean) => {
    startTransition(async () => {
      setChecked(next);
      onLocalChange(next); // optimistic
      try {
        const res = await updatePagesStatus(id, next);
        if (res?.success) {
          toast("success", "Updated", "Status updated successfully.");
        } else {
          throw new Error("fail");
        }
      } catch {
        setChecked(!next);
        onLocalChange(!next);
        toast("error", "Error", "Failed to update status.");
      }
    });
  };

  return <GlassSwitch checked={checked} onChange={toggle} ariaLabel="Toggle active" />;
}

/* ======================================
   Page Card
====================================== */
function PageCard({
  item,
  onUpdate,
}: {
  item: { id: number; title: string; type: string; description: string; isActive: number };
  onUpdate?: () => void;
}) {
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [localActive, setLocalActive] = useState<boolean>(!!item.isActive);
  const [formData, setFormData] = useState({
    title: item.title || "",
    type: item.type || "",
    description: item.description || "",
  });

  const maxLength = 550;
  const plainText = stripHtml(item.description);
  const truncated = plainText.length > maxLength ? plainText.slice(0, maxLength) + "…" : plainText;

  const handleSave = async () => {
    try {
      setSaving(true);
      await updatePages(item.id, formData);
      toast("success", "Saved", "Page updated!");
      setShowModal(false);
      onUpdate?.();
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <GlassCard className="flex flex-col gap-4">
      {/* Title + Toggle */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white truncate">
            {item.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {item.type ? item.type.replace(/^\w/, (c) => c.toUpperCase()) : "—"}
          </p>
        </div>

        {/* compact switch (no “Active” text near it) */}
        <PagesStatusToggle
          id={item.id}
          status={localActive}
          onLocalChange={(n) => setLocalActive(n)}
        />
      </div>

      {/* Description */}
      <div className="text-slate-700 dark:text-slate-300 text-sm">
        {isExpanded ? (
          <div dangerouslySetInnerHTML={{ __html: item.description }} />
        ) : (
          <p>{truncated}</p>
        )}
        {plainText.length > maxLength && (
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="mt-2 text-indigo-600 hover:underline"
          >
            {isExpanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <GlassButton variant="secondary" onClick={() => setShowModal(true)}>
          <Edit3 className="h-4 w-4" /> Edit
        </GlassButton>
      </div>

      {/* Edit Modal */}
      <GlassModal open={showModal} onClose={() => setShowModal(false)} title="Edit Page" maxWidth="max-w-2xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="grid gap-4"
        >
          <GlassInput
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData((s) => ({ ...s, title: e.target.value }))}
            required
          />

          <GlassSelect
            value={formData.type}
            onChange={(e) => setFormData((s) => ({ ...s, type: e.target.value }))}
            required
          >
            <option value="" disabled>
              — Select Type —
            </option>
            <option value="privacy">Privacy Policy</option>
            <option value="terms">Terms & Conditions</option>
            <option value="aboutus">About Us</option>
          </GlassSelect>

          <GlassTextarea
            rows={6}
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
            required
          />

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="secondary" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </GlassCard>
  );
}

/* ======================================
   List wrapper (fetch & render)
====================================== */
function PagesList() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    try {
      const res = await getPages();
      setData(res?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} className="h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <GlassCard className="text-center text-slate-600 dark:text-slate-300">No pages yet.</GlassCard>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item) => (
        <PageCard key={item.id} item={item} onUpdate={fetchPages} />
      ))}
    </div>
  );
}

/* ======================================
   Page (no Breadcrumb)
====================================== */
export default function PagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; startDate?: string; endDate?: string }>;
}) {
  const _params = use(searchParams);
  void _params;

  return (
    <div className="space-y-8 relative">
      {/* Ambient OS-26 blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-32 w-[28rem] h-[28rem] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-32 w-[30rem] h-[30rem] rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      {/* Heading */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Pages</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage static content pages with a clean, liquid-glass interface.
          </p>
        </div>
      </div>

      {/* List */}
      <PagesList />
    </div>
  );
}
