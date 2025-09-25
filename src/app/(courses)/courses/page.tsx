
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";

import {
  getCourses,
  getCategories,
  createCourse,
  updateCourse,
  deleteCourses,
} from "@/app/(courses)/fetch";
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "@/components/functions";
import { TransactionsSkeleton } from "@/components/transactions/transaction-skeleton";
import { useToast } from "@/components/Toast/ToastProvider";

/* -------------------------
   tiny utils
-------------------------- */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK_IMG = "https://gyanitalk.com/build/assets/images/person.png";
const courseImg = (p?: string) => (p ? (isValidImageUrl(p) ? `${BASE}${p}` : FALLBACK_IMG) : FALLBACK_IMG);

/* -------------------------
   macOS Tahoe Liquid Glass Design System
-------------------------- */
const glass = {
  // Core surface with ultra-refined translucency
  surface:
    "relative overflow-hidden rounded-[22px] bg-white/[0.72] dark:bg-slate-800/[0.45] " +
    "border-[0.5px] border-white/[0.35] dark:border-slate-600/[0.25] backdrop-blur-[80px] " +
    "shadow-[0_1px_2.5px_0_rgba(16,24,40,0.03),0_2px_20px_0_rgba(16,24,40,0.04)] " +
    "dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.25),0_8px_40px_0_rgba(0,0,0,0.35)] " +
    "after:absolute after:inset-0 after:rounded-[22px] after:bg-gradient-to-br " +
    "after:from-white/[0.08] after:via-white/[0.02] after:to-transparent " +
    "dark:after:from-white/[0.06] dark:after:via-white/[0.015] after:pointer-events-none",
    
  // Hover state with subtle lift and glow
  surfaceHover:
    "transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] " +
    "hover:shadow-[0_2px_4px_0_rgba(16,24,40,0.04),0_8px_32px_0_rgba(16,24,40,0.08)] " +
    "dark:hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.3),0_12px_48px_0_rgba(0,0,0,0.45)] " +
    "hover:-translate-y-[2px] hover:scale-[1.008] " +
    "hover:bg-white/[0.78] dark:hover:bg-slate-800/[0.55]",

  // Modal overlay with deep blur
  modal:
    "relative overflow-hidden rounded-[28px] bg-white/[0.85] dark:bg-slate-900/[0.75] " +
    "border-[0.5px] border-white/[0.45] dark:border-slate-600/[0.3] backdrop-blur-[120px] " +
    "shadow-[0_8px_32px_0_rgba(16,24,40,0.08),0_24px_80px_0_rgba(16,24,40,0.12)] " +
    "dark:shadow-[0_12px_48px_0_rgba(0,0,0,0.3),0_32px_120px_0_rgba(0,0,0,0.5)] " +
    "after:absolute after:inset-0 after:rounded-[28px] after:bg-gradient-to-br " +
    "after:from-white/[0.12] after:via-white/[0.03] after:to-transparent " +
    "dark:after:from-white/[0.08] dark:after:via-white/[0.02] after:pointer-events-none",

  // Input fields with refined styling
  input:
    "rounded-[14px] bg-white/[0.65] dark:bg-slate-800/[0.5] " +
    "border-[0.5px] border-white/[0.25] dark:border-slate-600/[0.3] backdrop-blur-[40px] " +
    "shadow-[inset_0_1px_2px_0_rgba(16,24,40,0.04)] " +
    "dark:shadow-[inset_0_1px_3px_0_rgba(0,0,0,0.2)] " +
    "focus:border-blue-500/[0.4] dark:focus:border-blue-400/[0.4] " +
    "focus:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] dark:focus:shadow-[0_0_0_3px_rgba(96,165,250,0.08)] " +
    "focus:bg-white/[0.78] dark:focus:bg-slate-800/[0.65]",

  // Buttons with refined hierarchy
  buttonPrimary:
    "rounded-[12px] bg-gradient-to-b from-blue-500 to-blue-600 " +
    "shadow-[0_1px_2px_0_rgba(16,24,40,0.05),0_2px_8px_0_rgba(59,130,246,0.15)] " +
    "dark:shadow-[0_2px_4px_0_rgba(0,0,0,0.1),0_4px_16px_0_rgba(59,130,246,0.2)] " +
    "hover:shadow-[0_2px_4px_0_rgba(16,24,40,0.08),0_4px_16px_0_rgba(59,130,246,0.25)] " +
    "hover:from-blue-600 hover:to-blue-700 active:scale-[0.98]",
    
  buttonSecondary:
    "rounded-[12px] bg-white/[0.72] dark:bg-slate-800/[0.5] " +
    "border-[0.5px] border-white/[0.35] dark:border-slate-600/[0.3] backdrop-blur-[40px] " +
    "shadow-[0_1px_2px_0_rgba(16,24,40,0.04)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.15)] " +
    "hover:bg-white/[0.82] dark:hover:bg-slate-800/[0.65] active:scale-[0.98]",

  buttonDanger:
    "rounded-[12px] bg-gradient-to-b from-red-500 to-red-600 " +
    "shadow-[0_1px_2px_0_rgba(16,24,40,0.05),0_2px_8px_0_rgba(239,68,68,0.15)] " +
    "dark:shadow-[0_2px_4px_0_rgba(0,0,0,0.1),0_4px_16px_0_rgba(239,68,68,0.2)] " +
    "hover:from-red-600 hover:to-red-700 active:scale-[0.98]",
};

