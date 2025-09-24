
"use client";

import { use, useEffect, useRef, useState, useTransition, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { Plus, Pencil, Trash2, Copy, MoreVertical, X } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "@/components/functions";

import {
  getBlogsData,
  createBlogs,
  updateBlogs,
  deleteBlogs,
  updateBlogsStatus,
} from "./fetch";

/* =================================================================================
   Tiny Glass Kit (local to this file for drop-in use)
================================================================================= */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] " +
    "dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
  lift:
    "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] " +
    "dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
  input:
    "rounded-2xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none " +
    "focus:ring-2 focus:ring-blue-500/50",
  btnPrimary:
    "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 " +
    "px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.25)] " +
    "transition hover:from-blue-700 hover:to-purple-700 active:scale-[0.98]",
  btnSecondary:
    "inline-flex items-center gap-2 rounded-xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 " +
    "hover:bg-white/90 dark:hover:bg-white/[0.12] active:scale-[0.98]",

  // stronger, always-visible chips
  chipOn:
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold " +
    "bg-emerald-500/85 text-white border border-emerald-400/70 backdrop-blur-md shadow-sm",
  chipOff:
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold " +
    "bg-rose-500/85 text-white border border-rose-400/70 backdrop-blur-md shadow-sm",
};

function GlassCard({
  children,
  className = "",
  hover = true,
}: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return <div className={cx(glass.surface, hover && glass.lift, className)}>{children}</div>;
}

/* =================================================================================
   GlassModal via Portal (full-screen blur, no stacking leaks)
================================================================================= */
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
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* full-screen overlay with strong blur */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[6px] md:backdrop-blur-[10px]" />
      <div
        className={cx("relative z-10 w-full", maxWidth)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/85 dark:bg-slate-900/75 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-white/20 bg-white/60 dark:bg-white/[0.06] px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title || "Dialog"}</h3>
            <button onClick={onClose} className={cx(glass.btnSecondary, "px-3 py-1.5")} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body
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
        "relative inline-flex h-[30px] w-[54px] items-center rounded-full transition-all duration-300 border border-white/30 dark:border-white/10 backdrop-blur-xl",
        checked ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-white/60 dark:bg-white/[0.06]"
      )}
    >
      <span
        className={cx(
          "h-[24px] w-[24px] rounded-full bg-white shadow-md transition-all duration-300",
          checked ? "translate-x-[27px]" : "translate-x-[3px]"
        )}
      />
      <span className="sr-only">Toggle</span>
    </button>
  );
}

/* =================================================================================
   Helpers & Types
================================================================================= */
type Blog = {
  id: number;
  title: string;
  description: string;
  isActive: number; // 0/1
  extension?: string;
  blogImage?: string;
  author?: string;
  postedOn?: string;
  viewer?: number;
};

const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

function bannerSrcOf(item: any) {
  const src = item?.blogImage ?? "";
  if (!isValidImageUrl(src)) return FALLBACK;
  return /^https?:\/\//i.test(src) ? src : `${BASE}${src}`;
}

function getFileExtension(file: File | string | null): string {
  if (!file) return "";
  if (file instanceof File) return file.name.split(".").pop()?.toLowerCase() || "";
  if (typeof file === "string") return file.split(".").pop()?.toLowerCase() || "";
  return "";
}

const isImageExt = (ext?: string) =>
  ["jpg", "jpeg", "gif", "png", "webp", "svg"].includes((ext || "").toLowerCase());

/* =================================================================================
   Status Toggle (inline)
================================================================================= */
function BlogsStatusToggle({ id, status, onAfter }: { id: number; status: boolean; onAfter?: () => void }) {
  const toast = useToast();
  const [checked, setChecked] = useState(status);
  const [, startTransition] = useTransition();

  const toggle = async (val: boolean) => {
    setChecked(val);
    try {
      const res = await updateBlogsStatus(id, val);
      if (res?.success) {
        toast("success", "Updated", `Blog ${val ? "activated" : "deactivated"}.`);
        onAfter?.();
      } else {
        setChecked(!val);
        toast("error", "Error", "Failed to update status.");
      }
    } catch {
      setChecked(!val);
      toast("error", "Error", "Failed to update status.");
    }
  };

  return (
    <GlassSwitch
      checked={checked}
      onChange={(v) =>
        startTransition(() => {
          toggle(v);
        })
      }
    />
  );
}

