
"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, X, Play, FileText } from "lucide-react";
import { createPortal } from "react-dom";
import {
  getChapters,
  getCourses,
  createChapter,
  updateChapter,
  deleteChapters,
} from "@/app/(courses)/fetch";
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "@/components/functions";
import { TransactionsSkeleton } from "@/components/transactions/transaction-skeleton";
import toast from "react-hot-toast";

/* -------------------------
   tiny utils
-------------------------- */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK_IMG = "https://gyanitalk.com/build/assets/images/person.png";
const imageUrl = (path?: string) =>
  path ? (isValidImageUrl(path) ? `${BASE}/public${path}` : FALLBACK_IMG) : FALLBACK_IMG;

type Course = { id: number; name: string };

/* -------------------------
   Enhanced Liquid Glass tokens with depth and vitality
-------------------------- */
const glass = {
  surface:
    "relative overflow-hidden rounded-[28px] bg-white/75 dark:bg-slate-900/60 " +
    "border border-white/40 dark:border-white/10 backdrop-blur-2xl " +
    "shadow-[0_24px_48px_-12px_rgba(2,6,23,0.25)] dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] " +
    "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/30 before:via-white/5 before:to-transparent " +
    "before:dark:from-white/8 before:dark:via-white/2 before:pointer-events-none",
  
  cardHover:
    "group-hover:scale-[1.02] group-hover:shadow-[0_32px_64px_-12px_rgba(2,6,23,0.35)] " +
    "group-hover:dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.9)] " +
    "group-hover:bg-white/85 group-hover:dark:bg-slate-900/70 " +
    "group-hover:border-white/60 group-hover:dark:border-white/15",

  sheen:
    "pointer-events-none absolute inset-0 bg-gradient-to-br " +
    "from-white/40 via-transparent to-transparent dark:from-white/12 dark:via-transparent " +
    "opacity-60 group-hover:opacity-100 transition-opacity duration-700",
  
  innerGlow:
    "absolute inset-px rounded-[27px] bg-gradient-to-b from-white/20 to-transparent " +
    "dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
  
  ring:
    "ring-1 ring-white/50 dark:ring-white/8 border border-white/40 dark:border-white/10",
    
  floating:
    "transform-gpu transition-all duration-500 ease-out hover:scale-[1.02] " +
    "hover:shadow-[0_32px_64px_-16px_rgba(56,189,248,0.4)] hover:-translate-y-1",
};

