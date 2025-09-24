"use client";

import { use, useEffect, useState, useCallback } from "react";
import { Plus, X, Edit3, Send } from "lucide-react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/Toast/ToastProvider";
import {
  getNotifications,
  createNotifications,
  updateNotifications,
} from "./fetch";

/* ---------------- Types ---------------- */
interface Notification {
  id: number | string;
  title: string;
  description: string;
  created_at?: string | null;
  updated_at?: string | null;
}

/* ---------------- Utilities ---------------- */
const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

/* ---------------- Glass Atoms ---------------- */
function GlassCard({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl p-5",
        "bg-white/60 dark:bg-white/[0.07]",
        "border border-white/40 dark:border-white/10",
        "backdrop-blur-2xl shadow-md",
        className
      )}
    >
      {children}
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
      "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
    secondary:
      "text-slate-900 dark:text-white bg-white/70 dark:bg-white/[0.08] border border-white/30 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.12]",
    danger:
      "text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700",
    ghost:
      "text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/[0.08]",
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
        "bg-white/70 dark:bg-white/[0.08]",
        "border border-white/40 dark:border-white/10",
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
        "bg-white/70 dark:bg-white/[0.08]",
        "border border-white/40 dark:border-white/10",
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
        "bg-white/70 dark:bg-white/[0.08]",
        "border border-white/40 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

function GlassModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-xl",
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
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />

      {/* CONTENT */}
      <div
        className={`relative w-full ${maxWidth} rounded-2xl overflow-hidden bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/30">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ---------------- Notification Item ---------------- */
function NotificationItem({
  item,
  onEdit,
  onSend,
}: {
  item: Notification;
  onEdit: (n: Notification) => void;
  onSend: (n: Notification) => void;
}) {
  return (
    <GlassCard className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {item.title}
        </h3>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
          {item.description}
        </p>
      </div>
      <div className="shrink-0 flex gap-2">
        <GlassButton
          variant="secondary"
          onClick={() => onEdit(item)}
          aria-label="Edit"
        >
          <Edit3 className="h-4 w-4" />
          <span className="hidden sm:inline">Edit</span>
        </GlassButton>
        <GlassButton
          variant="primary"
          onClick={() => onSend(item)}
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </GlassButton>
      </div>
    </GlassCard>
  );
}

/* ---------------- Notification List ---------------- */
function NotificationList() {
  const toast = useToast();
  const [data, setData] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const [showSendModal, setShowSendModal] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setData(res?.data || []);
    } catch {
      toast("error", "Error", "Failed to fetch notifications");
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function handleSave() {
    if (!formData.title || !formData.description) {
      toast("warning", "Warning", "Title & description required");
      return;
    }
    try {
      if (editingItem) {
        await updateNotifications(Number(editingItem.id), formData);
        toast("success", "Updated", "Notification updated");
      } else {
        await createNotifications(formData);
        toast("success", "Created", "Notification created");
      }
      setShowModal(false);
      fetchNotifications();
    } catch {
      toast("error", "Error", "Failed to save");
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Notifications
        </h2>
        <GlassButton onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" /> Add
        </GlassButton>
      </div>

      {/* List */}
      {loading ? (
        <GlassCard className="text-center text-slate-600 dark:text-slate-300">
          Loading…
        </GlassCard>
      ) : data.length === 0 ? (
        <GlassCard className="text-center text-slate-600 dark:text-slate-300">
          No notifications yet.
        </GlassCard>
      ) : (
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.id}>
              <NotificationItem
                item={item}
                onEdit={(n) => {
                  setEditingItem(n);
                  setFormData({ title: n.title, description: n.description });
                  setShowModal(true);
                }}
                onSend={() => setShowSendModal(true)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Add/Edit Modal */}
      <GlassModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Notification" : "Add Notification"}
      >
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
          />
          <GlassTextarea
            placeholder="Description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
          />
          <div className="flex justify-end gap-3">
            <GlassButton variant="secondary" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">
              {editingItem ? "Save" : "Create"}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Send Modal */}
      <GlassModal
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="Send Notification"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast("success", "Sent", "Notification sent successfully!");
            setShowSendModal(false);
          }}
          className="grid gap-4"
        >
          <GlassSelect defaultValue="all">
            <option value="all">All</option>
            <option value="user">User</option>
            <option value="astrologer">Astrologer</option>
          </GlassSelect>
          <div className="flex justify-end gap-3">
            <GlassButton variant="secondary" type="button" onClick={() => setShowSendModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">Send</GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}

/* ---------------- Page ---------------- */
export default function NotificationPage({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const _params = use(searchParams);
  void _params;

  return (
    <div className="space-y-8 relative">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-32 w-[26rem] h-[26rem] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-32 w-[28rem] h-[28rem] rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      <NotificationList />
    </div>
  );
}