/* =================================================================================
   Blog Card
================================================================================= */
function BlogCard({ item, onRefresh }: { item: Blog; onRefresh: () => Promise<void> }) {
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const ext = (item.extension || "").toLowerCase();
  const isActive = !!item.isActive;

  // Edit state
  const [form, setForm] = useState<any>({
    title: item.title || "",
    description: item.description || "",
    author: item.author || "",
    postedOn: item.postedOn ? dayjs(item.postedOn).format("YYYY-MM-DD") : "",
    blogImage: item.blogImage || null,
  });
  const [preview, setPreview] = useState<string | null>(bannerSrcOf(item));
  const [fileType, setFileType] = useState<"image" | "video" | null>(
    isImageExt(ext) ? "image" : ext === "mp4" ? "video" : null
  );
  const [busy, setBusy] = useState(false);

  const plain = (item.description || "").replace(/<[^>]+>/g, "");
  const truncated = plain.length > 550 ? `${plain.slice(0, 550)}…` : plain;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    setForm((s: any) => ({ ...s, blogImage: file }));
    setPreview(URL.createObjectURL(file));
    if (file.type.startsWith("image/")) setFileType("image");
    else if (file.type.startsWith("video/")) setFileType("video");
    else setFileType(null);
  };

  const save = async () => {
    try {
      setBusy(true);
      const payload: any = { ...form };
      if (form.blogImage instanceof File) {
        const up = await uploadImage(form.blogImage, "images");
        if (!up?.success || !up?.path) throw new Error("Upload failed. Please try again.");
        payload.blogImage = up.path;
        payload.extension = getFileExtension(form.blogImage);
      } else if (typeof form.blogImage === "string") {
        payload.extension = getFileExtension(form.blogImage);
      }

      await updateBlogs(item.id, payload);
      toast("success", "Saved", "Blog updated successfully.");
      setShowEdit(false);
      await onRefresh();
    } catch (e: any) {
      toast("error", "Error", e?.message || "Failed to save blog.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      setBusy(true);
      await deleteBlogs(item.id);
      toast("success", "Deleted", "Blog removed.");
      setShowDel(false);
      await onRefresh();
    } catch (e: any) {
      toast("error", "Error", "Failed to delete blog.");
    } finally {
      setBusy(false);
    }
  };

  const copyTitle = async () => {
    try {
      await navigator.clipboard.writeText(item.title || "");
      toast("success", "Copied", "Title copied to clipboard.");
    } catch {
      toast("error", "Error", "Could not copy.");
    }
  };

  return (
    <GlassCard hover className="overflow-hidden">
      {/* Media */}
      <div className="relative h-64">
        {isImageExt(ext) ? (
          <Image src={bannerSrcOf(item)} alt={item.title} fill className="object-cover" />
        ) : ext === "mp4" ? (
          <video controls className="absolute inset-0 h-full w-full object-cover">
            <source src={bannerSrcOf(item)} type="video/mp4" />
          </video>
        ) : (
          <Image src={FALLBACK} alt="Fallback" fill className="object-cover" />
        )}

        {/* Glaze + chips + menu */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <span className={isActive ? glass.chipOn : glass.chipOff}>
            {isActive ? "Active" : "Inactive"}
          </span>

          <div ref={dropdownRef} className="pointer-events-auto relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white hover:bg-white/35"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-white/30 bg-white/90 backdrop-blur-xl shadow-lg">
                <button
                  onClick={() => {
                    setShowEdit(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-white"
                >
                  <span className="inline-flex items-center gap-2">
                    <Pencil className="h-4 w-4" /> Edit
                  </span>
                </button>
                <button
                  onClick={() => {
                    setShowDel(true);
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-white"
                >
                  <span className="inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Delete
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meta over media */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div className="text-white drop-shadow">
            <div className="text-xs opacity-80">{item.author || "Unknown"}</div>
            <div className="text-[11px] opacity-70">
              {item.postedOn ? dayjs(item.postedOn).format("DD MMM YYYY") : "—"}
            </div>
          </div>
          <button
            onClick={copyTitle}
            className="inline-flex items-center gap-2 rounded-xl bg-white/25 px-3 py-1.5 text-xs text-white"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Title
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {isExpanded ? (
            <div dangerouslySetInnerHTML={{ __html: item.description }} />
          ) : (
            <p>{truncated}</p>
          )}
          {plain.length > 550 && (
            <button
              onClick={() => setIsExpanded((v) => !v)}
              className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 border-t border-white/30 pt-4 sm:flex-row sm:justify-between">
          <div className="text-xs text-slate-500">
            Views: <span className="font-semibold">{item.viewer ?? 0}</span>
          </div>
          <BlogsStatusToggle id={item.id} status={!!item.isActive} onAfter={onRefresh} />
        </div>
      </div>

      {/* Edit Modal */}
      <GlassModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Blog">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            className={glass.input}
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((s: any) => ({ ...s, title: e.target.value }))}
            required
          />
          <input
            className={glass.input}
            placeholder="Author"
            value={form.author}
            onChange={(e) => setForm((s: any) => ({ ...s, author: e.target.value }))}
          />
          <input
            type="date"
            className={glass.input}
            value={form.postedOn}
            onChange={(e) => setForm((s: any) => ({ ...s, postedOn: e.target.value }))}
            required
          />
          <textarea
            className={cx(glass.input, "resize-none")}
            rows={5}
            placeholder="Description (HTML or text)"
            value={form.description}
            onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))}
            required
          />

          {/* Preview */}
          <div className="flex items-center gap-4">
            {preview && fileType === "image" && (
              <img src={preview} alt="Preview" className="h-24 w-36 rounded-xl object-cover border border-white/30" />
            )}
            {preview && fileType === "video" && (
              <video controls className="h-24 w-36 rounded-xl object-cover border border-white/30">
                <source src={preview} type="video/mp4" />
              </video>
            )}
            <input type="file" accept="image/*,video/mp4" onChange={onFile} />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowEdit(false)} className={glass.btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className={glass.btnPrimary}>
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* Delete Modal */}
      <GlassModal open={showDel} onClose={() => setShowDel(false)} title="Delete Blog">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete <span className="font-semibold">{item.title}</span>? This action cannot be
          undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setShowDel(false)} className={glass.btnSecondary}>
            Cancel
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className={cx(glass.btnPrimary, "bg-gradient-to-r from-rose-600 to-orange-600")}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </GlassModal>
    </GlassCard>
  );
}

/* =================================================================================
   Add Blog Modal (reusable)
================================================================================= */
function AddBlogModal({
  open,
  onClose,
  onSaved,
  page,
  search,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  page: number;
  search: string;
}) {
  const toast = useToast();
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    postedOn: dayjs().format("YYYY-MM-DD"),
    blogImage: null,
    author: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      title: "",
      description: "",
      postedOn: dayjs().format("YYYY-MM-DD"),
      blogImage: null,
      author: "",
    });
    setPreview(null);
    setFileType(null);
    setBusy(false);
  }, [open]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    setForm((s: any) => ({ ...s, blogImage: f }));
    setPreview(URL.createObjectURL(f));
    if (f.type.startsWith("image/")) setFileType("image");
    else if (f.type.startsWith("video/")) setFileType("video");
    else setFileType(null);
  };

  const save = async () => {
    try {
      if (!form.title?.trim()) return toast("warning", "Warning", "Title is required.");
      setBusy(true);
      const payload: any = { ...form };
      if (form.blogImage instanceof File) {
        const up = await uploadImage(form.blogImage, "images");
        if (!up?.success || !up?.path) throw new Error("Upload failed. Please try again.");
        payload.blogImage = up.path;
        payload.extension = getFileExtension(form.blogImage);
      } else if (typeof form.blogImage === "string") {
        payload.extension = getFileExtension(form.blogImage);
      }

      await createBlogs(payload);
      toast("success", "Created", "Blog created successfully.");
      onClose();
      await onSaved();
    } catch (e: any) {
      toast("error", "Error", e?.message || "Failed to create blog.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Add Blog">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          className={glass.input}
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm((s: any) => ({ ...s, title: e.target.value }))}
          required
        />
        <input
          className={glass.input}
          placeholder="Author"
          value={form.author}
          onChange={(e) => setForm((s: any) => ({ ...s, author: e.target.value }))}
        />
        <input
          type="date"
          className={glass.input}
          value={form.postedOn}
          onChange={(e) => setForm((s: any) => ({ ...s, postedOn: e.target.value }))}
          required
        />
        <textarea
          className={cx(glass.input, "resize-none")}
          rows={5}
          placeholder="Description (HTML or text)"
          value={form.description}
          onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))}
          required
        />

        {/* Preview */}
        <div className="flex items-center gap-4">
          {preview && fileType === "image" && (
            <img src={preview} alt="Preview" className="h-24 w-36 rounded-xl object-cover border border-white/30" />
          )}
          {preview && fileType === "video" && (
            <video controls className="h-24 w-36 rounded-xl object-cover border border-white/30">
              <source src={preview} type="video/mp4" />
            </video>
          )}
          <input type="file" accept="image/*,video/mp4" onChange={onFile} />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={glass.btnSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={glass.btnPrimary}>
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}