/* -------------------------
   Enhanced Interactive Components
-------------------------- */
function GlassCard({
  children,
  className = "",
  hover = true,
}: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return (
    <div className={cx(
      glass.surface,
      hover && "group cursor-pointer transition-all duration-500",
      hover && glass.cardHover,
      className
    )}>
      <div className={glass.sheen} />
      <div className={glass.innerGlow} />
      <div className="relative z-10">{children}</div>
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
    "group inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 " +
    "disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 " +
    "transform-gpu hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden";
  
  const styles = {
    primary:
      "text-white bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 " +
      "hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 " +
      "shadow-[0_20px_40px_-12px_rgba(59,130,246,0.6)] hover:shadow-[0_24px_48px_-12px_rgba(59,130,246,0.8)] " +
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
      "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
    
    secondary:
      "text-slate-800 dark:text-slate-100 bg-white/80 dark:bg-slate-800/60 " +
      "border border-white/60 dark:border-white/15 hover:bg-white/90 dark:hover:bg-slate-800/70 " +
      "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_-8px_rgba(0,0,0,0.18)] " +
      "backdrop-blur-xl",
    
    danger:
      "text-white bg-gradient-to-br from-rose-500 via-red-500 to-red-600 " +
      "hover:from-rose-400 hover:via-red-400 hover:to-red-500 " +
      "shadow-[0_20px_40px_-12px_rgba(244,63,94,0.6)] hover:shadow-[0_24px_48px_-12px_rgba(244,63,94,0.8)] " +
      "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent " +
      "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
    
    ghost:
      "text-slate-700 dark:text-slate-300 hover:bg-white/40 dark:hover:bg-slate-800/40 " +
      "backdrop-blur-lg border border-transparent hover:border-white/30 dark:hover:border-white/10",
  } as const;

  return (
    <button {...rest} className={cx(base, styles[variant], className)}>
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </button>
  );
}

function GlassIconButton(
  { ariaLabel, variant = "secondary", className = "", children, ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { ariaLabel: string; variant?: "secondary" | "danger" }
) {
  const styles = {
    secondary:
      "bg-white/85 dark:bg-slate-800/70 border border-white/60 dark:border-white/15 " +
      "hover:bg-white/95 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 " +
      "shadow-[0_8px_24px_-6px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.25)]",
    
    danger:
      "text-white bg-gradient-to-br from-rose-500 to-red-600 " +
      "hover:from-rose-400 hover:to-red-500 " +
      "shadow-[0_12px_28px_-8px_rgba(244,63,94,0.6)] hover:shadow-[0_16px_36px_-8px_rgba(244,63,94,0.8)]",
  } as const;
  
  return (
    <button
      {...rest}
      aria-label={ariaLabel}
      className={cx(
        "group inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 " +
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 backdrop-blur-xl " +
        "transform-gpu hover:scale-110 active:scale-95",
        styles[variant],
        className
      )}
    >
      <span className="transition-transform duration-200 group-hover:scale-110">
        {children}
      </span>
    </button>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-300",
        "bg-white/90 dark:bg-slate-900/70 border border-white/50 dark:border-white/15",
        "focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400/50 focus:bg-white dark:focus:bg-slate-900/80",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100 backdrop-blur-xl",
        "hover:border-white/70 dark:hover:border-white/20",
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
        "w-full rounded-2xl px-5 py-4 text-sm outline-none resize-none transition-all duration-300",
        "bg-white/90 dark:bg-slate-900/70 border border-white/50 dark:border-white/15",
        "focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400/50 focus:bg-white dark:focus:bg-slate-900/80",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        "text-slate-900 dark:text-slate-100 backdrop-blur-xl",
        "hover:border-white/70 dark:hover:border-white/20",
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
        "w-full rounded-2xl px-5 py-3.5 text-sm outline-none transition-all duration-300",
        "bg-white/90 dark:bg-slate-900/70 border border-white/50 dark:border-white/15",
        "focus:ring-2 focus:ring-sky-400/60 focus:border-sky-400/50",
        "text-slate-900 dark:text-slate-100 backdrop-blur-xl",
        "hover:border-white/70 dark:hover:border-white/20",
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
        "relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 border",
        "transform-gpu hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60",
        checked
          ? "bg-gradient-to-r from-sky-500 to-blue-600 border-sky-400/40 shadow-[0_8px_24px_-6px_rgba(59,130,246,0.6)]"
          : "bg-white/70 dark:bg-slate-800/70 border-white/60 dark:border-white/15 hover:bg-white/80 dark:hover:bg-slate-800/80"
      )}
    >
      <span
        className={cx(
          "h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-300 translate-x-1",
          "shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)]",
          checked && "translate-x-7 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.4)]"
        )}
      />
      <span className="sr-only">Toggle</span>
    </button>
  );
}

/* -------------------------
   Enhanced Modal with deeper glass effect
-------------------------- */
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
  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] grid place-items-center p-4 md:p-8 animate-in fade-in duration-300"
      onMouseDown={(e) => e.currentTarget === e.target && onClose()}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className={cx("relative w-full animate-in zoom-in-95 duration-300", maxWidth)}>
        <div className={cx(
          glass.surface,
          "border-white/50 dark:border-white/20",
          "shadow-[0_48px_80px_-12px_rgba(0,0,0,0.4)]"
        )}>
          <div className={glass.sheen} />
          <div className="relative z-10">
            <div className="flex items-center justify-between p-8 border-b border-white/50 dark:border-white/15">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {title || "Dialog"}
              </h3>
              <GlassIconButton ariaLabel="Close" onClick={onClose}>
                <X className="h-5 w-5" />
              </GlassIconButton>
            </div>
            <div className="max-h-[80vh] overflow-y-auto p-8">{children}</div>
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
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{message}</p>
      <div className="mt-8 flex justify-end gap-4">
        <GlassButton variant="secondary" onClick={onCancel}>Cancel</GlassButton>
        <GlassButton variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Working…" : confirmText}
        </GlassButton>
      </div>
    </GlassModal>
  );
}

