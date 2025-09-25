
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createPortal } from "react-dom";
import { Plus, Pencil, Trash2, ArrowLeft, ExternalLink, X } from "lucide-react";
import toast from "react-hot-toast";

// API helpers you already have
import {
  getHelpSupportSubCategories,
  addHelpSupportSubCategory,
  updateHelpSupportSubCategory,
  deleteHelpSupportSubCategory,
} from "@/app/helpSupport/fetch";

/* ────────────────────────────────────────────────────────────────────────────
  Types
──────────────────────────────────────────────────────────────────────────── */
type SubCategory = {
  id: number;
  helpSupportId: number;
  question?: string;
  answer?: string;
  isChatWithus: boolean;
};

/* ────────────────────────────────────────────────────────────────────────────
  Glass UI helpers
──────────────────────────────────────────────────────────────────────────── */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const glass = {
  page:
    "relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 " +
    "dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10",
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 bg-white/70 " +
    "dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] " +
    "dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 " +
    "shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
  input:
    "w-full rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
  textarea:
    "w-full rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40 resize-y",
  chip:
    "inline-flex items-center gap-1 rounded-full border border-white/30 dark:border-white/10 bg-white/70 " +
    "dark:bg-white/[0.06] px-2.5 py-1 text-[11px] font-semibold",
};