/* -------------------------
   Atoms - Refined Components
-------------------------- */
function GlassCard({
  children,
  className = "",
  hover = true,
}: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return (
    <div className={cx(glass.surface, hover && glass.surfaceHover, className)}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function GlassButton(
  { children, className = "", variant = "primary", ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }
) {
  const base =
    "inline-flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-medium " +
    "transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 " +
    "dark:focus-visible:ring-blue-400/30 relative z-10";
  
  const styles = {
    primary: cx(glass.buttonPrimary, "text-white font-semibold"),
    secondary: cx(glass.buttonSecondary, "text-gray-900 dark:text-gray-100"),
    danger: cx(glass.buttonDanger, "text-white font-semibold"),
    ghost: "rounded-[12px] text-gray-700 dark:text-gray-300 hover:bg-gray-100/60 dark:hover:bg-white/[0.08] backdrop-blur-[40px]",
  } as const;

  return (
    <button {...rest} className={cx(base, styles[variant], className)}>
      {children}
    </button>
  );
}

function GlassIconButton(
  { ariaLabel, variant = "secondary", className = "", children, ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { ariaLabel: string; variant?: "secondary" | "danger" }
) {
  const base =
    "inline-flex h-9 w-9 items-center justify-center transition-all duration-200 " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 relative z-10";
    
  const styles = {
    secondary: cx(glass.buttonSecondary, "text-gray-700 dark:text-gray-300"),
    danger: cx(glass.buttonDanger, "text-white"),
  } as const;
  
  return (
    <button {...rest} aria-label={ariaLabel} className={cx(base, styles[variant], className)}>
      {children}
    </button>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full px-4 py-3 text-sm outline-none transition-all duration-200",
        glass.input,
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "text-gray-900 dark:text-gray-100",
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
        "w-full px-4 py-3 text-sm outline-none resize-none transition-all duration-200",
        glass.input,
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "text-gray-900 dark:text-gray-100",
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
        "w-full px-4 py-3 text-sm outline-none transition-all duration-200",
        glass.input,
        "text-gray-900 dark:text-gray-100",
        props.className
      )}
    />
  );
}

function GlassSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-[30px] w-[54px] items-center rounded-full transition-all duration-300",
        "border-[0.5px] backdrop-blur-[40px]",
        checked
          ? "bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400/30"
          : cx(glass.input, "border-white/[0.25] dark:border-white/[0.08]")
      )}
    >
      <span
        className={cx(
          "h-[24px] w-[24px] rounded-full bg-white shadow-[0_2px_8px_0_rgba(16,24,40,0.15)] " +
          "dark:shadow-[0_2px_12px_0_rgba(0,0,0,0.3)] transition-all duration-300",
          checked ? "translate-x-[27px]" : "translate-x-[3px]"
        )}
      />
      <span className="sr-only">Toggle</span>
    </button>
  );
}

function GlassModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
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
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6"
      onMouseDown={onClose}
    >
      {/* Ultra-refined backdrop */}
      <div className="absolute inset-0 bg-black/[0.35] dark:bg-black/[0.6] backdrop-blur-[8px]" />
      
      <div className={cx("relative z-10 w-full", maxWidth)} onMouseDown={(e) => e.stopPropagation()}>
        <div className={glass.modal}>
          {/* Header with refined styling */}
          <div className="relative z-10 flex items-center justify-between p-8 pb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
              {title || "Dialog"}
            </h3>
            <GlassButton variant="ghost" onClick={onClose} aria-label="Close" className="p-2">
              <X className="h-5 w-5" />
            </GlassButton>
          </div>
          
          {/* Content area */}
          <div className="relative z-10 max-h-[75vh] overflow-y-auto px-8 pb-8">
            {children}
          </div>
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
      <div className="space-y-6">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <GlassButton variant="secondary" onClick={onCancel}>Cancel</GlassButton>
          <GlassButton variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Working…" : confirmText}
          </GlassButton>
        </div>
      </div>
    </GlassModal>
  );
}

/* -------------------------
   Enhanced Course Card with Tahoe aesthetics
-------------------------- */
function PriceBlock({ price, offer }: { price: number; offer: number }) {
  const hasDeal = offer > 0 && offer < price;
  return (
    <div className="mt-3 flex items-baseline gap-2.5">
      <span className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
        ₹{(hasDeal ? offer : price).toFixed(2)}
      </span>
      {hasDeal && (
        <>
          <span className="text-sm line-through text-gray-500 dark:text-gray-400">
            ₹{price.toFixed(2)}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-[8px] bg-green-100/80 text-green-800 dark:bg-green-500/20 dark:text-green-200 border-[0.5px] border-green-200/60 dark:border-green-500/30 font-medium">
            Save ₹{(price - offer).toFixed(0)}
          </span>
        </>
      )}
    </div>
  );
}

