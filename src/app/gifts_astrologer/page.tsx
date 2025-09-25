


"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, X } from "lucide-react";

import { useToast } from "@/components/Toast/ToastProvider";
import { isValidImageUrl } from "@/components/functions";
import { uploadImage } from "@/upload";
import {
  getGifts,
  createGift,
  updateGift,
  deleteGift,
  updateGiftStatus,
} from "@/app/gifts_astrologer/fetch";

/* =================================================================================
   Tiny Glass Kit
================================================================================= */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

const glass = {
  page:
    "relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 " +
    "dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10",
  ambient: `
    pointer-events-none absolute inset-0
    before:content-[''] before:absolute before:-top-24 before:-right-32 before:h-[22rem] before:w-[22rem]
    before:rounded-full before:bg-gradient-to-br before:from-blue-400/15 before:to-purple-400/10 before:blur-3xl
    after:content-[''] after:absolute after:-bottom-32 after:-left-32 after:h-[24rem] after:w-[24rem]
    after:rounded-full after:bg-gradient-to-tr after:from-purple-400/10 after:to-pink-400/10 after:blur-3xl
  `,
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_28px_rgba(0,0,0,0.08)] " +
    "dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
  lift:
    "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(0,0,0,0.10)] " +
    "dark:hover:shadow-[0_16px_44px_rgba(0,0,0,0.45)]",
  input:
    "rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
  badge:
    "inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] px-3 py-1 text-[11px] font-semibold",
};

const buildImg = (val?: string | null) =>
  isValidImageUrl(val || "") ? (/^https?:\/\//i.test(val!) ? val! : `${BASE}${val}`) : FALLBACK;

/* =================================================================================
   Types
================================================================================= */
type Gift = {
  id: number;
  name: string;
  image: string;
  amount: number;
  isActive: boolean;
  isDelete: boolean;
  createdBy?: number;
  modifiedBy?: number;
};

/* =================================================================================
   Status Pill (no Switch)
================================================================================= */
function StatusPill({
  active,
  onToggle,
  disabled,
}: {
  active: boolean;
  onToggle: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onToggle(!active)}
      className={cx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        active
          ? "border-emerald-300/60 dark:border-emerald-800/40 bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
          : "border-rose-300/60 dark:border-rose-800/40 bg-rose-100/70 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
      )}
    >
      <span
        className={cx(
          "h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]",
          active ? "bg-emerald-500/90" : "bg-rose-500/90"
        )}
      />
      {active ? "Active" : "Inactive"}
    </button>
  );
}

