"use client";

import { useEffect, useState } from "react";
import GlassModal from "@/components/GlassUI/GlassModal";
import { glass, cx } from "@/components/GlassUI/GlassKit";
import { uploadImage } from "@/upload";
import { useToast } from "@/components/Toast/ToastProvider";
import { createVideos } from "@/app/videos/fetch";

export default function AddVideoModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const toast = useToast();
  const [form, setForm] = useState<any>({
    youtubeLink: "",
    coverImage: null,
    description: "",
    videoTitle: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ youtubeLink: "", coverImage: null, description: "", videoTitle: "" });
    setPreview(null);
    setBusy(false);
  }, [open]);

  const save = async () => {
    try {
      setBusy(true);
      const payload: any = { ...form };
      if (form.coverImage instanceof File) {
        const up = await uploadImage(form.coverImage, "images");
        if (!up?.success || !up?.path) throw new Error("Upload failed");
        payload.coverImage = up.path;
      }
      await createVideos(payload);
      toast("success", "Created", "Video created");
      onClose();
      await onSaved();
    } catch (e: any) {
      toast("error", "Error", e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Add Video">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          className={glass.input}
          placeholder="Video Title"
          value={form.videoTitle}
          onChange={(e) => setForm((s: any) => ({ ...s, videoTitle: e.target.value }))}
          required
        />
        <input
          type="url"
          className={glass.input}
          placeholder="YouTube link"
          value={form.youtubeLink}
          onChange={(e) => setForm((s: any) => ({ ...s, youtubeLink: e.target.value }))}
          required
        />
        <textarea
          className={cx(glass.input, "resize-none")}
          rows={4}
          placeholder="Short description (optional)"
          value={form.description}
          onChange={(e) => setForm((s: any) => ({ ...s, description: e.target.value }))}
        />

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
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </GlassModal>
  );
}
