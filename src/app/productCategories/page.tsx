
"use client";

import { Suspense, use, useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "@/components/functions";
import {
  getProductCategory,
  addProductCategory,
  updateProductCategory,
  updateProductCategoriesStatus,
} from "./fetch";

/* ────────────────────────────────────────────────────────────────────────── */
/* tiny utils                                                                */
/* ────────────────────────────────────────────────────────────────────────── */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK_IMG = "https://gyanitalk.com/build/assets/images/person.png";

function categorySrcOf(item: any) {
  const src = item?.categoryImage ?? "";
  if (!src) return FALLBACK_IMG;
  if (/^https?:\/\//i.test(src)) return src;
  return isValidImageUrl(src) ? `${BASE}${src}` : FALLBACK_IMG;
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Liquid Glass primitives — OS26 palette                                    */
/* ────────────────────────────────────────────────────────────────────────── */
function GlassCard({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-[24px]",
        "bg-white/55 dark:bg-white/[0.06] border border-white/60 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_8px_30px_rgba(2,6,23,0.10)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
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
    React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" }
) {
  const base =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60";
  const styles = {
    primary:
      "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
    secondary:
      "text-slate-900 dark:text-white bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.12]",
    danger:
      "text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_8px_20px_rgba(244,63,94,0.28)]",
  } as const;
  return (
    <button {...rest} className={cx(base, styles[variant], className)}>{children}</button>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl px-3.5 py-2.5 text-sm outline-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/60 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100",
        props.className
      )}
    />
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* OS26 switch (labeled)                                                     */
/* ────────────────────────────────────────────────────────────────────────── */
/* OS26 switch — no label text */
function SwitchOS26({
  checked,
  onChange,
  disabled,
  ariaLabel = "Toggle",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cx(
        "relative inline-flex h-[28px] w-[52px] items-center rounded-full border transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60",
        checked
          ? "bg-gradient-to-r from-blue-600 to-purple-600 border-white/40 shadow-[0_6px_20px_rgba(59,130,246,0.35)]"
          : "bg-white/50 dark:bg-white/[0.10] border-white/30 dark:border-white/10"
      )}
    >
      <span
        className={cx(
          "h-[22px] w-[22px] rounded-full bg-white dark:bg-slate-200 shadow-md transition-all translate-x-1",
          checked && "translate-x-[29px]"
        )}
      />
    </button>
  );
}


/* ────────────────────────────────────────────────────────────────────────── */
/* Full-viewport modal with true blur (portal + max z)                       */
/* ────────────────────────────────────────────────────────────────────────── */
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
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] grid place-items-center p-4 md:p-6"
      onMouseDown={(e) => e.currentTarget === e.target && onClose()}
      aria-modal="true"
      role="dialog"
    >
      {/* real blur that covers EVERYTHING (also Safari-friendly) */}
      <div className="absolute inset-0 bg-black/60 supports-[backdrop-filter]:bg-black/30 backdrop-blur-2xl" />

      <div className={cx("relative w-full", maxWidth)} onMouseDown={(e) => e.stopPropagation()}>
        <GlassCard>
          <div className="flex items-center justify-between p-5 border-b border-white/60 dark:border-white/10">
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">{title || "Dialog"}</h3>
            <GlassButton variant="secondary" onClick={onClose}>Close</GlassButton>
          </div>
          <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
        </GlassCard>
      </div>
    </div>,
    document.body
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Status toggle (server + optimistic)                                       */
/* ────────────────────────────────────────────────────────────────────────── */
/* Status toggle with optimistic update and parent callback */
function CategoryStatusToggle({
  id,
  status,
  onStatusUpdated,
}: {
  id: number;
  status: boolean;
  onStatusUpdated?: (next: boolean) => void;
}) {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState<boolean>(!!status);

  // keep in sync if parent changes (e.g., after refetch)
  useEffect(() => setChecked(!!status), [status]);

  const toggle = async (next: boolean) => {
    setChecked(next); // optimistic
    try {
      const res = await updateProductCategoriesStatus(id, next);
      if (!res?.success) throw new Error();
      onStatusUpdated?.(next);           // tell parent to update its list
      toast("success", "Updated", "Status updated successfully.");
    } catch {
      setChecked((v) => !v);             // revert
      toast("error", "Error", "Failed to update status.");
    }
  };

  return (
    <SwitchOS26
      checked={checked}
      onChange={(v) => startTransition(() => toggle(v))}
      disabled={isPending}
      ariaLabel="Toggle category status"
    />
  );
}


/* ────────────────────────────────────────────────────────────────────────── */
/* Square category card                                                      */
/* ────────────────────────────────────────────────────────────────────────── */
/* Square category card */
function CategoryCard({
  item,
  onEdit,
  onStatusChange,
}: {
  item: any;
  onEdit: (it: any) => void;
  onStatusChange: (id: number, next: boolean) => void;
}) {
  const img = categorySrcOf(item);
  const isActive = !!item.isActive;

  return (
    <GlassCard className="overflow-hidden">
      <div className="relative aspect-square w-full bg-white/50 dark:bg-white/[0.06]">
        <Image alt={item.name || "Category"} src={img} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm md:text-base font-semibold text-slate-900 dark:text-white truncate">
              {item.name || "Untitled"}
            </h3>
            <span
              className={cx(
                "mt-1 inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] font-medium border",
                isActive
                  ? "text-emerald-700 bg-emerald-50 border-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700/40"
                  : "text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-300 dark:bg-slate-700/30 dark:border-slate-600/40"
              )}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <GlassButton variant="secondary" onClick={() => onEdit(item)}>Edit</GlassButton>
        </div>

        <div className="mt-4 border-t border-white/60 dark:border-white/10 pt-4">
          {/* no label text beside the switch */}
          <CategoryStatusToggle
            id={item.id}
            status={item.isActive}
            onStatusUpdated={(next) => onStatusChange(item.id, next)}
          />
        </div>
      </div>
    </GlassCard>
  );
}


/* ────────────────────────────────────────────────────────────────────────── */
/* Skeletons                                                                 */
/* ────────────────────────────────────────────────────────────────────────── */
function CardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <GlassCard key={i} className="overflow-hidden">
          <div className="aspect-square w-full bg-white/60 dark:bg-white/[0.08] animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-4 rounded bg-white/70 dark:bg-white/[0.10] animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-white/70 dark:bg-white/[0.10] animate-pulse" />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Form + Grid                                                               */
/* ────────────────────────────────────────────────────────────────────────── */
function ProductCategoriesForm({
  page = 1,
  limit = 16,
  search = "",
}: { page?: number; limit?: number; search?: string }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({ name: "", categoryImage: null, isActive: true });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };

  async function fetchCategories() {
    try {
      setLoading(true);
      const res = await getProductCategory({ page, limit, search });
      setCategories(res?.data || []);
      setTotalPages(res?.totalPages || 1);
      setCurrentPage(res?.currentPage || page || 1);
    } catch (err: any) {
      console.error(err);
      toast("error", "Error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchCategories(); /* eslint-disable-next-line */ }, [page, limit, search]);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: "", categoryImage: null, isActive: true });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      categoryImage: item.categoryImage || null,
      isActive: !!item.isActive,
    });
    setImagePreview(categorySrcOf(item));
    setShowModal(true);
  };
  const handleStatusChange = (id: number, next: boolean) => {
    setCategories((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isActive: next } : it))
    );
  };
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast("warning", "Warning", "Please fill required fields: Name.");
      return;
    }

    try {
      const payload: any = { ...formData };

      if (payload.categoryImage instanceof File) {
        const up = await uploadImage(payload.categoryImage, "images");
        if (up?.success && up?.path) payload.categoryImage = up.path;
        else {
          toast("error", "Error", "Upload failed. Please try again.");
          return;
        }
      }

      if (editingItem) {
        const res = await updateProductCategory(editingItem.id, payload);
        if (!res?.success) throw new Error(res?.message || "Update failed");
        toast("success", "Updated", "Category updated successfully.");
      } else {
        const res = await addProductCategory(payload);
        if (!res?.success) throw new Error(res?.message || "Create failed");
        toast("success", "Created", "Category created successfully.");
      }

      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      toast("error", "Error", "Failed to save category: " + (err?.message || "Unknown error"));
    }
  };

  return (
    <div className="space-y-6">
      {/* header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Product Categories</h2>
        <GlassButton onClick={openAddModal}>Add Category</GlassButton>
      </div>

      {/* grid */}
      <Suspense fallback={<CardSkeletonGrid />}>
        {loading ? (
          <CardSkeletonGrid />
        ) : categories.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((item) => (
              <CategoryCard
                key={item.id}
                item={item}
                onEdit={openEditModal}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <p className="text-slate-700 dark:text-slate-300">No categories found.</p>
          </GlassCard>
        )}
      </Suspense>

      {/* pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link
            href={buildHref(Math.max(1, currentPage - 1))}
            className={cx(
              "px-3 py-2 rounded-xl text-sm border",
              currentPage <= 1
                ? "pointer-events-none opacity-40 border-white/60 dark:border-white/10"
                : "bg-white/70 dark:bg-white/[0.08] border-white/60 dark:border-white/10"
            )}
          >
            Prev
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, idx, arr) => {
              const dots = idx > 0 && p - (arr[idx - 1] ?? 0) > 1;
              return (
                <span key={p} className="inline-flex">
                  {dots && <span className="px-1 text-slate-500">…</span>}
                  <Link
                    href={buildHref(p)}
                    className={cx(
                      "px-3 py-2 rounded-xl text-sm border",
                      p === currentPage
                        ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 border-transparent"
                        : "bg-white/70 dark:bg-white/[0.08] border-white/60 dark:border-white/10"
                    )}
                  >
                    {p}
                  </Link>
                </span>
              );
            })}
          <Link
            href={buildHref(Math.min(totalPages, currentPage + 1))}
            className={cx(
              "px-3 py-2 rounded-xl text-sm border",
              currentPage >= totalPages
                ? "pointer-events-none opacity-40 border-white/60 dark:border-white/10"
                : "bg-white/70 dark:bg-white/[0.08] border-white/60 dark:border-white/10"
            )}
          >
            Next
          </Link>
        </div>
      )}

      {/* modal */}
      <GlassModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Category" : "Add Category"}
      >
        <form
          onSubmit={(e) => { e.preventDefault(); handleSave(); }}
          className="grid gap-5"
        >
          <div className="grid sm:grid-cols-[auto,1fr] gap-5">
            <div className="flex flex-col items-center gap-2">
              {/* SQUARE preview */}
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl ring-4 ring-white/70 dark:ring-white/10 border border-white/60 dark:border-white/10">
                <Image src={imagePreview || FALLBACK_IMG} alt="Preview" fill className="object-cover" />
              </div>
              <label className="cursor-pointer">
                <span className="inline-flex text-sm px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.08]">
                  {editingItem ? "Change Image" : "Upload Image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      setFormData((s: any) => ({ ...s, categoryImage: file }));
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Name</span>
                <GlassInput
                  value={formData.name}
                  onChange={(e) => setFormData((s: any) => ({ ...s, name: e.target.value }))}
                  placeholder="Category name"
                  required
                />
              </label>

              {/* in modal form */}
              <SwitchOS26
                checked={!!formData.isActive}
                onChange={(v) => setFormData((s: any) => ({ ...s, isActive: v }))}
                ariaLabel="Active"
              />

            </div>
          </div>

          <div className="flex justify-end gap-3">
            <GlassButton variant="secondary" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">
              {editingItem ? "Save Changes" : "Add Category"}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/* Page wrapper (Next 15 searchParams Promise)                                */
/* ────────────────────────────────────────────────────────────────────────── */
export default function ProductCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = use(searchParams);
  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";

  return (
    <div className="space-y-8">
      <form method="get" className="flex gap-2">
        <GlassInput name="search" defaultValue={search} placeholder="Search categories…" className="min-w-[260px]" />
        <GlassButton type="submit">Search</GlassButton>
      </form>

      <Suspense fallback={<CardSkeletonGrid />}>
        <ProductCategoriesForm page={page} search={search} />
      </Suspense>
    </div>
  );
}
