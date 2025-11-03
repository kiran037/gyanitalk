"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dayjs from "dayjs";
import Image from "next/image";
import { MoreVertical, Pencil, Trash2, Copy } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import { updateBlogs, deleteBlogs } from "@/app/blogs/fetch";
import { GlassCard, glass, cx } from "../GlassUI/GlassKit";
import GlassModal from "../GlassUI/GlassModal";
import BlogsStatusToggle from "./BlogsStatusToggle";
import type { Blog } from "../../types/blogs";
import { bannerSrcOf, FALLBACK, getFileExtension, isImageExt } from "./utils";

export default function BlogCard({
  item,
  onRefresh,
}: {
  item: Blog;
  onRefresh: () => Promise<void>;
}) {
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

  const save = useCallback(async () => {
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
  }, [form, item.id, onRefresh, toast]);

  const remove = useCallback(async () => {
    try {
      setBusy(true);
      await deleteBlogs(item.id);
      toast("success", "Deleted", "Blog removed.");
      setShowDel(false);
      await onRefresh();
    } catch {
      toast("error", "Error", "Failed to delete blog.");
    } finally {
      setBusy(false);
    }
  }, [item.id, onRefresh, toast]);

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
          <span className={isActive ? "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold bg-emerald-500/85 text-white border border-emerald-400/70 backdrop-blur-md shadow-sm" : "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold bg-rose-500/85 text-white border border-rose-400/70 backdrop-blur-md shadow-sm"}>
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
            className={`${glass.input} resize-none`}
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
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(244,63,94,0.25)] transition active:scale-[0.98]"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </GlassModal>
    </GlassCard>
  );
}