/* -------------------------
   Enhanced Chapter Card with rich interactions
-------------------------- */
function PaidBadge({ isPaid }: { isPaid: boolean }) {
  return (
    <div
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur-lg border",
        "shadow-[0_4px_12px_-4px_rgba(0,0,0,0.2)] transition-all duration-300",
        isPaid
          ? "bg-emerald-200/90 text-emerald-900 dark:bg-emerald-500/25 dark:text-emerald-200 " +
            "border-emerald-900/20 dark:border-emerald-400/30 shadow-emerald-500/20"
          : "bg-orange-200/90 text-orange-900 dark:bg-orange-500/25 dark:text-orange-200 " +
            "border-orange-900/20 dark:border-orange-400/30 shadow-orange-500/20"
      )}
    >
      <div className={cx(
        "h-1.5 w-1.5 rounded-full",
        isPaid ? "bg-emerald-600 dark:bg-emerald-400" : "bg-orange-600 dark:bg-orange-400"
      )} />
      {isPaid ? "Premium" : "Free"}
    </div>
  );
}

function ChapterCard({
  item,
  courseName,
  onEdit,
  onDelete,
}: {
  item: any;
  courseName?: string;
  onEdit: (it: any) => void;
  onDelete: (id: number) => void;
}) {
  const isPaid = Number(item.is_paid) === 1;
  const img = imageUrl(item?.image);

  return (
    <GlassCard hover className="group overflow-hidden">
      {/* Enhanced Media Section */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={img}
          alt={item?.title || "Chapter cover"}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Floating Badges */}
        <div className="absolute left-4 top-4 flex flex-col gap-2">
          <div className="backdrop-blur-lg bg-white/90 dark:bg-slate-900/80 rounded-2xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 border border-white/60 dark:border-white/20 shadow-lg">
            {courseName || "Unassigned"}
          </div>
          <PaidBadge isPaid={isPaid} />
        </div>

        {/* Interactive Action Panel */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
          <GlassIconButton ariaLabel="Edit" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </GlassIconButton>
          <GlassIconButton ariaLabel="Delete" variant="danger" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </GlassIconButton>
        </div>

        {/* Content Preview Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3">
            {item.video && (
              <div className="flex items-center gap-1.5 text-white/90 text-xs">
                <Play className="h-3.5 w-3.5" />
                <span>Video</span>
              </div>
            )}
            {item.pdf && (
              <div className="flex items-center gap-1.5 text-white/90 text-xs">
                <FileText className="h-3.5 w-3.5" />
                <span>PDF</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {item?.title || "Untitled Chapter"}
          </h3>
        </div>
        
        {item?.description && (
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
            {item.description}
          </p>
        )}

        {/* Mobile action bar */}
        <div className="mt-4 flex gap-2 sm:hidden">
          <GlassButton variant="secondary" onClick={() => onEdit(item)} className="flex-1 text-xs">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </GlassButton>
          <GlassButton variant="danger" onClick={() => onDelete(item.id)} className="text-xs">
            <Trash2 className="h-3.5 w-3.5" />
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
  const [chapters, setChapters] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  // add
  const [showAdd, setShowAdd] = useState(false);
  const [add, setAdd] = useState<any>({
    course_id: null as number | null,
    title: "",
    description: "",
    pdf_type: "file",
    pdf: null as File | null,
    image_type: "file",
    image: null as File | null,
    video_type: "link",
    video: "" as string | File,
    video_format: "",
    is_paid: 0,
  });
  const [addImgPreview, setAddImgPreview] = useState<string | null>(null);
  const [savingAdd, setSavingAdd] = useState(false);

  // edit
  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState<any>(null);
  const [editImgPreview, setEditImgPreview] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // delete
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const courseNameById = (id?: number | null) =>
    id ? courses.find((c) => c.id === Number(id))?.name : undefined;

  const uploadIfFile = async (maybeFile: any, folder: "image" | "pdf" | "video") => {
    if (maybeFile instanceof File) {
      const uploaded = await uploadImage(
        maybeFile,
        folder,
        process.env.NEXT_PUBLIC_CHAPTER_UPLOAD_PATH
      );
      if (uploaded?.success && uploaded?.path) {
        return uploaded.path.replace("public", "");
      }
      throw new Error(`Failed to upload ${folder}`);
    }
    return maybeFile || null;
  };

  const load = async () => {
    try {
      setLoading(true);
      const [c1, c2] = await Promise.all([getChapters(), getCourses()]);
      setChapters(c1?.chapters || []);
      setCourses(c2?.courses || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch chapters/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------- Add Functions ---------- */
  const openAdd = () => {
    setAdd({
      course_id: null,
      title: "",
      description: "",
      pdf_type: "file",
      pdf: null,
      image_type: "file",
      image: null,
      video_type: "link",
      video: "",
      video_format: "",
      is_paid: 0,
    });
    setAddImgPreview(null);
    setShowAdd(true);
  };

  const submitAdd = async () => {
    if (!add.title.trim() || !add.course_id) {
      toast("Please fill required fields: Title and Course.");
      return;
    }
    try {
      setSavingAdd(true);
      const payload: any = {
        course_id: Number(add.course_id),
        title: add.title.trim(),
        description: add.description?.trim() || "",
        pdf_type: add.pdf_type,
        image_type: add.image_type,
        video_type: add.video_type,
        video_format: add.video_format,
        is_paid: Number(add.is_paid || 0),
      };

      payload.pdf = add.pdf_type === "file" ? await uploadIfFile(add.pdf, "pdf") : add.pdf || "";
      payload.image = add.image_type === "file" ? await uploadIfFile(add.image, "image") : add.image || "";
      payload.video = add.video_type === "file" ? await uploadIfFile(add.video, "video") : add.video || "";

      const res = await createChapter(payload);
      if (res?.success) {
        toast.success("Chapter created successfully");
        setShowAdd(false);
        await load();
      } else {
        toast.error(res?.message || "Failed to create chapter");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to create chapter");
    } finally {
      setSavingAdd(false);
    }
  };

  /* ---------- Edit Functions ---------- */
  const openEdit = (item: any) => {
    setEdit({
      id: item.id,
      course_id: item.course_id ?? null,
      title: item.title ?? "",
      description: item.description ?? "",
      pdf_type: item.pdf_type ?? "file",
      pdf: item.pdf ?? "",
      image_type: item.image_type ?? "file",
      image: item.image ?? "",
      video_type: item.video_type ?? "link",
      video: item.video ?? "",
      video_format: item.video_format ?? "",
      is_paid: Number(item.is_paid ?? 0),
    });
    setEditImgPreview(imageUrl(item?.image));
    setShowEdit(true);
  };

  const submitEdit = async () => {
    if (!edit?.id) return;
    if (!edit.title.trim() || !edit.course_id) {
      toast("Please fill required fields: Title and Course.");
      return;
    }
    try {
      setSavingEdit(true);
      const payload: any = {
        course_id: Number(edit.course_id),
        title: edit.title.trim(),
        description: edit.description?.trim() || "",
        pdf_type: edit.pdf_type,
        image_type: edit.image_type,
        video_type: edit.video_type,
        video_format: edit.video_format,
        is_paid: Number(edit.is_paid || 0),
      };

      payload.pdf = edit.pdf_type === "file" ? await uploadIfFile(edit.pdf, "pdf") : edit.pdf || "";
      payload.image = edit.image_type === "file" ? await uploadIfFile(edit.image, "image") : edit.image || "";
      payload.video = edit.video_type === "file" ? await uploadIfFile(edit.video, "video") : edit.video || "";

      const res = await updateChapter(edit.id, payload);
      if (res?.success) {
        toast.success("Chapter updated successfully");
        setShowEdit(false);
        await load();
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Update failed");
    } finally {
      setSavingEdit(false);
    }
  };

  /* ---------- Delete Functions ---------- */
  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      setDeleting(true);
      const res = await deleteChapters(confirmId);
      if (res?.success) {
        toast.success("Chapter deleted successfully");
        setConfirmId(null);
        await load();
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative px-5 py-5 w-full min-w-0 space-y-8 overflow-x-hidden">
      {/* Enhanced Ambient Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-48 w-[36rem] h-[36rem] rounded-full bg-gradient-to-br from-sky-400/8 via-blue-400/6 to-indigo-400/8 blur-3xl animate-pulse" />
        <div className="absolute -bottom-48 -left-48 w-[40rem] h-[40rem] rounded-full bg-gradient-to-tr from-indigo-400/8 via-purple-400/6 to-pink-400/8 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] rounded-full bg-gradient-to-r from-cyan-400/4 to-blue-400/4 blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Enhanced Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Chapters
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
            Manage your course content with style
          </p>
        </div>
        <GlassButton onClick={openAdd} className="shadow-xl">
          <Plus className="h-5 w-5" />
          Create Chapter
        </GlassButton>
      </div>

      {/* Enhanced Grid Layout */}
      <Suspense fallback={<TransactionsSkeleton />}>
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <GlassCard key={i} className="overflow-hidden animate-pulse" hover={false}>
                <div className="h-56 w-full bg-gradient-to-br from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-800/40" />
                <div className="p-6 space-y-3">
                  <div className="h-6 rounded-2xl bg-gradient-to-r from-white/70 to-white/50 dark:from-slate-800/70 dark:to-slate-800/50" />
                  <div className="h-4 w-3/4 rounded-2xl bg-gradient-to-r from-white/60 to-white/40 dark:from-slate-800/60 dark:to-slate-800/40" />
                  <div className="h-4 w-1/2 rounded-2xl bg-gradient-to-r from-white/50 to-white/30 dark:from-slate-800/50 dark:to-slate-800/30" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <GlassCard className="p-12 text-center max-w-md" hover={false}>
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 dark:from-sky-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-sky-600 dark:text-sky-400" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">No chapters yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Get started by creating your first chapter. Share knowledge and inspire learning.
              </p>
              <GlassButton onClick={openAdd}>
                <Plus className="h-4 w-4" />
                Create First Chapter
              </GlassButton>
            </GlassCard>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {chapters.map((ch, index) => (
              <div 
                key={ch.id} 
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ChapterCard
                  item={ch}
                  courseName={courseNameById(ch.course_id)}
                  onEdit={openEdit}
                  onDelete={(id) => setConfirmId(id)}
                />
              </div>
            ))}
          </div>
        )}
      </Suspense>

      {/* Enhanced Add Modal */}
      <GlassModal open={showAdd} onClose={() => setShowAdd(false)} title="Create New Chapter">
        <div className="space-y-8">
          {/* Media Preview & Basic Info */}
          <div className="grid lg:grid-cols-[auto,1fr] gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className={cx(
                "relative h-32 w-32 overflow-hidden rounded-3xl group cursor-pointer",
                glass.ring,
                "hover:scale-105 transition-all duration-300"
              )}>
                <Image 
                  src={addImgPreview || FALLBACK_IMG} 
                  alt="Preview" 
                  fill 
                  className="object-cover transition-all duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <Pencil className="w-4 h-4 text-slate-700" />
                  </div>
                </div>
              </div>
              <label className="cursor-pointer">
                <GlassButton variant="secondary" className="text-xs">
                  Upload Cover Image
                </GlassButton>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAdd((s: any) => ({ ...s, image_type: "file", image: f }));
                    setAddImgPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
              </label>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6">
                <label className="block">
                  <span className="mb-3 block text-sm font-bold text-slate-800 dark:text-slate-200">Chapter Title</span>
                  <GlassInput
                    value={add.title}
                    onChange={(e) => setAdd((s: any) => ({ ...s, title: e.target.value }))}
                    placeholder="Enter a compelling chapter title..."
                    className="text-lg font-semibold"
                  />
                </label>

                <label className="block">
                  <span className="mb-3 block text-sm font-bold text-slate-800 dark:text-slate-200">Course</span>
                  <GlassSelect
                    value={add.course_id ?? ""}
                    onChange={(e) => setAdd((s: any) => ({ ...s, course_id: Number(e.target.value) || null }))}
                    className="text-lg"
                  >
                    <option value="">Select a course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </GlassSelect>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <label className="block">
            <span className="mb-3 block text-sm font-bold text-slate-800 dark:text-slate-200">Description</span>
            <GlassTextarea
              rows={4}
              value={add.description}
              onChange={(e) => setAdd((s: any) => ({ ...s, description: e.target.value }))}
              placeholder="Write a compelling description that will engage your students..."
            />
          </label>

          {/* Enhanced Media Sections */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* PDF Section */}
            <GlassCard className="p-6" hover={false}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">PDF Content</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Upload or link to PDF</p>
                    </div>
                  </div>
                  <GlassSelect
                    value={add.pdf_type}
                    onChange={(e) => setAdd((s: any) => ({ ...s, pdf_type: e.target.value }))}
                    className="w-24 text-sm"
                  >
                    <option value="file">File</option>
                    <option value="link">Link</option>
                  </GlassSelect>
                </div>
                {add.pdf_type === "file" ? (
                  <div className="border-2 border-dashed border-white/60 dark:border-white/20 rounded-2xl p-6 text-center hover:border-sky-400/60 transition-colors duration-300">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setAdd((s: any) => ({ ...s, pdf: e.target.files?.[0] || null }))}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                      <div className="text-slate-600 dark:text-slate-300">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-medium">Click to upload PDF</p>
                        <p className="text-xs opacity-75">Or drag and drop</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <GlassInput
                    placeholder="https://example.com/document.pdf"
                    value={(add.pdf as string) || ""}
                    onChange={(e) => setAdd((s: any) => ({ ...s, pdf: e.target.value }))}
                  />
                )}
              </div>
            </GlassCard>

            {/* Video Section */}
            <GlassCard className="p-6" hover={false}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">Video Content</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Upload or link to video</p>
                    </div>
                  </div>
                  <GlassSelect
                    value={add.video_type}
                    onChange={(e) => setAdd((s: any) => ({ ...s, video_type: e.target.value }))}
                    className="w-24 text-sm"
                  >
                    <option value="link">Link</option>
                    <option value="file">File</option>
                  </GlassSelect>
                </div>
                {add.video_type === "file" ? (
                  <div className="border-2 border-dashed border-white/60 dark:border-white/20 rounded-2xl p-6 text-center hover:border-purple-400/60 transition-colors duration-300">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setAdd((s: any) => ({ ...s, video: e.target.files?.[0] || null }))}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <div className="text-slate-600 dark:text-slate-300">
                        <Play className="w-8 h-8 mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-medium">Click to upload video</p>
                        <p className="text-xs opacity-75">Or drag and drop</p>
                      </div>
                    </label>
                  </div>
                ) : (
                  <GlassInput
                    placeholder="https://youtube.com/watch?v=..."
                    value={(add.video as string) || ""}
                    onChange={(e) => setAdd((s: any) => ({ ...s, video: e.target.value }))}
                  />
                )}
                <GlassInput
                  placeholder="Video format (e.g., mp4, webm)"
                  value={add.video_format || ""}
                  onChange={(e) => setAdd((s: any) => ({ ...s, video_format: e.target.value }))}
                  className="text-sm"
                />
              </div>
            </GlassCard>
          </div>

          {/* Premium Toggle */}
          <GlassCard className="p-6" hover={false}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <div className={cx(
                    "h-1.5 w-1.5 rounded-full",
                    Number(add.is_paid) === 1 ? "bg-white" : "bg-white/60"
                  )} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Premium Content</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {Number(add.is_paid) === 1 ? "This chapter requires payment" : "Free for all students"}
                  </p>
                </div>
              </div>
              <GlassSwitch
                checked={Number(add.is_paid) === 1}
                onChange={(v) => setAdd((s: any) => ({ ...s, is_paid: v ? 1 : 0 }))}
              />
            </div>
          </GlassCard>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <GlassButton variant="secondary" onClick={() => setShowAdd(false)} className="px-8">
              Cancel
            </GlassButton>
            <GlassButton onClick={submitAdd} disabled={savingAdd} className="px-8">
              {savingAdd ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Chapter
                </>
              )}
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Enhanced Edit Modal */}
      <GlassModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Chapter">
        {edit && (
          <div className="space-y-8">
            {/* Media Preview & Basic Info */}
            <div className="grid lg:grid-cols-[auto,1fr] gap-8">
              <div className="flex flex-col items-center gap-4">
                <div className={cx(
                  "relative h-32 w-32 overflow-hidden rounded-3xl group cursor-pointer",
                  glass.ring,
                  "hover:scale-105 transition-all duration-300"
                )}>
                  <Image 
                    src={editImgPreview || FALLBACK_IMG} 
                    alt="Preview" 
                    fill 
                    className="object-cover transition-all duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                      <Pencil className="w-4 h-4 text-slate-700" />
                    </div>
                  </div>
                </div>
                <label className="cursor-pointer">
                  <GlassButton variant="secondary" className="text-xs">
                    Change Cover
                  </GlassButton>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setEdit((s: any) => ({ ...s, image_type: "file", image: f }));
                      setEditImgPreview(f ? URL.createObjectURL(f) : editImgPreview);
                    }}
                  />
                </label>
              </div>

              <div className="space-y-6">
                <div className="grid gap-6">
                  <label className="block">
                    <span className="mb-3 block text-sm font-bold text-slate-800 dark:text-slate-200">Chapter Title</span>
                    <GlassInput
                      value={edit.title}
                      onChange={(e) => setEdit((s: any) => ({ ...s, title: e.target.value }))}
                      placeholder="Enter a compelling chapter title..."
                      className="text-lg font-semibold"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-3 block text-sm font-bold text-slate-800 dark:text-slate-200">Course</span>
                    <GlassSelect
                      value={edit.course_id ?? ""}
                      onChange={(e) => setEdit((s: any) => ({ ...s, course_id: Number(e.target.value) || null }))}
                      className="text-lg"
                    >
                      <option value="">Select a course...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </GlassSelect>
                  </label>
                </div>
              </div>
            </div>

            {/* Description */}
            <label className="block">
              <span className="mb-3 block text-sm font-bold text-slate-800 dark:text-slate-200">Description</span>
              <GlassTextarea
                rows={4}
                value={edit.description || ""}
                onChange={(e) => setEdit((s: any) => ({ ...s, description: e.target.value }))}
                placeholder="Write a compelling description that will engage your students..."
              />
            </label>

            {/* Media Sections */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* PDF Section */}
              <GlassCard className="p-6" hover={false}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">PDF Content</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Upload or link to PDF</p>
                      </div>
                    </div>
                    <GlassSelect
                      value={edit.pdf_type}
                      onChange={(e) => setEdit((s: any) => ({ ...s, pdf_type: e.target.value }))}
                      className="w-24 text-sm"
                    >
                      <option value="file">File</option>
                      <option value="link">Link</option>
                    </GlassSelect>
                  </div>
                  {edit.pdf_type === "file" ? (
                    <div className="border-2 border-dashed border-white/60 dark:border-white/20 rounded-2xl p-6 text-center hover:border-sky-400/60 transition-colors duration-300">
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setEdit((s: any) => ({ ...s, pdf: e.target.files?.[0] || null }))}
                        className="hidden"
                        id="edit-pdf-upload"
                      />
                      <label htmlFor="edit-pdf-upload" className="cursor-pointer">
                        <div className="text-slate-600 dark:text-slate-300">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-60" />
                          <p className="text-sm font-medium">Click to upload PDF</p>
                          <p className="text-xs opacity-75">Or drag and drop</p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <GlassInput
                      placeholder="https://example.com/document.pdf"
                      value={edit.pdf || ""}
                      onChange={(e) => setEdit((s: any) => ({ ...s, pdf: e.target.value }))}
                    />
                  )}
                </div>
              </GlassCard>

              {/* Video Section */}
              <GlassCard className="p-6" hover={false}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">Video Content</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Upload or link to video</p>
                      </div>
                    </div>
                    <GlassSelect
                      value={edit.video_type}
                      onChange={(e) => setEdit((s: any) => ({ ...s, video_type: e.target.value }))}
                      className="w-24 text-sm"
                    >
                      <option value="link">Link</option>
                      <option value="file">File</option>
                    </GlassSelect>
                  </div>
                  {edit.video_type === "file" ? (
                    <div className="border-2 border-dashed border-white/60 dark:border-white/20 rounded-2xl p-6 text-center hover:border-purple-400/60 transition-colors duration-300">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setEdit((s: any) => ({ ...s, video: e.target.files?.[0] || null }))}
                        className="hidden"
                        id="edit-video-upload"
                      />
                      <label htmlFor="edit-video-upload" className="cursor-pointer">
                        <div className="text-slate-600 dark:text-slate-300">
                          <Play className="w-8 h-8 mx-auto mb-2 opacity-60" />
                          <p className="text-sm font-medium">Click to upload video</p>
                          <p className="text-xs opacity-75">Or drag and drop</p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <GlassInput
                      placeholder="https://youtube.com/watch?v=..."
                      value={edit.video || ""}
                      onChange={(e) => setEdit((s: any) => ({ ...s, video: e.target.value }))}
                    />
                  )}
                  <GlassInput
                    placeholder="Video format (e.g., mp4, webm)"
                    value={edit.video_format || ""}
                    onChange={(e) => setEdit((s: any) => ({ ...s, video_format: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </GlassCard>
            </div>

            {/* Premium Toggle */}
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <div className={cx(
                      "h-1.5 w-1.5 rounded-full",
                      Number(edit.is_paid) === 1 ? "bg-white" : "bg-white/60"
                    )} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">Premium Content</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {Number(edit.is_paid) === 1 ? "This chapter requires payment" : "Free for all students"}
                    </p>
                  </div>
                </div>
                <GlassSwitch
                  checked={Number(edit.is_paid) === 1}
                  onChange={(v) => setEdit((s: any) => ({ ...s, is_paid: v ? 1 : 0 }))}
                />
              </div>
            </GlassCard>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <GlassButton variant="secondary" onClick={() => setShowEdit(false)} className="px-8">
                Cancel
              </GlassButton>
              <GlassButton onClick={submitEdit} disabled={savingEdit} className="px-8">
                {savingEdit ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Pencil className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Enhanced Delete Confirmation */}
      <ConfirmModal
        open={confirmId !== null}
        title="Delete Chapter"
        message="Are you sure you want to delete this chapter? This action cannot be undone and will remove all associated content."
        confirmText="Delete Forever"
        loading={deleting}
        onCancel={() => setConfirmId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}