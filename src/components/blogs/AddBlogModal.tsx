"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import GlassModal from "@/components/GlassUI/GlassModal";
import { glass, cx } from "../GlassUI/GlassKit";
import { uploadImage } from "@/upload";
import { createBlogs } from "@/app/blogs/fetch";
import { useToast } from "@/components/Toast/ToastProvider";
import { getFileExtension } from "./utils";

export default function AddBlogModal({
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