/* ────────────────────────────────────────────────────────────────────────────
  Skeleton
──────────────────────────────────────────────────────────────────────────── */
function CardSkeleton() {
  return (
    <div className={cx(glass.surface, "p-5")}>
      <div className="h-5 w-48 rounded bg-slate-200/70 dark:bg-white/10 animate-pulse" />
      <div className="mt-3 h-4 w-full rounded bg-slate-200/60 dark:bg-white/5 animate-pulse" />
      <div className="mt-2 h-4 w-2/3 rounded bg-slate-200/60 dark:bg-white/5 animate-pulse" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-6 w-28 rounded-full bg-slate-200/70 dark:bg-white/10 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-9 rounded-xl bg-slate-200/70 dark:bg-white/10 animate-pulse" />
          <div className="h-9 w-9 rounded-xl bg-slate-200/70 dark:bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
  Modal (portal + body scroll lock)
──────────────────────────────────────────────────────────────────────────── */
function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useBodyLock(true);
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cx(glass.surface, "relative z-10 w-full max-w-2xl overflow-hidden")}>
        <div className="flex items-center justify-between border-b border-white/20 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-xl bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-white/20 bg-white/50 dark:bg-white/[0.05] px-6 py-4">
          {footer}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ────────────────────────────────────────────────────────────────────────────
  Page
──────────────────────────────────────────────────────────────────────────── */
export default function HelpSupportSubCategoryPage() {
  const params = useParams<{ id: string }>();
  const supportId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<SubCategory[]>([]);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<SubCategory | null>(null);
  const [deleteOpen, setDeleteOpen] = useState<SubCategory | null>(null);

  // Add form
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [chat, setChat] = useState(false);

  // Edit form
  const [eq, setEq] = useState("");
  const [ea, setEa] = useState("");
  const [echat, setEchat] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await getHelpSupportSubCategories(supportId);
      setItems(res?.subCategories ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(supportId)) return;
    load();
  }, [supportId]);

  /* ── Actions ───────────────────────────────────────────────────────────── */
  async function onAdd() {
    if (!q.trim()) {
      toast.error("Question is required");
      return;
    }
    try {
      const res = await addHelpSupportSubCategory({
        supportId,
        subCategory: q,
        description: a,
        isChatWithUs: chat, // API naming
      });
      if (res?.success) {
        toast.success("SubCategory added");
        setAddOpen(false);
        setQ("");
        setA("");
        setChat(false);
        await load();
      } else toast.error(res?.message ?? "Failed to add");
    } catch (e) {
      console.error(e);
      toast.error("Error while adding");
    }
  }

  async function onEdit() {
    if (!editOpen) return;
    if (!eq.trim()) {
      toast.error("Question is required");
      return;
    }
    try {
      const res = await updateHelpSupportSubCategory({
        id: editOpen.id,
        supportId,
        question: eq,
        answer: ea,
        isChatWithus: echat, // API naming (note: lowercase 'us')
      });
      if (res?.success) {
        toast.success("Updated");
        setEditOpen(null);
        await load();
      } else toast.error(res?.message ?? "Failed to update");
    } catch (e) {
      console.error(e);
      toast.error("Error while updating");
    }
  }

  async function onDelete() {
    if (!deleteOpen) return;
    try {
      const res = await deleteHelpSupportSubCategory(deleteOpen.id);
      if (res?.success) {
        toast.success("Deleted");
        setDeleteOpen(null);
        await load();
      } else toast.error(res?.message ?? "Failed to delete");
    } catch (e) {
      console.error(e);
      toast.error("Error while deleting");
    }
  }

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <div className={glass.page}>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className={cx(glass.surface, "px-5 py-4")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link href="/helpSupport" className={cx(glass.btn, glass.btnNeutral)} title="Back">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Help Support — Sub Categories
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage FAQ items for this support topic.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAddOpen(true)}
              className={cx(glass.btn, glass.btnPrimary)}
            >
              <Plus className="h-4 w-4" />
              Add SubCategory
            </button>
          </div>
        </div>

        {/* List (cards) */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className={cx(glass.surface, "p-10 text-center")}>
            <p className="text-slate-600 dark:text-slate-400">No subcategories yet.</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
              Click “Add SubCategory” to create your first item.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((c) => (
              <div key={c.id} className={cx(glass.surface, "p-5")}>
                <div className="flex items-start justify-between gap-6">
                  {/* Left: Question + Answer */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {c.question || "—"}
                      </h3>
                      <span className={glass.chip}>
                        Chat with us:
                        <span
                          className={cx(
                            "ml-1 rounded px-1.5 py-0.5",
                            c.isChatWithus
                              ? "bg-emerald-200/50 text-emerald-700"
                              : "bg-slate-200/50 text-slate-600"
                          )}
                        >
                          {c.isChatWithus ? "Yes" : "No"}
                        </span>
                      </span>
                    </div>

                    {c.answer && (
                      <div
                        className="prose prose-sm dark:prose-invert mt-2 max-w-none text-slate-700 dark:text-slate-300"
                        dangerouslySetInnerHTML={{ __html: c.answer }}
                      />
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    {/* View sub-sub page (pass supportId to enable add there) */}
                    <Link
                      href={`/helpSupport/sub-sub-category/${c.id}?supportId=${supportId}`}
                      className={cx(glass.btn, glass.btnNeutral)}
                      title="View Sub-Sub Items"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Link>

                    <button
                      onClick={() => {
                        setEq(c.question ?? "");
                        setEa(c.answer ?? "");
                        setEchat(Boolean(c.isChatWithus));
                        setEditOpen(c);
                      }}
                      className="h-9 w-9 grid place-items-center rounded-xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </button>

                    <button
                      onClick={() => setDeleteOpen(c)}
                      className="h-9 w-9 grid place-items-center rounded-xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white/90"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {addOpen && (
          <Modal
            title="➕ Add SubCategory"
            onClose={() => setAddOpen(false)}
            footer={
              <>
                <button onClick={() => setAddOpen(false)} className={cx(glass.btn, glass.btnNeutral)}>
                  Cancel
                </button>
                <button onClick={onAdd} className={cx(glass.btn, glass.btnPrimary)}>
                  Save
                </button>
              </>
            }
          >
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Question <span className="text-rose-500">*</span>
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Title / Question"
                  className={glass.input}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Answer</span>
                <textarea
                  rows={5}
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                  placeholder="HTML supported"
                  className={glass.textarea}
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={chat}
                  onChange={(e) => setChat(e.target.checked)}
                />
                Show “Chat with us”
              </label>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {editOpen && (
          <Modal
            title="✏️ Edit SubCategory"
            onClose={() => setEditOpen(null)}
            footer={
              <>
                <button onClick={() => setEditOpen(null)} className={cx(glass.btn, glass.btnNeutral)}>
                  Cancel
                </button>
                <button onClick={onEdit} className={cx(glass.btn, glass.btnPrimary)}>
                  Save Changes
                </button>
              </>
            }
          >
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Question <span className="text-rose-500">*</span>
                </span>
                <input
                  value={eq}
                  onChange={(e) => setEq(e.target.value)}
                  className={glass.input}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Answer</span>
                <textarea
                  rows={5}
                  value={ea}
                  onChange={(e) => setEa(e.target.value)}
                  className={glass.textarea}
                />
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={echat}
                  onChange={(e) => setEchat(e.target.checked)}
                />
                Show “Chat with us”
              </label>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {deleteOpen && (
          <Modal
            title="Delete subcategory?"
            onClose={() => setDeleteOpen(null)}
            footer={
              <>
                <button onClick={() => setDeleteOpen(null)} className={cx(glass.btn, glass.btnNeutral)}>
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className={cx(glass.btn, glass.btnPrimary, "from-rose-600 to-orange-600")}
                >
                  Delete
                </button>
              </>
            }
          >
            <p className="text-sm text-slate-700 dark:text-slate-300">
              This action cannot be undone. You’re about to delete{" "}
              <span className="font-semibold">{deleteOpen?.question}</span>.
            </p>
          </Modal>
        )}
      </div>
    </div>
  );
}