/* =================================================================================
   Modal (Glass)
================================================================================= */
function Modal({
  title,
  children,
  onClose,
  widthClass = "max-w-2xl",
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  widthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-md" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className={cx(glass.surface, "w-full overflow-hidden", widthClass)}>
          <div className="flex items-center justify-between border-b border-white/30 px-5 py-3 bg-white/60 dark:bg-white/[0.06]">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
            <button
              className="rounded-lg p-1 text-slate-600 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/[0.08]"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* =================================================================================
   Card (single gift)
================================================================================= */
function GiftCard({
  gift,
  onEdit,
  onDelete,
  onToggle,
}: {
  gift: Gift;
  onEdit: (g: Gift) => void;
  onDelete: (g: Gift) => void;
  onToggle: (g: Gift, next: boolean) => void;
}) {
  const zebraGlow = gift.isActive
    ? "from-blue-400/12 via-purple-400/10 to-pink-400/12"
    : "from-slate-300/10 via-slate-300/10 to-slate-300/10";

  return (
    <div
      className={cx(
        glass.surface,
        glass.lift,
        "overflow-hidden transition p-0",
        gift.isActive ? "" : "grayscale-[.1] opacity-95"
      )}
    >
      {/* ambient blobs */}
      <div className={`pointer-events-none absolute -top-16 -right-24 h-48 w-48 rounded-full blur-3xl bg-gradient-to-br ${zebraGlow}`} />
      <div className={`pointer-events-none absolute -bottom-16 -left-24 h-48 w-48 rounded-full blur-3xl bg-gradient-to-tr ${zebraGlow}`} />

      <div className="relative p-5">
        {/* top row */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12">
              <Image
                src={buildImg(gift.image)}
                alt={`${gift.name || "Gift"} image`}
                fill
                className="rounded-2xl object-cover ring-1 ring-white/30"
              />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                {gift.name || "-"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">INR {Number(gift.amount || 0)}</div>
            </div>
          </div>

          <StatusPill active={!!gift.isActive} onToggle={(n) => onToggle(gift, n)} />
        </div>

        {/* divider */}
        <div className="my-3 h-px w-full border-t border-dashed border-slate-300/70 dark:border-slate-600/60" />

        {/* actions */}
        <div className="flex items-center justify-between">
         

          <div className="flex items-center gap-2">
            <button
              className={cx(
                glass.btn,
                "h-9 w-9 p-0 border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.08]"
              )}
              title="Edit"
              onClick={() => onEdit(gift)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              className={cx(
                glass.btn,
                "h-9 w-9 p-0 border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.08] text-rose-600 hover:text-rose-700"
              )}
              title="Delete"
              onClick={() => onDelete(gift)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =================================================================================
   Add / Edit Forms
================================================================================= */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

/* =================================================================================
   Grid + Data + Modals
================================================================================= */
function GiftsGrid({ page = 1, search = "" }: { page?: number; search?: string }) {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Gift[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  // Modals state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<Gift | null>(null);
  const [showDel, setShowDel] = useState<Gift | null>(null);

  // Add form
  const [addForm, setAddForm] = useState<{ name: string; amount: string; image: File | null }>({
    name: "",
    amount: "",
    image: null,
  });
  const [addPreview, setAddPreview] = useState<string | null>(null);

  // Edit form
  const [editForm, setEditForm] = useState<{ name: string; amount: string; image: File | string | null }>({
    name: "",
    amount: "",
    image: null,
  });
  const [editPreview, setEditPreview] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await getGifts({ page, search, limit: 15 });
      setRows(res?.gifts || []);
      setTotalPages(res?.totalPages || 1);
      setCurrentPage(res?.currentPage || page);
    } catch (e) {
      console.error(e);
      toast("error", "Error", "Failed to fetch gifts.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    ; (window as any).openAddGift = () => setShowAdd(true);
    return () => { delete (window as any).openAddGift; };
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  /* ---------- Status toggle (optimistic) ---------- */
  const handleToggleStatus = async (g: Gift, next: boolean) => {
    const prev = g.isActive;
    setRows((r) => r.map((x) => (x.id === g.id ? { ...x, isActive: next } : x)));
    try {
      const res = await updateGiftStatus(g.id, next);
      if (!res?.success) throw new Error("fail");
      toast("success", "Updated", `Gift "${g.name}" is now ${next ? "Active" : "Inactive"}.`);
    } catch {
      setRows((r) => r.map((x) => (x.id === g.id ? { ...x, isActive: prev } : x)));
      toast("error", "Error", "Failed to update status.");
    }
  };

  /* ---------- Add ---------- */
  const onAddSubmit = async () => {
    if (!addForm.name || !addForm.amount || !addForm.image) {
      toast("warning", "Missing fields", "Please fill Name, Amount and select an Image.");
      return;
    }
    try {
      const up = await uploadImage(addForm.image, "images");
      if (!up?.success || !up?.path) throw new Error("upload");
      const payload = { name: addForm.name.trim(), amount: Number(addForm.amount) || 0, image: up.path };
      const res = await createGift(payload);
      if (!res?.success) throw new Error("create");
      toast("success", "Created", "Gift created successfully.");
      setShowAdd(false);
      setAddForm({ name: "", amount: "", image: null });
      setAddPreview(null);
      refresh();
    } catch (err) {
      console.error(err);
      toast("error", "Error", "Failed to create gift.");
    }
  };

  /* ---------- Edit ---------- */
  const openEdit = (g: Gift) => {
    setShowEdit(g);
    setEditForm({ name: g.name, amount: String(g.amount ?? ""), image: g.image || null });
    setEditPreview(g.image ? buildImg(g.image) : null);
  };

  const onEditSubmit = async () => {
    if (!showEdit) return;
    if (!editForm.name || !editForm.amount) {
      toast("warning", "Missing fields", "Please fill Name and Amount.");
      return;
    }
    try {
      const payload: any = {
        name: editForm.name.trim(),
        amount: Number(editForm.amount) || 0,
      };
      if (editForm.image instanceof File) {
        const up = await uploadImage(editForm.image, "images");
        if (!up?.success || !up?.path) throw new Error("upload");
        payload.image = up.path;
      }
      const res = await updateGift(showEdit.id, payload);
      if (!res?.success) throw new Error("update");
      toast("success", "Saved", "Gift updated successfully.");
      setShowEdit(null);
      setEditPreview(null);
      refresh();
    } catch (err) {
      console.error(err);
      toast("error", "Error", "Failed to update gift.");
    }
  };

  /* ---------- Delete ---------- */
  const onConfirmDelete = async () => {
    if (!showDel) return;
    try {
      const res = await deleteGift(showDel.id);
      if (!res?.success) throw new Error("delete");
      toast("warning", "Deleted", `Gift "${showDel.name}" removed.`);
      setShowDel(null);
      refresh();
    } catch {
      toast("error", "Error", "Failed to delete gift.");
    }
  };

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={cx(glass.surface, "p-5 animate-pulse")}>
            <div className="h-5 w-24 rounded bg-slate-200/70 dark:bg-white/[0.06] mb-3" />
            <div className="h-10 w-10 rounded-2xl bg-slate-200/70 dark:bg-white/[0.06]" />
            <div className="mt-3 h-3 w-28 rounded bg-slate-200/70 dark:bg-white/[0.06]" />
            <div className="mt-4 h-9 w-full rounded bg-slate-200/70 dark:bg-white/[0.06]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Cards grid */}
      {rows.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((g) => (
            <GiftCard
              key={g.id}
              gift={g}
              onEdit={openEdit}
              onDelete={(gift) => setShowDel(gift)}
              onToggle={handleToggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className={cx(glass.surface, "p-10 text-center")}>
          <div className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
            No gifts yet
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm mb-4">
            Create your first gift to get started.
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className={cx(glass.btn, glass.btnPrimary)}
          >
            <Plus className="h-4 w-4" />
            Add Gift
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-6 flex justify-center gap-2 flex-wrap text-sm">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            const isCurrent = pageNum === currentPage;
            const shouldShow = pageNum <= 2 || pageNum === totalPages || Math.abs(pageNum - currentPage) <= 1;

            if (!shouldShow) {
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <span key={i} className="px-2 text-slate-500">
                    …
                  </span>
                );
              }
              return null;
            }

            const href = `?page=${pageNum}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

            return (
              <a
                key={i}
                href={href}
                className={cx(glass.btn, isCurrent ? glass.btnPrimary : glass.btnNeutral)}
              >
                {pageNum}
              </a>
            );
          })}
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <Modal title="➕ Add Gift" onClose={() => setShowAdd(false)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Name" required>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className={glass.input}
                placeholder="e.g. Premium Horoscope"
              />
            </Field>

            <Field label="Amount (INR)" required>
              <input
                type="number"
                value={addForm.amount}
                onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                className={glass.input}
                placeholder="e.g. 199"
              />
            </Field>

            <Field label="Image" required>
              <>
                {addPreview && (
                  <img
                    src={addPreview}
                    alt="Preview"
                    className="mb-2 h-24 w-24 rounded-2xl object-cover ring-1 ring-white/30"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className={glass.input}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setAddForm({ ...addForm, image: file });
                    setAddPreview(file ? URL.createObjectURL(file) : null);
                  }}
                />
              </>
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              className={cx(glass.btn, glass.btnNeutral)}
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
            <button className={cx(glass.btn, glass.btnPrimary)} onClick={onAddSubmit}>
              Create Gift
            </button>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <Modal title="✏️ Edit Gift" onClose={() => { setShowEdit(null); setEditPreview(null); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Name" required>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className={glass.input}
              />
            </Field>

            <Field label="Amount (INR)" required>
              <input
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                className={glass.input}
              />
            </Field>

            <Field label="Image">
              <>
                {editPreview && (
                  <img
                    src={editPreview}
                    alt="Preview"
                    className="mb-2 h-24 w-24 rounded-2xl object-cover ring-1 ring-white/30"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className={glass.input}
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setEditForm({ ...editForm, image: file ?? (showEdit?.image || null) });
                    setEditPreview(file ? URL.createObjectURL(file) : showEdit?.image ? buildImg(showEdit.image) : null);
                  }}
                />
              </>
            </Field>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              className={cx(glass.btn, glass.btnNeutral)}
              onClick={() => { setShowEdit(null); setEditPreview(null); }}
            >
              Cancel
            </button>
            <button className={cx(glass.btn, glass.btnPrimary)} onClick={onEditSubmit}>
              Save Changes
            </button>
          </div>
        </Modal>
      )}

      {/* DELETE MODAL */}
      {showDel && (
        <Modal title="🗑️ Delete Gift?" onClose={() => setShowDel(null)} widthClass="max-w-lg">
          <p className="text-sm text-slate-700 dark:text-slate-200">
            You’re about to delete <span className="font-semibold">{showDel.name}</span>. This action
            cannot be undone.
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button className={cx(glass.btn, glass.btnNeutral)} onClick={() => setShowDel(null)}>
              Cancel
            </button>
            <button
              className={cx(
                glass.btn,
                "text-white bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700"
              )}
              onClick={onConfirmDelete}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* =================================================================================
   Page wrapper
================================================================================= */
export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <GiftPage />
    </Suspense>
  );
}

function GiftPage() {
  const sp = useSearchParams();
  const page = useMemo(() => parseInt(sp.get("page") || "1", 10), [sp]);
  const search = useMemo(() => sp.get("search") || "", [sp]);

  return (
    <div className={glass.page}>
      <div className={glass.ambient} />
      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
        {/* Header + Search */}
        <div className={cx(glass.surface, "p-5")}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gifts</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage gift items and availability</p>
            </div>
            <div className="flex gap-2">
              <form method="get" className="flex gap-2">
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="Search by gift name…"
                  className={cx(glass.input, "min-w-[240px]")}
                />
                <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>Search</button>
                {search && <a href="?page=1" className={cx(glass.btn, glass.btnNeutral)}>Clear</a>}
              </form>

              {/* ✅ Add Gift button always visible */}
              <button
                type="button"
                onClick={() => (window as any).openAddGift?.()}
                className={cx(glass.btn, glass.btnPrimary)}
              >
                <Plus className="h-4 w-4" />
                Add Gift
              </button>
            </div>
          </div>

        </div>

        <GiftsGrid page={page} search={search} />
      </div>
    </div>
  );
}