/* =================================================================================
   Blog List Client
================================================================================= */
function BlogListClient({
  initialData,
  page,
  totalPages,
  search,
  onRefresh,
}: {
  initialData: Blog[];
  page: number;
  totalPages: number;
  search: string;
  onRefresh: () => Promise<void>;
}) {
  const toast = useToast();
  const [blogs, setBlogs] = useState<Blog[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true);
      try {
        const { data } = await getBlogsData({ page, limit: 15, search });
        setBlogs(data || []);
      } catch {
        toast("error", "Error", "Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    }
    if (page !== 1 || search !== "") fetchBlogs();
    else setBlogs(initialData || []);
  }, [page, search, initialData, toast]);

  const afterAnyChange = useCallback(async () => {
    await onRefresh();
    const { data } = await getBlogsData({ page, limit: 15, search });
    setBlogs(data || []);
  }, [onRefresh, page, search]);

  return (
    <>
      {/* Toolbar */}
      <div className="relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Blogs</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">Create, edit and manage blog posts</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setAddOpen(true)} className={glass.btnPrimary}>
              <Plus className="h-4 w-4" />
              Add Blog
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <GlassCard hover={false} key={i} className="overflow-hidden">
              <div className="h-64 w-full animate-pulse bg-slate-200/70 dark:bg-white/[0.06]" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.06]" />
                <div className="h-4 w-2/3 animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.06]" />
              </div>
            </GlassCard>
          ))
        ) : blogs.length ? (
          blogs.map((b) => <BlogCard key={b.id} item={b} onRefresh={afterAnyChange} />)
        ) : (
          <GlassCard hover={false} className="p-10 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">No blogs found</p>
          </GlassCard>
        )}
      </div>

      {/* Add Modal */}
      <AddBlogModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={afterAnyChange}
        page={page}
        search={search}
      />
    </>
  );
}

