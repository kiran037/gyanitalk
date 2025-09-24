
"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { Plus, X, Calendar, Video, CheckSquare } from "lucide-react";
import { uploadImage } from "@/upload";
import { isValidImageUrl } from "@/components/functions";
import {
  getBanners,
  getBannerTypes,
  addBanner,
  updateBanner,
  updateBannersStatus,
} from "./fetch";
import { useToast } from "@/components/Toast/ToastProvider";

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

  return (
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
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {title || "Dialog"}
            </h3>
            <button onClick={onClose} className={cx(glass.btn, glass.btnNeutral, "h-8 px-2")} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[75vh] overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
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
const bannerSrc = (val?: string | null) =>
  isValidImageUrl(val || "") ? (/^https?:\/\//i.test(val!) ? val! : `${BASE}${val}`) : FALLBACK;

/* =========================
   Status Toggle
========================= */
function BannersStatusToggle({ id, status }: { id: number; status: boolean }) {
  const toast = useToast();
  const [checked, setChecked] = useState(status);
  const [, startTransition] = useTransition();

  const toggleLiveStatus = async (newValue: boolean) => {
    setChecked(newValue);
    const res = await updateBannersStatus(id, newValue);
    if (res?.success) {
      toast("success", "Status Updated", "Banner status updated");
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
export default function BannersPage() {
  const toast = useToast();

  const [bannerTypes, setBannerTypes] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    fromDate: "",
    toDate: "",
    bannerTypeId: "",
    bannerImage: null as File | string | null,
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [bRes, tRes] = await Promise.all([getBanners(), getBannerTypes()]);
      setBanners(bRes.data || []);
      setBannerTypes(tRes.data || []);
    } catch (err) {
      toast("error", "Load Failed", "Could not load banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ fromDate: "", toDate: "", bannerTypeId: "", bannerImage: null, isActive: true });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      fromDate: item.fromDate?.slice(0, 10) || "",
      toDate: item.toDate?.slice(0, 10) || "",
      bannerTypeId: item.bannerTypeId || "",
      bannerImage: item.bannerImage || null,
      isActive: !!item.isActive,
    });
    setImagePreview(bannerSrc(item.bannerImage));
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload: any = { ...formData };
      if (formData.bannerImage instanceof File) {
        const uploadRes = await uploadImage(formData.bannerImage, "images");
        if (uploadRes?.success && uploadRes?.path) payload.bannerImage = uploadRes.path;
        else {
          toast("error", "Upload Failed", "Image upload failed");
          return;
        }
      }

      if (editingItem) {
        await updateBanner(editingItem.id, payload);
        toast("success", "Updated", "Banner updated successfully");
      } else {
        await addBanner(payload);
        toast("success", "Created", "Banner created successfully");
      }

      setShowModal(false);
      fetchAll();
    } catch (err: any) {
      toast("error", "Save Failed", err?.message || "Could not save banner");
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
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Banners</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage date range, type, image, and status.</p>
            </div>
            <button onClick={openAddModal} className={cx(glass.btn, glass.btnPrimary)}>
              <Plus className="h-4 w-4" />
              Add Banner
            </button>
          </div>
        </GlassCard>

        {/* Grid */}
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <GlassCard key={i} className="overflow-hidden">
                  <div className="aspect-video w-full animate-pulse bg-slate-200/70 dark:bg-white/[0.06]" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/[0.06]" />
                    <div className="h-4 w-2/3 animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/[0.06]" />
                  </div>
                </GlassCard>
              ))
            : banners.length
            ? banners.map((item: any) => {
                const isActive = !!item.isActive;
                return (
                  <GlassCard key={item.id} className="overflow-hidden">
                    {/* Media – fixed aspect ratio prevents clipping */}
                    <div className="relative aspect-video w-full">
                      <Image src={bannerSrc(item.bannerImage)} alt="Banner" fill className="object-cover" />
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                      <span className={cx("absolute top-3 left-3", isActive ? glass.chipOn : glass.chipOff)}>
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">From:</span>
                        <span>{item.fromDate ? dayjs(item.fromDate).format("DD-MMM-YYYY") : "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">To:</span>
                        <span>{item.toDate ? dayjs(item.toDate).format("DD-MMM-YYYY") : "-"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4" />
                        <span className="font-medium">Type:</span>
                        <span>{item.bannerType?.name || "N/A"}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="grid grid-cols-2 items-center gap-2 p-5 pt-4 border-t border-white/30">
                      <button onClick={() => openEditModal(item)} className={cx(glass.btn, glass.btnNeutral)}>
                        <CheckSquare className="h-4 w-4" />
                        Edit
                      </button>
                      <div className="col-span-1 flex items-center justify-end">
                        <BannersStatusToggle id={item.id} status={isActive} />
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            : (
              <GlassCard className="p-10 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">No banners found</p>
              </GlassCard>
            )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <GlassModal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? "Edit Banner" : "Add Banner"}
      >
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">From Date</span>
              <input
                type="date"
                value={formData.fromDate}
                onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                className={glass.input}
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">To Date</span>
              <input
                type="date"
                value={formData.toDate}
                onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                className={glass.input}
                required
              />
            </label>
          </div>

          {/* Type */}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Banner Type</span>
            <select
              value={formData.bannerTypeId}
              onChange={(e) => setFormData({ ...formData, bannerTypeId: Number(e.target.value) })}
              className={glass.input}
              required
            >
              <option value="">Select type</option>
              {bannerTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </label>

          {/* Preview + Upload */}
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Banner Image</span>
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
                  setFormData({ ...formData, bannerImage: file });
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>

          {/* Active switch (optional inline control for new banner) */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Set Active</span>
            <GlassSwitch
              checked={!!formData.isActive}
              onChange={(v) => setFormData({ ...formData, isActive: v })}
            />
          </div>

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
    </div>
  );
}
