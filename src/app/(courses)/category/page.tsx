"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/(courses)/fetch";
import { uploadImage } from "@/upload";
import { useToast } from "@/components/Toast/ToastProvider";

/* tiny utils */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";
const imgSrc = (p?: string) => (p ? `${BASE}${p}` : FALLBACK);

/* liquid-glass atoms */
function GlassCard({
  children,
  className = "",
  hover = true,
}: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[24px]",
        "bg-white/55 dark:bg-white/[0.06] border border-white/50 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_8px_30px_rgba(2,6,23,0.10)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
        hover && "transition-transform hover:-translate-y-0.5 hover:shadow-xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.06] dark:via-white/[0.03]" />
      <div className="relative">{children}</div>
    </div>
  );
}

function GlassButton(
  { children, className = "", variant = "primary", ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger";
  }
) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed";
  const styles = {
    primary:
      "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_8px_20px_rgba(59,130,246,0.28)]",
    secondary:
      "text-slate-900 dark:text-white bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.12]",
    ghost: "text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-white/[0.08]",
    danger:
      "text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_8px_20px_rgba(244,63,94,0.28)]",
  } as const;
  return (
    <button {...rest} className={cx(base, styles[variant], className)}>{children}</button>
  );
}

function GlassIconButton(
  { ariaLabel, variant = "secondary", className = "", children, ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    ariaLabel: string;
    variant?: "secondary" | "danger";
  }
) {
  const styles = {
    secondary:
      "bg-white/75 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 hover:bg-white/95 dark:hover:bg-white/[0.12]",
    danger:
      "text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_8px_20px_rgba(244,63,94,0.28)]",
  } as const;
  return (
    <button
      {...rest}
      aria-label={ariaLabel}
      className={cx(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all focus:outline-none",
        styles[variant],
        className
      )}
    >
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
        "bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

/* GlassModal via portal (fixes top unblurred area) */
function GlassModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-4 md:p-6"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/60 supports-[backdrop-filter]:backdrop-blur-md" />
      <div className={`relative w-full ${maxWidth}`}>
        <div
          className={[
            "relative overflow-hidden rounded-[24px]",
            "bg-white/55 dark:bg-white/[0.06] border border-white/50 dark:border-white/10",
            "backdrop-blur-2xl shadow-[0_8px_30px_rgba(2,6,23,0.10)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.06] dark:via-white/[0.03]" />
          <div className="relative flex items-center justify-between p-5 border-b border-white/60 dark:border-white/10">
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              {title || "Dialog"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl
                         bg-white/75 dark:bg-white/[0.08] border border-white/60 dark:border-white/10
                         hover:bg-white/95 dark:hover:bg-white/[0.12] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative max-h-[75vh] overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ConfirmModal({
  open, title = "Confirm", message, confirmText = "Confirm", loading = false, onCancel, onConfirm,
}: {
  open: boolean; title?: string; message: string; confirmText?: string; loading?: boolean;
  onCancel: () => void; onConfirm: () => Promise<void> | void;
}) {
  return (
    <GlassModal open={open} onClose={onCancel} title={title} maxWidth="max-w-md">
      <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <GlassButton variant="secondary" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton variant="danger" onClick={onConfirm} disabled={loading}>{loading ? "Working…" : confirmText}</GlassButton>
      </div>
    </GlassModal>
  );
}

/* list row — thumbnail, small name, icons on the right */
function CategoryRow({
  item,
  onEdit,
  onDelete,
}: {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <GlassCard className="p-3 hover:-translate-y-[1px]">
      <div className="flex items-center gap-3">
        {/* image */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/60 dark:border-white/10">
          <Image src={imgSrc(item?.image)} alt={item?.name || "Category"} fill className="object-cover" />
        </div>

        {/* name */}
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
            {item?.name?.trim() || "Untitled"}
          </p>
        </div>

        {/* actions (right) */}
        <div className="ml-auto flex items-center gap-2">
          <GlassIconButton ariaLabel="Edit" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </GlassIconButton>
          <GlassIconButton ariaLabel="Delete" variant="danger" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </GlassIconButton>
        </div>
      </div>
    </GlassCard>
  );
}

/* page */
export default function Page() {
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // add
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<{ name: string; image: File | null }>({ name: "", image: null });
  const [addPreview, setAddPreview] = useState<string | null>(null);
  const [savingAdd, setSavingAdd] = useState(false);

  // edit
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<{ id?: number; name: string; image?: File | null }>({ name: "" });
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // delete
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getCategories();
      setCategories(res?.categories || []);
    } catch (e: any) {
      console.error(e);
      toast("error", "Error", "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const submitAdd = async () => {
    if (!addForm.name.trim()) {
      toast("warning", "Warning", "Please provide a category name.");
      return;
    }
    try {
      setSavingAdd(true);
      let payload: any = { name: addForm.name.trim() };
      if (addForm.image) {
        const up = await uploadImage(addForm.image, "images");
        if (!up?.success || !up?.path) {
          toast("error", "Error", "Upload failed. Please try again.");
          return;
        }
        payload.image = up.path;
      }
      const res = await createCategory(payload);
      if (res?.success) {
        toast("success", "Success", "Category created successfully.");
        setShowAdd(false);
        setAddPreview(null);
        setAddForm({ name: "", image: null });
        await load();
      } else {
        toast("error", "Error", res?.message || "Failed to create category");
      }
    } catch (err: any) {
      console.error(err);
      toast("error", "Error", err?.message || "Failed to create category");
    } finally {
      setSavingAdd(false);
    }
  };

  const openEdit = (item: any) => {
    setEditForm({ id: item.id, name: item.name, image: null });
    setEditPreview(item?.image ? imgSrc(item.image) : null);
    setShowEdit(true);
  };
  const submitEdit = async () => {
    if (!editForm.id) return;
    if (!editForm.name.trim()) {
      toast("warning", "Warning", "Please provide a category name.");
      return;
    }
    try {
      setSavingEdit(true);
      let payload: any = { name: editForm.name.trim() };
      if (editForm.image instanceof File) {
        const up = await uploadImage(editForm.image, "images");
        if (!up?.success || !up?.path) {
          toast("error", "Error", "Upload failed. Please try again.");
          return;
        }
        payload.image = up.path;
      }
      const res = await updateCategory(editForm.id, payload);
      if (res?.success) {
        toast("success", "Success", "Category updated successfully.");
        setShowEdit(false);
        setEditPreview(null);
        await load();
      } else {
        toast("error", "Error", res?.message || "Update failed");
      }
    } catch (err: any) {
      console.error(err);
      toast("error", "Error", err?.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      setDeleting(true);
      const res = await deleteCategory(confirmId);
      if (res?.success) {
        toast("success", "Success", "Category deleted successfully.");
        setConfirmId(null);
        await load();
      } else {
        toast("error", "Error", res?.message || "Delete failed");
      }
    } catch (err: any) {
      console.error(err);
      toast("error", "Error", err?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative px-5 py-5 w-full min-w-0 space-y-6 overflow-x-hidden">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-32 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-32 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
      </div>

      <div>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Categories</h1>
          <GlassButton onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            Add Category
          </GlassButton>
        </div>
      </div>

      {/* list */}
      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[84px] rounded-[24px] bg-white/60 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        <ul className="grid gap-3">
          {categories.map((item) => (
            <li key={item.id}>
              <CategoryRow item={item} onEdit={openEdit} onDelete={(id) => setConfirmId(id)} />
            </li>
          ))}
        </ul>
      )}

      {/* Add Modal */}
      <GlassModal open={showAdd} onClose={() => setShowAdd(false)} title="Add Category">
        <div className="grid sm:grid-cols-[auto,1fr] gap-5">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl ring-4 ring-white/70 dark:ring-white/10 border border-white/60 dark:border-white/10">
              <Image src={addPreview || FALLBACK} alt="Preview" fill className="object-cover" />
            </div>
            <label className="cursor-pointer">
              <span className="inline-flex text-sm px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08]">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setAddForm((s) => ({ ...s, image: f }));
                  setAddPreview(f ? URL.createObjectURL(f) : null);
                }}
              />
            </label>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Category Name</span>
              <GlassInput value={addForm.name} onChange={(e) => setAddForm((s) => ({ ...s, name: e.target.value }))} placeholder="e.g., Vedic Astrology" />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <GlassButton variant="secondary" onClick={() => setShowAdd(false)}>Cancel</GlassButton>
              <GlassButton onClick={submitAdd} disabled={savingAdd}>{savingAdd ? "Creating…" : "Create Category"}</GlassButton>
            </div>
          </div>
        </div>
      </GlassModal>

      {/* Edit Modal */}
      <GlassModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Category">
        <div className="grid sm:grid-cols-[auto,1fr] gap-5">
          <div className="flex flex-col items-center gap-2">
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl ring-4 ring-white/70 dark:ring-white/10 border border-white/60 dark:border-white/10">
              <Image src={editPreview || FALLBACK} alt="Preview" fill className="object-cover" />
            </div>
            <label className="cursor-pointer">
              <span className="inline-flex text-sm px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08]">Change Image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setEditForm((s) => ({ ...s, image: f }));
                  setEditPreview(f ? URL.createObjectURL(f!) : editPreview);
                }}
              />
            </label>
          </div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Category Name</span>
              <GlassInput value={editForm.name} onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))} placeholder="Category name" />
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <GlassButton variant="secondary" onClick={() => setShowEdit(false)}>Cancel</GlassButton>
              <GlassButton onClick={submitEdit} disabled={savingEdit}>{savingEdit ? "Saving…" : "Save Changes"}</GlassButton>
            </div>
          </div>
        </div>
      </GlassModal>

      {/* Delete confirm */}
      <ConfirmModal
        open={confirmId !== null}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
        onCancel={() => setConfirmId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
