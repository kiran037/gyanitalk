
"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2, X } from "lucide-react";
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
   Liquid Glass tokens (dark-mode tuned)
-------------------------- */
const glass = {
  surface:
    "relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/70 " +
    "border border-white/50 dark:border-white/15 backdrop-blur-xl " +
    "shadow-[0_12px_30px_-12px_rgba(2,6,23,0.18)] dark:shadow-[0_12px_34px_-12px_rgba(0,0,0,0.6)]",
  sheen:
    "pointer-events-none absolute inset-0 bg-gradient-to-br " +
    "from-white/35 via-white/10 to-transparent dark:from-white/10 dark:via-white/[0.04]",
  ring:
    "ring-4 ring-white/70 dark:ring-white/10 border border-white/60 dark:border-white/15",
};

/* -------------------------
   Atoms
-------------------------- */
function GlassCard({
  children,
  className = "",
  hover = true,
}: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return (
    <div className={cx(glass.surface, hover && "transition-transform hover:-translate-y-[2px] hover:shadow-xl", className)}>
      <div className={glass.sheen} />
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
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all " +
    "disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60";
  const styles = {
    primary:
      "text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 shadow-[0_10px_24px_-8px_rgba(56,189,248,0.45)]",
    secondary:
      "text-slate-900 dark:text-slate-100 bg-white/85 dark:bg-slate-800/70 border border-white/60 dark:border-white/15 hover:bg-white/95 dark:hover:bg-slate-800/80",
    danger:
      "text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_10px_24px_-8px_rgba(244,63,94,0.45)]",
    ghost:
      "text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent",
  } as const;

  return (
    <button {...rest} className={cx(base, styles[variant], className)}>{children}</button>
  );
}

function GlassIconButton(
  { ariaLabel, variant = "secondary", className = "", children, ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { ariaLabel: string; variant?: "secondary" | "danger" }
) {
  const styles = {
    secondary:
      "bg-white/85 dark:bg-slate-800/70 border border-white/60 dark:border-white/15 hover:bg-white/95 dark:hover:bg-slate-800/80",
    danger:
      "text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-[0_10px_24px_-8px_rgba(244,63,94,0.45)]",
  } as const;
  return (
    <button
      {...rest}
      aria-label={ariaLabel}
      className={cx(
        "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60",
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
        "bg-white/90 dark:bg-slate-900/70 border border-white/60 dark:border-white/15",
        "focus:ring-2 focus:ring-sky-500/60 focus:border-transparent",
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
        "w-full rounded-xl px-4 py-3 text-sm outline-none resize-none",
        "bg-white/90 dark:bg-slate-900/70 border border-white/60 dark:border-white/15",
        "focus:ring-2 focus:ring-sky-500/60 focus:border-transparent",
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
        "bg-white/90 dark:bg-slate-900/70 border border-white/60 dark:border-white/15",
        "focus:ring-2 focus:ring-sky-500/60 focus:border-transparent",
        "text-slate-900 dark:text-slate-100",
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
        "relative inline-flex h-[28px] w-[52px] items-center rounded-full transition-all border",
        checked
          ? "bg-gradient-to-r from-sky-600 to-indigo-600 border-white/40"
          : "bg-white/70 dark:bg-slate-800/70 border-white/60 dark:border-white/15"
      )}
    >
      <span
        className={cx(
          "h-[22px] w-[22px] rounded-full bg-white dark:bg-slate-200 shadow-md transition-all translate-x-1",
          checked && "translate-x-[29px]"
        )}
      />
      <span className="sr-only">Toggle</span>
    </button>
  );
}

/* -------------------------
   Modal (portal, blur backdrop)
-------------------------- */
function GlassModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-3xl",
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
      className="fixed inset-0 z-[2147483647] grid place-items-center p-4 md:p-6"
      onMouseDown={(e) => e.currentTarget === e.target && onClose()}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div className={cx("relative w-full", maxWidth)}>
        <div className={glass.surface}>
          <div className={glass.sheen} />
          <div className="relative flex items-center justify-between p-5 border-b border-white/60 dark:border-white/15">
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-white">
              {title || "Dialog"}
            </h3>
            <GlassIconButton ariaLabel="Close" onClick={onClose}>
              <X className="h-5 w-5" />
            </GlassIconButton>
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

/* -------------------------
   Chapter Card (grid)
-------------------------- */
function PaidBadge({ isPaid }: { isPaid: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] border backdrop-blur-sm",
        isPaid
          ? "bg-emerald-200/90 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200 border-emerald-900/10 dark:border-emerald-400/20"
          : "bg-rose-200/90 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200 border-rose-900/10 dark:border-rose-400/20"
      )}
    >
      {isPaid ? "Paid" : "Free"}
    </span>
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
      {/* Media */}
      <div className="relative h-44 w-full">
        <Image
          src={img}
          alt={item?.title || "Chapter cover"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-transparent" />

        {/* badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="inline-flex items-center rounded-lg px-2 py-0.5 text-[11px] bg-white/90 text-slate-900 border border-white/60 backdrop-blur-sm dark:bg-slate-900/70 dark:text-slate-100 dark:border-white/15">
            {courseName || "Unassigned"}
          </span>
          <PaidBadge isPaid={isPaid} />
        </div>

        {/* hover actions */}
        <div className="absolute right-3 top-3 flex gap-2 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
          <GlassIconButton ariaLabel="Edit" onClick={() => onEdit(item)}>
            <Pencil className="h-4 w-4" />
          </GlassIconButton>
          <GlassIconButton ariaLabel="Delete" variant="danger" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4" />
          </GlassIconButton>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
          {item?.title || "Untitled"}
        </h3>
        {item?.description ? (
          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300/90 line-clamp-2">
            {item.description}
          </p>
        ) : null}

        {/* Mobile action bar */}
        <div className="mt-3 flex gap-2 sm:hidden">
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
   Page
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
        return uploaded.path.replace("public", ""); // keep your /public trimming convention
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

  /* ---------- Add ---------- */
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

  /* ---------- Edit ---------- */
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

  /* ---------- Delete ---------- */
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
    <div className="relative w-full min-w-0 space-y-6 overflow-x-hidden">
      {/* ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-40 w-[26rem] h-[26rem] rounded-full bg-gradient-to-br from-sky-400/10 to-indigo-400/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[28rem] h-[28rem] rounded-full bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 blur-3xl" />
      </div>

      {/* header */}
      <div className="flex items-center justify-between mt-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Chapters</h1>
        <GlassButton onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Add Chapter
        </GlassButton>
      </div>

      {/* grid */}
      <Suspense fallback={<TransactionsSkeleton />}>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <GlassCard key={i} className="overflow-hidden" hover={false}>
                <div className="h-44 w-full bg-white/70 dark:bg-slate-800/70 animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 rounded bg-white/70 dark:bg-slate-800/70 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-white/70 dark:bg-slate-800/70 animate-pulse" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {chapters.map((ch) => (
              <ChapterCard
                key={ch.id}
                item={ch}
                courseName={courseNameById(ch.course_id)}
                onEdit={openEdit}
                onDelete={(id) => setConfirmId(id)}
              />
            ))}
          </div>
        )}
      </Suspense>

      {/* Add Modal */}
      <GlassModal open={showAdd} onClose={() => setShowAdd(false)} title="Add Chapter">
        <div className="space-y-5">
          <div className="grid sm:grid-cols-[auto,1fr] gap-5">
            <div className="flex flex-col items-center gap-2">
              <div className={cx("relative h-28 w-28 overflow-hidden rounded-2xl", glass.ring)}>
                <Image src={addImgPreview || FALLBACK_IMG} alt="Preview" fill className="object-cover" />
              </div>
              <label className="cursor-pointer">
                <span className="inline-flex text-sm px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/15 bg-white/90 dark:bg-slate-900/70">
                  Upload Cover
                </span>
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

            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Title</span>
                <GlassInput
                  value={add.title}
                  onChange={(e) => setAdd((s: any) => ({ ...s, title: e.target.value }))}
                  placeholder="Chapter title"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Course</span>
                <GlassSelect
                  value={add.course_id ?? ""}
                  onChange={(e) => setAdd((s: any) => ({ ...s, course_id: Number(e.target.value) || null }))}
                >
                  <option value="">Select course…</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </GlassSelect>
              </label>
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Description</span>
            <GlassTextarea
              rows={4}
              value={add.description}
              onChange={(e) => setAdd((s: any) => ({ ...s, description: e.target.value }))}
            />
          </label>

          {/* Media blocks */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* PDF */}
            <GlassCard className="p-4" hover={false}>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">PDF</p>
                  <GlassSelect
                    value={add.pdf_type}
                    onChange={(e) => setAdd((s: any) => ({ ...s, pdf_type: e.target.value }))}
                    className="w-28"
                  >
                    <option value="file">File</option>
                    <option value="link">Link</option>
                  </GlassSelect>
                </div>
                {add.pdf_type === "file" ? (
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setAdd((s: any) => ({ ...s, pdf: e.target.files?.[0] || null }))}
                    className="text-sm text-slate-600 dark:text-slate-300"
                  />
                ) : (
                  <GlassInput
                    placeholder="https://…"
                    value={(add.pdf as string) || ""}
                    onChange={(e) => setAdd((s: any) => ({ ...s, pdf: e.target.value }))}
                  />
                )}
              </div>
            </GlassCard>

            {/* Video */}
            <GlassCard className="p-4" hover={false}>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Video</p>
                  <GlassSelect
                    value={add.video_type}
                    onChange={(e) => setAdd((s: any) => ({ ...s, video_type: e.target.value }))}
                    className="w-28"
                  >
                    <option value="link">Link</option>
                    <option value="file">File</option>
                  </GlassSelect>
                </div>
                {add.video_type === "file" ? (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setAdd((s: any) => ({ ...s, video: e.target.files?.[0] || null }))}
                    className="text-sm text-slate-600 dark:text-slate-300"
                  />
                ) : (
                  <GlassInput
                    placeholder="https://…"
                    value={(add.video as string) || ""}
                    onChange={(e) => setAdd((s: any) => ({ ...s, video: e.target.value }))}
                  />
                )}
                <GlassInput
                  placeholder="Format (e.g., mp4)"
                  value={add.video_format || ""}
                  onChange={(e) => setAdd((s: any) => ({ ...s, video_format: e.target.value }))}
                />
              </div>
            </GlassCard>
          </div>

          {/* Paid */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Paid</span>
            <GlassSwitch
              checked={Number(add.is_paid) === 1}
              onChange={(v) => setAdd((s: any) => ({ ...s, is_paid: v ? 1 : 0 }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <GlassButton variant="secondary" onClick={() => setShowAdd(false)}>Cancel</GlassButton>
            <GlassButton onClick={submitAdd} disabled={savingAdd}>
              {savingAdd ? "Creating…" : "Create Chapter"}
            </GlassButton>
          </div>
        </div>
      </GlassModal>

      {/* Edit Modal */}
      <GlassModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Chapter">
        {edit && (
          <div className="space-y-5">
            <div className="grid sm:grid-cols-[auto,1fr] gap-5">
              <div className="flex flex-col items-center gap-2">
                <div className={cx("relative h-28 w-28 overflow-hidden rounded-2xl", glass.ring)}>
                  <Image src={editImgPreview || FALLBACK_IMG} alt="Preview" fill className="object-cover" />
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex text-sm px-3 py-1.5 rounded-xl border border-white/60 dark:border-white/15 bg-white/90 dark:bg-slate-900/70">
                    Change Cover
                  </span>
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

              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Title</span>
                  <GlassInput
                    value={edit.title}
                    onChange={(e) => setEdit((s: any) => ({ ...s, title: e.target.value }))}
                    placeholder="Chapter title"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Course</span>
                  <GlassSelect
                    value={edit.course_id ?? ""}
                    onChange={(e) => setEdit((s: any) => ({ ...s, course_id: Number(e.target.value) || null }))}
                  >
                    <option value="">Select course…</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </GlassSelect>
                </label>
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-slate-800 dark:text-slate-200">Description</span>
              <GlassTextarea
                rows={4}
                value={edit.description || ""}
                onChange={(e) => setEdit((s: any) => ({ ...s, description: e.target.value }))}
              />
            </label>

            {/* Media */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* PDF */}
              <GlassCard className="p-4" hover={false}>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">PDF</p>
                    <GlassSelect
                      value={edit.pdf_type}
                      onChange={(e) => setEdit((s: any) => ({ ...s, pdf_type: e.target.value }))}
                      className="w-28"
                    >
                      <option value="file">File</option>
                      <option value="link">Link</option>
                    </GlassSelect>
                  </div>
                  {edit.pdf_type === "file" ? (
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setEdit((s: any) => ({ ...s, pdf: e.target.files?.[0] || null }))}
                      className="text-sm text-slate-600 dark:text-slate-300"
                    />
                  ) : (
                    <GlassInput
                      placeholder="https://…"
                      value={edit.pdf || ""}
                      onChange={(e) => setEdit((s: any) => ({ ...s, pdf: e.target.value }))}
                    />
                  )}
                </div>
              </GlassCard>

              {/* Video */}
              <GlassCard className="p-4" hover={false}>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Video</p>
                    <GlassSelect
                      value={edit.video_type}
                      onChange={(e) => setEdit((s: any) => ({ ...s, video_type: e.target.value }))}
                      className="w-28"
                    >
                      <option value="link">Link</option>
                      <option value="file">File</option>
                    </GlassSelect>
                  </div>
                  {edit.video_type === "file" ? (
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setEdit((s: any) => ({ ...s, video: e.target.files?.[0] || null }))}
                      className="text-sm text-slate-600 dark:text-slate-300"
                    />
                  ) : (
                    <GlassInput
                      placeholder="https://…"
                      value={edit.video || ""}
                      onChange={(e) => setEdit((s: any) => ({ ...s, video: e.target.value }))}
                    />
                  )}
                  <GlassInput
                    placeholder="Format (e.g., mp4)"
                    value={edit.video_format || ""}
                    onChange={(e) => setEdit((s: any) => ({ ...s, video_format: e.target.value }))}
                  />
                </div>
              </GlassCard>
            </div>

            {/* Paid */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Paid</span>
              <GlassSwitch
                checked={Number(edit.is_paid) === 1}
                onChange={(v) => setEdit((s: any) => ({ ...s, is_paid: v ? 1 : 0 }))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <GlassButton variant="secondary" onClick={() => setShowEdit(false)}>Cancel</GlassButton>
              <GlassButton onClick={submitEdit} disabled={savingEdit}>
                {savingEdit ? "Saving…" : "Save Changes"}
              </GlassButton>
            </div>
          </div>
        )}
      </GlassModal>

      {/* Delete confirm */}
      <ConfirmModal
        open={confirmId !== null}
        title="Delete Chapter"
        message="Are you sure you want to delete this chapter? This action cannot be undone."
        confirmText="Delete"
        loading={deleting}
        onCancel={() => setConfirmId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
