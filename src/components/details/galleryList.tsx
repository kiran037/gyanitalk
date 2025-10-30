// // components/details/galleryList.tsx
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, Clock4, X } from "lucide-react";
import { verifyGallery } from "@/app/(astrologers)/astrologers/fetch";
import { useToast } from "@/components/Toast/ToastProvider";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import GlassModal from "@/components/GlassUI/GlassModal";
import GlassButton from "@/components/GlassUI/GlassButton";
import { Segmented } from "@/components/GlassUI/Segmented";
import { GlassBadge } from "@/components/GlassUI/GlassBadge";

const abs = (p?: string) => (p ? `${process.env.NEXT_PUBLIC_BASEURL}${p.startsWith("/") ? "" : "/"}${p}` : "");
const placeholder = "https://gyanitalk.com/build/assets/images/person.png";

type GalleryItem = {
  id: number;
  image?: string | null;
  status?: number | string; // 0 = pending, 1 = approved
  created_at?: string | Date | null;
};

export default function GalleryList({ gallery }: { gallery: GalleryItem[] }) {
  const toast = useToast();

  const [items, setItems] = useState<GalleryItem[]>(gallery || []);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved">("All");
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [busy, setBusy] = useState(false);

  const counts = useMemo(() => {
    const all = items.length;
    const approved = items.filter((g) => Number(g.status) === 1).length;
    const pending = all - approved;
    return { all, approved, pending };
  }, [items]);

  const visible = useMemo(() => {
    if (filter === "All") return items;
    const want = filter === "Approved" ? 1 : 0;
    return items.filter((g) => Number(g.status) === want);
  }, [items, filter]);

  const createdLabel = (g: GalleryItem) =>
    g.created_at ? format(new Date(g.created_at), "dd MMM yyyy, hh:mm a") : "N/A";

  const toggleVerify = async (g: GalleryItem) => {
    const current = Number(g.status) === 1;
    const nextVal = current ? 0 : 1;

    setBusy(true);
    setItems((prev) => prev.map((x) => (x.id === g.id ? { ...x, status: nextVal } : x)));

    try {
      await verifyGallery({ id: g.id, status: nextVal });
      toast(
        "warning",
        current ? "Approval Revoked" : "Image Approved",
        current ? "The image is now pending." : "The image is now approved."
      );
    } catch {
      setItems((prev) => prev.map((x) => (x.id === g.id ? { ...x, status: current ? 1 : 0 } : x)));
      toast("error", "Error", "Failed to update image verification.");
    } finally {
      setBusy(false);
      setSelected(null);
    }
  };

  return (
    <GlassCard className="m-4 p-5 md:p-6 relative overflow-hidden">
      {/* Top bar */}
      <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <GlassBadge variant="slate">Images: {counts.all}</GlassBadge>
          <GlassBadge variant="emerald" className="hidden sm:inline-flex">Approved: {counts.approved}</GlassBadge>
          <GlassBadge variant="amber" className="hidden sm:inline-flex">Pending: {counts.pending}</GlassBadge>
        </div>

        <Segmented
          value={filter}
          onChange={(v) => setFilter(v as typeof filter)}
          options={["All", "Pending", "Approved"] as const}
        />
      </div>

      {/* Grid */}
      {!visible.length ? (
        <div className="relative z-10 rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] p-8 text-center text-slate-500 dark:text-slate-400">
          No images found.
        </div>
      ) : (
        <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((img) => {
            const isApproved = Number(img.status) === 1;
            return (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
              >
                <button type="button" aria-label="Open image" onClick={() => setSelected(img)} className="block w-full">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={img.image ? abs(img.image) : placeholder}
                      alt={`Image ${img.id}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    <div className="absolute inset-x-0 top-0 p-3 flex justify-between">
                      <GlassBadge variant={isApproved ? "emerald" : "amber"}>{isApproved ? "Approved" : "Pending"}</GlassBadge>
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </button>

                <div className="flex items-center justify-between gap-3 border-t border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/[0.04] px-3 py-2.5">
                  <div className="text-xs text-slate-600 dark:text-slate-400">{createdLabel(img)}</div>

                  {isApproved ? (
                    <GlassButton disabled={busy} variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => toggleVerify(img)}>
                      Revoke
                    </GlassButton>
                  ) : (
                    <GlassButton disabled={busy} className="px-3 py-1.5 text-xs" onClick={() => setSelected(img)}>
                      Review
                    </GlassButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verify / Revoke Modal */}
      <GlassModal
        open={!!selected}
        onClose={() => !busy && setSelected(null)}
        title={selected && Number(selected.status) === 1 ? "Revoke Approval" : "Verify Image"}
        maxWidth="max-w-2xl"
      >
        {selected ? (
          <>
            <div className="max-h-[70vh] overflow-auto p-2 sm:p-3">
              <div className="relative mx-auto w-full aspect-[4/3]">
                <Image
                  src={selected.image ? abs(selected.image) : placeholder}
                  alt="Preview"
                  fill
                  className="object-contain rounded-xl bg-slate-100/40 dark:bg-slate-800/30"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-white/20 bg-white/50 dark:bg-white/[0.05] px-5 py-3">
              <GlassButton variant="secondary" onClick={() => !busy && setSelected(null)} disabled={busy}>
                Cancel
              </GlassButton>
              <GlassButton
                onClick={() => selected && toggleVerify(selected)}
                disabled={busy}
                variant={Number(selected.status) === 1 ? "danger" : "primary"}
              >
                {busy ? "Updating…" : Number(selected.status) === 1 ? "Revoke" : "Approve"}
              </GlassButton>
            </div>
          </>
        ) : null}
      </GlassModal>
    </GlassCard>
  );
}
