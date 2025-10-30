"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { GlassCard, glass, cx } from "@/components/GlassUI/GlassKit";
import GlassModal from "@/components/GlassUI/GlassModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import { coverSrc } from "./utils";
import type { Video } from "../../types/videos";
import VideoStatusToggle from "./VideoStatusToggle";
import { updateVideos, deleteVideos } from "@/app/videos/fetch";

export default function VideoCard({
  item,
  onRefresh,
}: {
  item: Video;
  onRefresh: () => Promise<void>;
}) {
  const toast = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<any>({
    youtubeLink: item.youtubeLink ?? "",
    coverImage: item.coverImage ?? null,
    description: item.description ?? "",
    videoTitle: item.videoTitle ?? "",
  });
  const [preview, setPreview] = useState<string | null>(coverSrc(item.coverImage));

  const save = async () => {
    try {
      setBusy(true);
      const payload: any = { ...form };
      if (form.coverImage instanceof File) {
        const up = await uploadImage(form.coverImage, "images");
        if (!up?.success || !up?.path) throw new Error("Upload failed");
        payload.coverImage = up.path;
      }
      await updateVideos(Number(item.id), payload);
      toast("success", "Saved", "Video updated");
      setShowEdit(false);
      await onRefresh();
    } catch (e: any) {
      toast("error", "Error", e?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    try {
      setBusy(true);
      await deleteVideos(Number(item.id));
      toast("success", "Deleted", "Video deleted");
      setShowDel(false);
      await onRefresh();
    } catch {
      toast("error", "Error", "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const href = typeof item.youtubeLink === "string" ? item.youtubeLink : "";
  const isActive = !!item.isActive;

  return (
    <GlassCard className="overflow-hidden">
      {/* Media */}
      <div className="relative aspect-video w-full">
        <Image src={coverSrc(item.coverImage)} alt="Video cover" fill className="object-cover" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <span className={cx("absolute top-3 left-3", isActive ? "bg-emerald-600" : "bg-rose-600",
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm"
        )}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 space-y-2">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2">
          {item.videoTitle || "Untitled"}
        </h3>
        {item.description ? (
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">{item.description}</p>
        ) : null}
      </div>

      {/* Footer */}
      <div className="grid grid-cols-2 gap-2 p-5 pt-4 border-t border-white/30">
        <a
          href={href || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className={cx(
            "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition",
            "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white"
          )}
          aria-disabled={!href}
          onClick={(e) => !href && e.preventDefault()}
        >
          <ExternalLink className="h-4 w-4" /> Open
        </a>

        <button
          onClick={() => setShowEdit(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white"
        >
          <Edit className="h-4 w-4" /> Edit
        </button>

        <button
          onClick={() => setShowDel(true)}
          className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition text-white bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>

        <div className="col-span-2 flex items-center justify-end">
          <VideoStatusToggle id={Number(item.id)} status={!!item.isActive} onAfter={onRefresh} />
        </div>
      </div>

      {/* Edit Modal */}
      <GlassModal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Video">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            className="rounded-xl border border-white/30 dark:border-white/10 bg-white/80 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="Video Title"
            value={form.videoTitle}
            onChange={(e) => setForm((s: any) => ({ ...s, videoTitle: e.target.value }))}
            required
          />
          <input
            type="url"
            className="rounded-xl border border-white/30 dark:border-white/10 bg-white/80 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40"
            placeholder="YouTube link"
            value={form.youtubeLink}
            onChange={(e) => setForm((s: any) => ({ ...s, youtubeLink: e.target.value }))}
            required
          />
          <textarea
            className="rounded-xl border border-white/30 dark:border-white/10 bg-white/80 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
            rows={4}
            placeholder="Short description (optional)"
            value={form.description || ""}
            onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))}
          />

          {/* Cover */}
          <div className="flex items-center gap-4">
            {preview && (
              <img src={preview} alt="Preview" className="h-24 w-36 object-cover rounded-xl border border-white/30" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setForm((s: any) => ({ ...s, coverImage: f }));
                  setPreview(URL.createObjectURL(f));
                }
              }}
            />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={() => setShowEdit(false)} className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* Delete Modal */}
      <GlassModal open={showDel} onClose={() => setShowDel(false)} title="Delete Video">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this video?
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={() => setShowDel(false)} className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white">
            Cancel
          </button>
          <button onClick={remove} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition text-white bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700">
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </GlassModal>
    </GlassCard>
  );
}
