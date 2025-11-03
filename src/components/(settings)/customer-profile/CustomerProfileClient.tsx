"use client";

import { useEffect, useState, useCallback } from "react";
import { GlassCard, GlowButton } from "./ui";
import CustomerProfileModal from "./CustomerProfileModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { getDefaultProfiles, updateDefaultProfiles } from "@/app/(settings)/customer-profile/fetch";
import { uploadImage } from "@/upload";
import { Edit3, Save, X } from "lucide-react";

type DefaultProfile = { id: number; name: string; profile: string; isActive: boolean };

const buildImgSrc = (val?: string) => {
  if (!val) return "/placeholder.svg";
  if (/^(blob:|data:|https?:\/\/)/i.test(val)) return val;
  return `${process.env.NEXT_PUBLIC_BASEURL || ""}${val}`;
};

export default function CustomerProfileClient() {
  const toast = useToast();
  const [profiles, setProfiles] = useState<DefaultProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<DefaultProfile | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getDefaultProfiles();
    setProfiles(res.profiles || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      if (!file) {
        toast("warning", "No file", "Please select an image");
        return;
      }
      const uploaded = await uploadImage(file, "images");
      const res = await updateDefaultProfiles(editing.id, uploaded.path);
      if (res.status) {
        toast("success", "Updated", "Profile updated successfully");
        setEditing(null);
        setFile(null);
        setPreview(null);
        load();
      } else {
        toast("error", "Error", res.message || "Update failed");
      }
    } catch (err: any) {
      toast("error", "Error", err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-600 dark:text-slate-400">Loading…</div>;
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {profiles.map((p) => (
          <GlassCard key={p.id} className="flex flex-col items-center">
            <img
              src={buildImgSrc(p.profile)}
              alt={p.name}
              className="h-20 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
              onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
            />
            <div className="mt-2 text-sm font-medium text-center text-slate-900 dark:text-slate-100">
              {p.name}
            </div>
            <GlowButton variant="secondary" className="mt-3" onClick={() => setEditing(p)}>
              <Edit3 size={14} />
              Change
            </GlowButton>
          </GlassCard>
        ))}
      </div>

      <CustomerProfileModal
        open={!!editing}
        onClose={() => {
          setEditing(null);
          setFile(null);
          setPreview(null);
        }}
        title={editing ? `Edit ${editing.name}` : "Edit"}
      >
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
              <img
                src={preview || buildImgSrc(editing?.profile)}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
              />
            </div>
            <label className="flex-1 text-xs text-slate-700 dark:text-slate-300">
              Upload new image
              <input type="file" accept="image/*" onChange={onPickFile} className="mt-1 block w-full text-sm" />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <GlowButton variant="ghost" onClick={() => setEditing(null)}>
              <X size={14} />
              Cancel
            </GlowButton>
            <GlowButton type="submit" variant="primary" disabled={saving} loading={saving}>
              <Save size={14} />
              {saving ? "Saving…" : "Save"}
            </GlowButton>
          </div>
        </form>
      </CustomerProfileModal>
    </>
  );
}
