
"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Check, Clock4, X } from "lucide-react";
import { verifyGallery } from "@/app/(astrologers)/astrologers/fetch";
import { useToast } from "@/components/Toast/ToastProvider";
import { cn } from "@/lib/utils";

/* ---------------- helpers ---------------- */
const abs = (p?: string) =>
  p ? `${process.env.NEXT_PUBLIC_BASEURL}${p.startsWith("/") ? "" : "/"}${p}` : "";
const placeholder = "https://gyanitalk.com/build/assets/images/person.png";

type GalleryItem = {
  id: number;
  image?: string | null;
  status?: number | string; // 0 = pending, 1 = approved
  created_at?: string | Date | null;
};

const Pill = ({
  tone,
  children,
  className,
}: {
  tone: "emerald" | "amber" | "slate";
  children: React.ReactNode;
  className?: string;
}) => {
  const map = {
    emerald:
      "border-emerald-300/60 dark:border-emerald-800/40 bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    amber:
      "border-amber-300/60 dark:border-amber-800/40 bg-amber-100/60 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    slate:
      "border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        map[tone],
        className
      )}
    >
      {children}
    </span>
  );
};

/* ---------------- component ---------------- */
export default function GalleryList({ gallery }: { gallery: GalleryItem[] }) {
  const toast = useToast();

  // keep a local, mutable copy so we can optimistically update without reloading
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

    // optimistic update
    setBusy(true);
    setItems((prev) =>
      prev.map((x) => (x.id === g.id ? { ...x, status: nextVal } : x))
    );

    try {
      await verifyGallery({ id: g.id, status: nextVal });
      toast(
        "warning",
        current ? "Approval Revoked" : "Image Approved",
        current ? "The image is now pending." : "The image is now approved."
      );
    } catch {
      // revert on failure
      setItems((prev) =>
        prev.map((x) => (x.id === g.id ? { ...x, status: current ? 1 : 0 } : x))
      );
      toast("error", "Error", "Failed to update image verification.");
    } finally {
      setBusy(false);
      setSelected(null); // close modal if open
    }
  };

  return (
    <div className=" m-4 relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] backdrop-blur-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.02] dark:to-transparent" />

      {/* Top bar */}
      <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Pill tone="slate">Images: {counts.all}</Pill>
          <Pill tone="emerald" className="hidden sm:inline-flex">
            Approved: {counts.approved}
          </Pill>
          <Pill tone="amber" className="hidden sm:inline-flex">
            Pending: {counts.pending}
          </Pill>
        </div>

        <div className="flex items-center gap-2">
          {(["All", "Pending", "Approved"] as const).map((x) => (
            <button
              key={x}
              onClick={() => setFilter(x)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition",
                filter === x
                  ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_8px_20px_rgba(59,130,246,0.25)]"
                  : "text-slate-700 dark:text-slate-300 border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.06] hover:bg-white/80 dark:hover:bg-white/[0.12]"
              )}
            >
              {x === "Approved" ? <Check className="h-3.5 w-3.5" /> : x === "Pending" ? <Clock4 className="h-3.5 w-3.5" /> : null}
              {x}
            </button>
          ))}
        </div>
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
                <button
                  type="button"
                  aria-label="Open image"
                  onClick={() => setSelected(img)}
                  className="block w-full"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={img.image ? abs(img.image) : placeholder}
                      alt={`Image ${img.id}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    />
                    <div className="absolute inset-x-0 top-0 p-3 flex justify-between">
                      <Pill tone={isApproved ? "emerald" : "amber"}>
                        {isApproved ? "Approved" : "Pending"}
                      </Pill>
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </button>

                <div className="flex items-center justify-between gap-3 border-t border-white/30 dark:border-white/10 bg-white/50 dark:bg-white/[0.04] px-3 py-2.5">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {createdLabel(img)}
                  </div>

                  {isApproved ? (
                    <button
                      disabled={busy}
                      onClick={() => toggleVerify(img)}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] hover:bg-white/90 dark:hover:bg-white/[0.12] transition disabled:opacity-60"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      disabled={busy}
                      onClick={() => setSelected(img)}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-[0_8px_20px_rgba(59,130,246,0.25)] transition disabled:opacity-60"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !busy && setSelected(null)}
          />
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white/70 dark:bg-white/[0.08] backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
            {/* header */}
            <div className="flex items-center justify-between border-b border-white/20 bg-white/60 dark:bg-white/[0.06] px-5 py-3">
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {Number(selected.status) === 1 ? "Revoke Approval" : "Verify Image"}
              </div>
              <button
                onClick={() => !busy && setSelected(null)}
                className="rounded-lg p-1 text-slate-500 hover:bg-white/60 dark:text-slate-300 dark:hover:bg-white/[0.08]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* content */}
            <div className="max-h-[70vh] overflow-auto p-5">
              <div className="relative mx-auto w-full aspect-[4/3]">
                <Image
                  src={selected.image ? abs(selected.image) : placeholder}
                  alt="Preview"
                  fill
                  className="object-contain rounded-xl bg-slate-100/40 dark:bg-slate-800/30"
                />
              </div>
            </div>

            {/* footer */}
            <div className="flex items-center justify-end gap-2 border-t border-white/20 bg-white/50 dark:bg-white/[0.05] px-5 py-3">
              <button
                onClick={() => !busy && setSelected(null)}
                className="inline-flex items-center justify-center rounded-xl border border-white/30 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white/90 dark:hover:bg-white/[0.12] transition disabled:opacity-60"
                disabled={busy}
              >
                Cancel
              </button>

              <button
                onClick={() => toggleVerify(selected)}
                disabled={busy}
                className={cn(
                  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-60",
                  Number(selected.status) === 1
                    ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                )}
              >
                {busy
                  ? "Updating…"
                  : Number(selected.status) === 1
                  ? "Revoke"
                  : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
