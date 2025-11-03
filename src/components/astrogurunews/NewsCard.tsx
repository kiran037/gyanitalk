"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import dayjs from "dayjs";
import { useToast } from "@/components/Toast/ToastProvider";
import { uploadImage } from "@/upload";
import GlassModal from "@/components/GlassUI/GlassModal";
import { GlassCard, glass, cx } from "@/components/GlassUI/GlassKit";
import NewsStatusToggle from "./NewsStatusToggle";
import { bannerSrcOf } from "./utils";
import type { News } from "../../types/astrogurunews";
import {
  updateAstroguruNews,
  deleteAstroguruNews,
} from "@/app/astrogurunews/fetch";

export default function NewsCard({
  item,
  onRefresh,
}: {
  item: News;
  onRefresh: () => Promise<void>;
}) {
  const toast = useToast();
  const [menuOpen, _] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<any>({
    channel: item.channel || "",
    link: item.link || "",
    newsDate: item.newsDate?.slice(0, 10) || dayjs().format("YYYY-MM-DD"),
    description: item.description || "",
    bannerImage: item.bannerImage || null,
  });

  const [preview, setPreview] = useState<string | null>(
    bannerSrcOf(item)
  );
  const isActive = !!item.isActive;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((s: any) => ({ ...s, bannerImage: file }));
    setPreview(URL.createObjectURL(file));
  };

  const save = useCallback(async () => {
    try {
      setBusy(true);
      const payload: any = { ...form };

      if (form.bannerImage instanceof File) {
        const up = await uploadImage(form.bannerImage, "images");
        if (!up?.success) throw new Error("Upload failed");
        payload.bannerImage = up.path;
      }

      await updateAstroguruNews(item.id, payload);
      toast("success", "Saved", "News updated successfully.");
      setShowEdit(false);
      await onRefresh();
    } catch (e: any) {
      toast("error", "Error", e?.message || "Failed to save news");
    } finally {
      setBusy(false);
    }
  }, [form, item.id, onRefresh, toast]);

  const remove = useCallback(async () => {
    try {
      setBusy(true);
      await deleteAstroguruNews(item.id);
      toast("success", "Deleted", "News removed.");
      setShowDel(false);
      await onRefresh();
    } catch {
      toast("error", "Error", "Failed to delete news.");
    } finally {
      setBusy(false);
    }
  }, [item.id, onRefresh, toast]);

  return (
    <GlassCard hover className="overflow-hidden">
      <div className="relative h-44 2xl:h-56">
        <Image
          src={bannerSrcOf(item)}
          alt={item.channel}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Status + Edit + Link */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className={isActive ? glass.chipOn : glass.chipOff}>
            {isActive ? "Active" : "Inactive"}
          </span>

          <div className="flex gap-2">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white hover:bg-white/35"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={() => setShowEdit(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white hover:bg-white/35"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-slate-900 dark:text-white">
            {item.channel}
          </div>
          <div className="text-xs opacity-70 text-slate-600 dark:text-white">
            {item.newsDate ? dayjs(item.newsDate).format("DD MMM YYYY") : "—"}
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-4">
          {item.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 p-5 border-t border-white/30">
        <button
          onClick={() => setShowEdit(true)}
          className={glass.btnSecondary}
        >
          <Edit className="w-4 h-4" /> Edit
        </button>
        <button
          onClick={() => setShowDel(true)}
          className={cx(
            glass.btnPrimary,
            "bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700"
          )}
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>

        <div className="ml-auto">
          <NewsStatusToggle
            id={item.id}
            status={!!item.isActive}
            onAfter={onRefresh}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <GlassModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title="Edit News"
      >
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <input
            className={glass.input}
            placeholder="Channel"
            value={form.channel}
            onChange={(e) =>
              setForm((s: any) => ({ ...s, channel: e.target.value }))
            }
            required
          />

          <input
            type="url"
            className={glass.input}
            placeholder="News Link"
            value={form.link}
            onChange={(e) =>
              setForm((s: any) => ({ ...s, link: e.target.value }))
            }
            required
          />

          <input
            type="date"
            className={glass.input}
            value={form.newsDate}
            onChange={(e) =>
              setForm((s: any) => ({
                ...s,
                newsDate: e.target.value,
              }))
            }
            required
          />

          <textarea
            className={cx(glass.input, "resize-none")}
            rows={5}
            value={form.description}
            placeholder="Description"
            onChange={(e) =>
              setForm((s: any) => ({
                ...s,
                description: e.target.value,
              }))
            }
            required
          />

          <div className="flex gap-4 items-center">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-24 w-36 rounded-xl object-cover border border-white/30"
              />
            ) : (
              <div className="h-24 w-36 rounded-xl border grid place-items-center text-xs opacity-60">
                No Image
              </div>
            )}
            <input type="file" accept="image/*" onChange={onFile} />
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className={glass.btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className={glass.btnPrimary}
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* Delete Modal */}
      <GlassModal
        open={showDel}
        onClose={() => setShowDel(false)}
        title="Delete News"
      >
        <p>Are you sure you want to delete?</p>
        <div className="mt-4 flex justify-end gap-3">
          <button onClick={() => setShowDel(false)} className={glass.btnSecondary}>
            Cancel
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className={cx(
              glass.btnPrimary,
              "bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700"
            )}
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </GlassModal>
    </GlassCard>
  );
}