function CourseCard({
  item,
  categoryName,
  onEdit,
  onDelete,
}: {
  item: any;
  categoryName?: string;
  onEdit: (it: any) => void;
  onDelete: (id: number) => void;
}) {
  const paid = Number(item.is_paid) === 1;
  const img = courseImg(item?.image);

  return (
    <GlassCard hover className="group overflow-hidden">
      {/* Enhanced image section */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-[22px]">
        <Image
          src={img}
          alt={item?.name || "Course cover"}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={false}
        />
        
        {/* Refined gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Enhanced badges */}
        <div className="absolute left-4 top-4 flex gap-2">
          <span className={cx(
            "inline-flex items-center rounded-[10px] px-3 py-1.5 text-xs font-medium backdrop-blur-[40px]",
            "bg-white/[0.85] dark:bg-slate-800/[0.75] border-[0.5px] border-white/[0.4] dark:border-slate-600/[0.4]",
            "text-gray-900 dark:text-gray-100 shadow-[0_2px_8px_0_rgba(16,24,40,0.08)]"
          )}>
            {categoryName || "Unassigned"}
          </span>
          
          <span
            className={cx(
              "inline-flex items-center rounded-[10px] px-3 py-1.5 text-xs font-medium backdrop-blur-[40px]",
              "border-[0.5px] shadow-[0_2px_8px_0_rgba(16,24,40,0.08)]",
              paid
                ? "bg-green-100/[0.9] text-green-800 border-green-200/60 dark:bg-green-500/25 dark:text-green-200 dark:border-green-500/30"
                : "bg-red-100/[0.9] text-red-800 border-red-200/60 dark:bg-red-500/25 dark:text-red-200 dark:border-red-500/30"
            )}
          >
            {paid ? "Paid" : "Free"}
          </span>
        </div>

        {/* Refined hover actions */}
        <div className="absolute right-4 top-4 flex gap-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <GlassIconButton ariaLabel="Edit" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </GlassIconButton>
          <GlassIconButton ariaLabel="Delete" variant="danger" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </GlassIconButton>
        </div>
      </div>

      {/* Enhanced content section */}
      <div className="relative z-10 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 tracking-tight">
          {item?.name || "Untitled"}
        </h3>

        <PriceBlock price={Number(item.price || 0)} offer={Number(item.offer_price || 0)} />

        {item?.description && (
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Mobile actions with enhanced styling */}
        <div className="mt-5 flex gap-3 sm:hidden">
          <GlassButton variant="secondary" onClick={() => onEdit(item)} className="flex-1">
            <Pencil className="h-4 w-4" />
            Edit
          </GlassButton>
          <GlassButton variant="danger" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
}

/* -------------------------
   Main Page Component
-------------------------- */
export default function Page() {
  const toast = useToast();

  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // add
  const [showAdd, setShowAdd] = useState(false);
  const [add, setAdd] = useState<any>({
    name: "",
    category_id: "",
    price: 0,
    offer_price: 0,
    is_paid: 0,
    description: "",
    image: null as File | null,
  });
  const [addPreview, setAddPreview] = useState<string | null>(null);
  const [savingAdd, setSavingAdd] = useState(false);

  // edit
  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // delete
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [cRes, catRes] = await Promise.all([getCourses(), getCategories()]);
      setCourses(cRes?.courses || []);
      setCategories(catRes?.categories || []);
    } catch (e: any) {
      console.error(e);
      toast("error", "Error", "Failed to fetch courses/categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const catNameById = (id?: number | string | null) => {
    if (!id && id !== 0) return undefined;
    const num = Number(id);
    return categories.find((c: any) => Number(c.id) === num)?.name;
  };

  const uploadIfFile = async (maybeFile: any) => {
    if (maybeFile instanceof File) {
      const up = await uploadImage(maybeFile, "images");
      if (up?.success && up?.path) return up.path;
      throw new Error("Upload failed. Please try again.");
    }
    return maybeFile || null;
  };

  /* ---------- Add ---------- */
  const openAdd = () => {
    setAdd({
      name: "",
      category_id: "",
      price: 0,
      offer_price: 0,
      is_paid: 0,
      description: "",
      image: null,
    });
    setAddPreview(null);
    setShowAdd(true);
  };

  const submitAdd = async () => {
    if (!add.name.trim() || !add.category_id) {
      toast("warning", "Warning", "Please fill required fields: Name and Category.");
      return;
    }
    try {
      setSavingAdd(true);
      const payload: any = {
        name: add.name.trim(),
        category_id: Number(add.category_id),
        price: Number(add.price || 0),
        offer_price: Number(add.offer_price || 0),
        is_paid: Number(add.is_paid || 0),
        description: add.description?.trim() || "",
      };
      if (add.image) {
        try {
          payload.image = await uploadIfFile(add.image);
        } catch (e: any) {
          toast("error", "Error", e?.message || "Upload failed. Please try again.");
          setSavingAdd(false);
          return;
        }
      }
      const res = await createCourse(payload);
      if (res?.success) {
        toast("success", "Success", "Course created successfully.");
        setShowAdd(false);
        await load();
      } else {
        toast("error", "Error", res?.message || "Failed to create course");
      }
    } catch (err: any) {
      console.error(err);
      toast("error", "Error", err?.message || "Failed to create course");
    } finally {
      setSavingAdd(false);
    }
  };

  /* ---------- Edit ---------- */
  const openEdit = (item: any) => {
    setEdit({
      id: item.id,
      name: item.name ?? "",
      category_id: item.category_id ?? "",
      price: item.price ?? 0,
      offer_price: item.offer_price ?? 0,
      is_paid: Number(item.is_paid ?? 0),
      description: item.description ?? "",
      image: null as File | null,
    });
    setEditPreview(courseImg(item?.image));
    setShowEdit(true);
  };

  const submitEdit = async () => {
    if (!edit?.id) return;
    if (!edit.name.trim() || !edit.category_id) {
      toast("warning", "Warning", "Please fill required fields: Name and Category.");
      return;
    }
    try {
      setSavingEdit(true);
      const payload: any = {
        name: edit.name.trim(),
        category_id: Number(edit.category_id),
        price: Number(edit.price || 0),
        offer_price: Number(edit.offer_price || 0),
        is_paid: Number(edit.is_paid || 0),
        description: edit.description?.trim() || "",
      };
      if (edit.image instanceof File) {
        try {
          payload.image = await uploadIfFile(edit.image);
        } catch (e: any) {
          toast("error", "Error", e?.message || "Upload failed. Please try again.");
          setSavingEdit(false);
          return;
        }
      }
      const res = await updateCourse(edit.id, payload);
      if (res?.success) {
        toast("success", "Success", "Course updated successfully.");
        setShowEdit(false);
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

  /* ---------- Delete ---------- */
  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      setDeleting(true);
      const res = await deleteCourses(confirmId);
      if (res?.success) {
        toast("success", "Success", "Course deleted successfully.");
        setConfirmId(null);
        await load();
      } else {
        toast("error", "Error", res?.message || "Failed to delete");
      }
    } catch (e: any) {
      console.error(e);
      toast("error", "Error", e?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative px-5 py-5 w-full min-w-0 space-y-8 overflow-x-hidden">
      {/* Refined ambient lighting */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-48 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-blue-400/[0.08] to-indigo-500/[0.06] blur-[120px]" />
        <div className="absolute -bottom-48 -left-48 w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-purple-400/[0.06] to-pink-400/[0.04] blur-[120px]" />
      </div>

      {/* Enhanced header */}
      <div className="flex items-center justify-between mt-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
          Courses
        </h1>
        <GlassButton onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Course
        </GlassButton>
      </div>

      <Suspense fallback={<TransactionsSkeleton />}>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <GlassCard key={i} className="overflow-hidden" hover={false}>
                <div className="h-48 w-full bg-gray-200/60 dark:bg-slate-800/50 animate-pulse rounded-t-[22px]" />
                <div className="p-6 space-y-3">
                  <div className="h-5 rounded-[8px] bg-gray-200/60 dark:bg-slate-800/50 animate-pulse" />
                  <div className="h-4 w-2/3 rounded-[8px] bg-gray-200/60 dark:bg-slate-800/50 animate-pulse" />
                  <div className="h-3 w-1/2 rounded-[8px] bg-gray-200/60 dark:bg-slate-800/50 animate-pulse" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {courses.map((c) => (
              <CourseCard
                key={c.id}
                item={c}
                categoryName={catNameById(c.category_id)}
                onEdit={openEdit}
                onDelete={(id) => setConfirmId(id)}
              />
            ))}
          </div>
        )}
      </Suspense>

      {/* Enhanced Add Modal */}
      <GlassModal open={showAdd} onClose={() => setShowAdd(false)} title="Add Course">
        <div className="space-y-6">
          <div className="grid sm:grid-cols-[auto,1fr] gap-6">
            {/* Image upload section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-32 w-32 overflow-hidden rounded-[18px] bg-gray-100/60 dark:bg-slate-800/60 border-[0.5px] border-white/[0.25] dark:border-slate-600/[0.3] backdrop-blur-[40px]">
                <Image src={addPreview || FALLBACK_IMG} alt="Preview" fill className="object-cover" />
              </div>
              <label className="cursor-pointer">
                <span className={cx(
                  "inline-flex items-center text-sm px-4 py-2 rounded-[12px] font-medium transition-all duration-200",
                  glass.buttonSecondary,
                  "text-gray-700 dark:text-gray-300"
                )}>
                  Upload Image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAdd((s: any) => ({ ...s, image: f }));
                    setAddPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
              </label>
            </div>

            {/* Form fields */}
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Course Name *
                </span>
                <GlassInput 
                  value={add.name} 
                  onChange={(e) => setAdd((s: any) => ({ ...s, name: e.target.value }))} 
                  placeholder="Enter course name" 
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Category *
                </span>
                <GlassSelect 
                  value={add.category_id} 
                  onChange={(e) => setAdd((s: any) => ({ ...s, category_id: e.target.value }))}
                >
                  <option value="">Select a category…</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </GlassSelect>
              </label>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
              Description
            </span>
            <GlassTextarea 
              rows={4} 
              value={add.description} 
              onChange={(e) => setAdd((s: any) => ({ ...s, description: e.target.value }))} 
              placeholder="Brief description of the course…"
            />
          </label>

          <div className="grid sm:grid-cols-3 gap-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Price (₹)
              </span>
              <GlassInput 
                type="number" 
                value={add.price} 
                onChange={(e) => setAdd((s: any) => ({ ...s, price: Number(e.target.value) }))} 
                placeholder="0"
              />
            </label>
            
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Offer Price (₹)
              </span>
              <GlassInput 
                type="number" 
                value={add.offer_price} 
                onChange={(e) => setAdd((s: any) => ({ ...s, offer_price: Number(e.target.value) }))} 
                placeholder="0"
              />
            </label>
            
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Paid Course
              </span>
              <div className="mt-3">
                <GlassSwitch 
                  checked={Number(add.is_paid) === 1} 
                  onChange={(v) => setAdd((s: any) => ({ ...s, is_paid: v ? 1 : 0 }))} 
                />
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/[0.15] dark:border-white/[0.08]">
            <GlassButton variant="secondary" onClick={() => setShowAdd(false)}>
              Cancel
            </GlassButton>
            <GlassButton onClick={submitAdd} disabled={savingAdd}>
              {savingAdd ? "Creating…" : "Create Course"}
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Enhanced Edit Modal */}
      <GlassModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Course">
        {edit && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-[auto,1fr] gap-6">
              {/* Image upload section */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative h-32 w-32 overflow-hidden rounded-[18px] bg-gray-100/60 dark:bg-slate-800/60 border-[0.5px] border-white/[0.25] dark:border-slate-600/[0.3] backdrop-blur-[40px]">
                  <Image src={editPreview || FALLBACK_IMG} alt="Preview" fill className="object-cover" />
                </div>
                <label className="cursor-pointer">
                  <span className={cx(
                    "inline-flex items-center text-sm px-4 py-2 rounded-[12px] font-medium transition-all duration-200",
                    glass.buttonSecondary,
                    "text-gray-700 dark:text-gray-300"
                  )}>
                    Change Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setEdit((s: any) => ({ ...s, image: f }));
                      setEditPreview(f ? URL.createObjectURL(f) : editPreview);
                    }}
                  />
                </label>
              </div>

              {/* Form fields */}
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Course Name *
                  </span>
                  <GlassInput 
                    value={edit.name} 
                    onChange={(e) => setEdit((s: any) => ({ ...s, name: e.target.value }))} 
                    placeholder="Enter course name" 
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Category *
                  </span>
                  <GlassSelect 
                    value={edit.category_id} 
                    onChange={(e) => setEdit((s: any) => ({ ...s, category_id: e.target.value }))}
                  >
                    <option value="">Select a category…</option>
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </GlassSelect>
                </label>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                Description
              </span>
              <GlassTextarea 
                rows={4} 
                value={edit.description || ""} 
                onChange={(e) => setEdit((s: any) => ({ ...s, description: e.target.value }))} 
                placeholder="Brief description of the course…"
              />
            </label>

            <div className="grid sm:grid-cols-3 gap-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Price (₹)
                </span>
                <GlassInput 
                  type="number" 
                  value={edit.price} 
                  onChange={(e) => setEdit((s: any) => ({ ...s, price: Number(e.target.value) }))} 
                  placeholder="0"
                />
              </label>
              
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Offer Price (₹)
                </span>
                <GlassInput 
                  type="number" 
                  value={edit.offer_price} 
                  onChange={(e) => setEdit((s: any) => ({ ...s, offer_price: Number(e.target.value) }))} 
                  placeholder="0"
                />
              </label>
              
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Paid Course
                </span>
                <div className="mt-3">
                  <GlassSwitch 
                    checked={Number(edit.is_paid) === 1} 
                    onChange={(v) => setEdit((s: any) => ({ ...s, is_paid: v ? 1 : 0 }))} 
                  />
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-white/[0.15] dark:border-white/[0.08]">
              <GlassButton variant="secondary" onClick={() => setShowEdit(false)}>
                Cancel
              </GlassButton>
              <GlassButton onClick={submitEdit} disabled={savingEdit}>
                {savingEdit ? "Saving…" : "Save Changes"}
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Enhanced Delete Confirmation */}
      <ConfirmModal
        open={confirmId !== null}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone and will permanently remove all course data."
        confirmText="Delete Course"
        loading={deleting}
        onCancel={() => setConfirmId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}