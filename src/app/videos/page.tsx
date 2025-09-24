
"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Edit, Trash2, ExternalLink, Plus, X } from "lucide-react";
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "@/components/functions";
import { useToast } from "@/components/Toast/ToastProvider";
import {
  getVideos,
  createVideos,
  updateVideos,
  deleteVideos,
  updateVideosStatus,
} from "./fetch";

/* =========================
   Tiny Glass Kit
========================= */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_28px_rgba(0,0,0,0.08)] " +
    "dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
  input:
    "rounded-xl border border-white/30 dark:border-white/10 bg-white/80 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium " +
    "transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
  btnDanger:
    "text-white bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700",
  chipOn:
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold " +
    "bg-emerald-600 text-white shadow-sm",
  chipOff:
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold " +
    "bg-rose-600 text-white shadow-sm",
};

function GlassCard({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cx(glass.surface, className)}>{children}</div>;
}

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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-md" />
      <div className={cx("relative z-10 w-full", maxWidth)} onMouseDown={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/85 dark:bg-slate-900/75 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between border-b border-white/20 bg-white/60 dark:bg-white/[0.06] px-6 py-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title || "Dialog"}</h3>
            <button
              onClick={onClose}
              className={cx(glass.btn, glass.btnNeutral, "h-8 px-2")}
              aria-label="Close"
            >
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

/* =========================
   Helpers
========================= */
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";
const coverSrc = (val?: string | null) =>
  isValidImageUrl(val || "") ? (/^https?:\/\//i.test(val!) ? val! : `${BASE}${val}`) : FALLBACK;

/* =========================
   Status Toggle
========================= */
function VideosStatusToggle({ id, status }: { id: number; status: boolean }) {
  const toast = useToast();
  const [checked, setChecked] = useState(status);
  const [, startTransition] = useTransition();

  const toggleLiveStatus = async (newValue: boolean) => {
    setChecked(newValue);
    const res = await updateVideosStatus(id, newValue);
    if (res?.success) {
      toast("success", "Status Updated", "Video status updated");
    } else {
      toast("error", "Update Failed", "Could not update status");
      setChecked(!newValue);
    }
  };

  return (
    <GlassSwitch
      checked={checked}
      onChange={(val) =>
        startTransition(() => {
          toggleLiveStatus(val);
        })
      }
    />
  );
}

/* =========================
   Page
========================= */
export default function VideosPage() {
  const toast = useToast();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    youtubeLink: "",
    coverImage: null as File | string | null,
    description: "",
    videoTitle: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await getVideos();
      setData(res.data || []);
    } catch {
      toast("error", "Load Failed", "Could not fetch videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ youtubeLink: "", coverImage: null, description: "", videoTitle: "" });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      youtubeLink: item.youtubeLink ?? "",
      coverImage: item.coverImage ?? null,
      description: item.description ?? "",
      videoTitle: item.videoTitle ?? "",
    });
    setImagePreview(coverSrc(item?.coverImage));
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload: any = { ...formData };
      if (formData.coverImage instanceof File) {
        const uploadRes = await uploadImage(formData.coverImage, "images");
        if (uploadRes?.success && uploadRes?.path) payload.coverImage = uploadRes.path;
        else {
          toast("error", "Upload Failed", "Image upload failed");
          return;
        }
      }
      if (editingItem) {
        await updateVideos(editingItem.id, payload);
        toast("success", "Updated", "Video updated successfully");
      } else {
        await createVideos(payload);
        toast("success", "Created", "Video created successfully");
      }
      setShowModal(false);
      fetchVideos();
    } catch (err: any) {
      toast("error", "Save Failed", err?.message || "Could not save video");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVideos(deleteId);
      toast("success", "Deleted", "Video deleted successfully");
      fetchVideos();
    } catch {
      toast("error", "Delete Failed", "Could not delete video");
    } finally {
      setShowDelete(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-8">
        {/* Toolbar */}
        <GlassCard className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Ads Videos</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage cover, title, link, and visibility.</p>
            </div>
            <button onClick={openAddModal} className={cx(glass.btn, glass.btnPrimary)}>
              <Plus className="h-4 w-4" />
              Add New Video
            </button>
          </div>
        </GlassCard>

        {/* Grid (uniform cards, no cutting) */}
        <div
          className="
            grid gap-6
            [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]
          "
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <GlassCard key={i} className="overflow-hidden">
                  <div className="aspect-video w-full animate-pulse bg-slate-200/70 dark:bg-white/[0.06]" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/[0.06]" />
                    <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/[0.06]" />
                  </div>
                </GlassCard>
              ))
            : data.length
            ? data.map((item: any) => {
                const href = typeof item?.youtubeLink === "string" ? item.youtubeLink : "";
                const isActive = !!item.isActive;
                return (
                  <GlassCard key={item.id} className="overflow-hidden">
                    {/* Media (fixed aspect ratio prevents clipping) */}
                    <div className="relative aspect-video w-full">
                      <Image src={coverSrc(item.coverImage)} alt="Video cover" fill className="object-cover" />
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                      <span className={cx("absolute top-3 left-3", isActive ? glass.chipOn : glass.chipOff)}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
                        {item.videoTitle || "Untitled"}
                      </h3>
                      {item.description ? (
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                          {item.description}
                        </p>
                      ) : null}
                    </div>

                    {/* Footer (uniform height and spacing) */}
                    <div className="grid grid-cols-2 gap-2 p-5 pt-4 border-t border-white/30">
                      <a
                        href={href || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx(glass.btn, glass.btnNeutral)}
                        aria-disabled={!href}
                        onClick={(e) => {
                          if (!href) e.preventDefault();
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </a>

                      <button onClick={() => openEditModal(item)} className={cx(glass.btn, glass.btnNeutral)}>
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          setDeleteId(item.id);
                          setShowDelete(true);
                        }}
                        className={cx(glass.btn, glass.btnDanger, "col-span-2")}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>

                      <div className="col-span-2 flex items-center justify-end">
                        <VideosStatusToggle id={item.id} status={isActive} />
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            : (
              <GlassCard className="p-10 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">No videos found</p>
              </GlassCard>
            )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <GlassModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Ads Video" : "Add Ads Video"}
      >
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* YouTube Link */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">YouTube Link</span>
            <input
              type="url"
              placeholder="https://www.youtube.com/…"
              value={formData.youtubeLink || ""}
              onChange={(e) => setFormData({ ...formData, youtubeLink: e.target.value })}
              className={glass.input}
              required
            />
          </label>

          {/* Video Title */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Video Title</span>
            <input
              type="text"
              placeholder="Enter video title"
              value={formData.videoTitle || ""}
              onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
              className={glass.input}
              required
            />
          </label>

          {/* Description */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Description (optional)</span>
            <textarea
              placeholder="Short description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={cx(glass.input, "resize-none")}
              rows={4}
            />
          </label>

          {/* Cover Image */}
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Cover Image</span>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="preview"
                className="h-24 w-36 object-cover rounded-xl border border-white/30"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, coverImage: file });
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>

          {/* Buttons */}
          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className={cx(glass.btn, glass.btnNeutral)}>
              Cancel
            </button>
            <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>
              {editingItem ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* Delete Modal */}
      <GlassModal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Ads Video">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this Ads Video? This action cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setShowDelete(false)} className={cx(glass.btn, glass.btnNeutral)}>
            Cancel
          </button>
          <button onClick={handleDelete} className={cx(glass.btn, glass.btnDanger)}>
            Delete
          </button>
        </div>
      </GlassModal>
    </div>
  );
}