/* =================================================================================
   Page
================================================================================= */
export default function BlogsPage({
  searchParams,
}: {
  // Next.js 15: unwrap with React.use()
  searchParams?: Promise<{ page?: string; search?: string }>;
}) {
  const params = searchParams ? use(searchParams) : undefined;
  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";

  const [initialData, setInitialData] = useState<Blog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const refresh = async () => {
    const { data, totalPages } = await getBlogsData({ page, limit: 15, search });
    setInitialData(data || []);
    setTotalPages(totalPages || 1);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingInitial(true);
        const { data, totalPages } = await getBlogsData({ page, limit: 15, search });
        if (!mounted) return;
        setInitialData(data || []);
        setTotalPages(totalPages || 1);
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, search]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-8">
        {/* Search */}
        <GlassCard hover={false} className="p-5">
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search blogs…"
              className={cx(glass.input, "min-w-[240px]")}
            />
            <button type="submit" className={glass.btnPrimary}>
              Search
            </button>
            {search ? (
              <Link href="?page=1" className={glass.btnSecondary}>
                Clear
              </Link>
            ) : null}
          </form>
        </GlassCard>

        {/* Content */}
        {loadingInitial ? (
          <GlassCard hover={false} className="p-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading blogs…</p>
          </GlassCard>
        ) : (
          <BlogListClient
            initialData={initialData}
            page={page}
            totalPages={totalPages}
            search={search}
            onRefresh={refresh}
          />
        )}
      </div>
    </div>
  );
}
