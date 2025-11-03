///Users/xeoren/gyanitallk-admin/src/components/astrogurunews/AddNewsModal.tsx
"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import GlassModal from "@/components/GlassUI/GlassModal";
import { glass, cx } from "@/components/GlassUI/GlassKit";
import { uploadImage } from "@/upload";
import { createAstroguruNews } from "@/app/astrogurunews/fetch";
import { useToast } from "@/components/Toast/ToastProvider";

export default function AddNewsModal({
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
    channel: "",
    link: "",
    newsDate: dayjs().format("YYYY-MM-DD"),
    description: "",
    bannerImage: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      channel: "",
      link: "",
      newsDate: dayjs().format("YYYY-MM-DD"),
      description: "",
      bannerImage: null,
    });
    setPreview(null);
    setBusy(false);
  }, [open]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm((s: any) => ({ ...s, bannerImage: f }));
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    try {
      setBusy(true);
      const payload: any = { ...form };

      if (form.bannerImage instanceof File) {
        const up = await uploadImage(form.bannerImage, "images");
        if (!up?.success) throw new Error("Upload failed");
        payload.bannerImage = up.path;
      }

      await createAstroguruNews(payload);
      toast("success", "Created", "News created");
      onClose();
      await onSaved();
    } catch (e: any) {
      toast("error", "Error", e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassModal open={open} onClose={onClose} title="Add News">
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

        {/* Preview */}
        <div className="flex items-center gap-4">
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-36 rounded-xl object-cover border border-white/30"
            />
          )}
          <input type="file" accept="image/*" onChange={onFile} />
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
