"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { Edit, Trash2, ExternalLink, Plus, MoreVertical, X } from "lucide-react";
import {
  getAstroguruNews,
  createAstroguruNews,
  updateAstroguruNews,
  deleteAstroguruNews,
  updateAstroguruNewsStatus,
} from "./fetch";
import { formatDatetoReadable, isValidImageUrl } from "@/components/functions";
import { uploadImage } from "@/upload";
import { useToast } from "@/components/Toast/ToastProvider";

/* ============================================================================
  Tiny Glass UI
============================================================================ */
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
  // lock scroll + esc close
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
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* stronger, full-screen blur (fixes top areas not blurring) */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[6px] md:backdrop-blur-[10px]" />
      <div className={cx("relative z-10 w-full", maxWidth)} onMouseDown={(e) => e.stopPropagation()}>
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

/* ============================================================================
  Helpers
============================================================================ */
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

function bannerSrcOf(item: any) {
  const src = item?.bannerImage ?? "";
  if (!isValidImageUrl(src)) return FALLBACK;
  return /^https?:\/\//i.test(src) ? src : `${BASE}${src}`;
}

/* ============================================================================
  Status Toggle
============================================================================ */
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

function NewsStatusToggle({ id, status }: { id: number; status: boolean }) {
  const [checked, setChecked] = useState(status);
  const [, startTransition] = useTransition();
  const toast = useToast();

  const toggleLiveStatus = async (newValue: boolean) => {
    setChecked(newValue);
    const res = await updateAstroguruNewsStatus(id, newValue);
    if (res?.success) {
      toast("success", "Complete", "Status updated");
    } else {
      toast("error", "Failed", "Failed to update status");
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

/* ============================================================================
  Main Page
============================================================================ */
export default function AstroguruNewsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const toast = useToast();
  const [formData, setFormData] = useState<any>({
    channel: "",
    link: "",
    newsDate: dayjs().format("YYYY-MM-DD"),
    description: "",
    bannerImage: null as File | string | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  async function fetchNews() {
    setLoading(true);
    try {
      const res = await getAstroguruNews();
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNews();
  }, []);

  function openAddModal() {
    setEditingItem(null);
    setFormData({
      channel: "",
      link: "",
      newsDate: dayjs().format("YYYY-MM-DD"),
      description: "",
      bannerImage: null,
    });
    setImagePreview(null);
    setShowModal(true);
  }

  function openEditModal(item: any) {
    setEditingItem(item);
    setFormData({
      channel: item.channel ?? "",
      link: item.link ?? "",
      newsDate: item.newsDate?.slice(0, 10) || dayjs().format("YYYY-MM-DD"),
      description: item.description ?? "",
      bannerImage: item.bannerImage ?? null,
    });
    setImagePreview(bannerSrcOf(item));
    setShowModal(true);
  }

  async function handleSave() {
    try {
      const payload: any = { ...formData };

      if (formData.bannerImage instanceof File) {
        const uploadRes = await uploadImage(formData.bannerImage, "images");
        if (uploadRes?.success && uploadRes?.path) {
          payload.bannerImage = uploadRes.path;
        } else {
          toast("error", "Failed", "Image upload failed");
          return;
        }
      }

      if (editingItem) {
        await updateAstroguruNews(editingItem.id, payload);
        toast("success", "Complete", "News updated");
      } else {
        await createAstroguruNews(payload);
        toast("success", "Complete", "News created");
      }

      setShowModal(false);
      fetchNews();
    } catch (err) {
      toast("error", "Failed", "Failed to save");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteAstroguruNews(deleteId);
      toast("success", "Complete", "Deleted");
      fetchNews();
    } catch {
      toast("error", "Failed", "Delete failed");
    } finally {
      setShowDelete(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-8">
        {/* Header / Toolbar */}
        <GlassCard hover={false} className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Astroguru News</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Create, edit and manage news cards</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={openAddModal} className={glass.btnPrimary}>
                <Plus className="h-4 w-4" />
                Add News
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <GlassCard key={i} hover={false} className="overflow-hidden">
                <div className="h-44 2xl:h-56 w-full animate-pulse bg-slate-200/70 dark:bg-white/[0.06]" />
                <div className="p-5 space-y-3">
                  <div className="h-5 w-3/4 animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.06]" />
                  <div className="h-4 w-2/3 animate-pulse rounded-xl bg-slate-200/70 dark:bg-white/[0.06]" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((item) => {
              const href = typeof item?.link === "string" ? item.link : "";
              const isActive = !!item.isActive;

              return (
                <GlassCard key={item.id} className="overflow-hidden">
                  {/* Banner */}
                  <div className="relative h-44 2xl:h-56">
                    <Image
                      src={bannerSrcOf(item)}
                      alt="News cover"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className={isActive ? glass.chipOn : glass.chipOff}>
                        {isActive ? "Active" : "Inactive"}
                      </span>

                      <div className="relative">
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white hover:bg-white/35"
                          onClick={() => openEditModal(item)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* quick link */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="text-white text-xs drop-shadow">
                        <span className="opacity-80">Channel:</span>{" "}
                        <span className="font-medium">{item.channel || "—"}</span>
                      </div>
                      <a
                        href={href || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cx(
                          "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs",
                          href ? "bg-white/25 text-white hover:bg-white/35" : "bg-white/10 text-white/60 cursor-not-allowed"
                        )}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open
                      </a>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{item.channel}</div>
                        <div className="text-xs opacity-70">
                          {item.newsDate ? formatDatetoReadable(item.newsDate) : "—"}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-4">{item.description}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex flex-wrap items-center gap-3 p-5 border-t border-white/30">
                    <button
                      onClick={() => openEditModal(item)}
                      className={glass.btnSecondary}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(item.id);
                        setShowDelete(true);
                      }}
                      className={cx(
                        glass.btnPrimary,
                        "bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700"
                      )}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>

                    <div className="ml-auto">
                      <NewsStatusToggle id={item.id} status={!!item.isActive} />
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <GlassModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit News" : "Add News"}
      >
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <input
            type="text"
            placeholder="Channel name"
            value={formData.channel}
            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
            className={glass.input}
            required
          />
          <input
            type="url"
            placeholder="News link"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className={glass.input}
            required
          />
          <input
            type="date"
            value={formData.newsDate}
            onChange={(e) => setFormData({ ...formData, newsDate: e.target.value })}
            className={glass.input}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={cx(glass.input, "resize-none")}
            rows={5}
            required
          />

          {/* Preview + upload */}
          <div className="flex items-center gap-4">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="preview"
                className="h-24 w-36 rounded-xl object-cover border border-white/30"
              />
            ) : (
              <div className="h-24 w-36 rounded-xl border border-white/30 bg-white/60 dark:bg-white/[0.06] grid place-items-center text-xs text-slate-500">
                No image
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, bannerImage: file });
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowModal(false)} className={glass.btnSecondary}>
              Cancel
            </button>
            <button type="submit" className={glass.btnPrimary}>
              {editingItem ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* Delete Modal */}
      <GlassModal open={showDelete} onClose={() => setShowDelete(false)} title="Delete News">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this news?
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setShowDelete(false)} className={glass.btnSecondary}>
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className={cx(glass.btnPrimary, "bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700")}
          >
            Delete
          </button>
        </div>
      </GlassModal>
    </div>
  );
}
