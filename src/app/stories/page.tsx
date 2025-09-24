// /src/app/stories/page.tsx
"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { createPortal } from "react-dom";

import { getStories, deleteStories } from "@/app/stories/fetch";
import { isValidImageUrl } from "@/components/functions";
import { useToast } from "@/components/Toast/ToastProvider";

/* =================================================================================
   Tiny Glass Kit (local)
================================================================================= */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
const FALLBACK = "https://gyanitalk.com/build/assets/images/person.png";

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl shadow-[0_8px_28px_rgba(0,0,0,0.08)] " +
    "dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
  lift:
    "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(0,0,0,0.10)] " +
    "dark:hover:shadow-[0_16px_44px_rgba(0,0,0,0.45)]",
  input:
    "rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
  btnDanger:
    "text-white bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700",
};

function GlassCard({
  children,
  className = "",
  hover = true,
}: React.PropsWithChildren<{ className?: string; hover?: boolean }>) {
  return <div className={cx(glass.surface, hover && glass.lift, className)}>{children}</div>;
}

/** Full-viewport modal rendered to body to ensure backdrop blur covers entire page */
function GlassModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-3xl",
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

  const modal = (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop that truly covers the whole viewport */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div className={cx("relative z-10 w-full", maxWidth)} onMouseDown={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/85 dark:bg-slate-900/75 backdrop-blur-2xl shadow-[0_30px_120px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-white/20 bg-white/60 dark:bg-white/[0.06] px-6 py-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title || "Preview"}</h3>
            <button onClick={onClose} className={cx(glass.btn, glass.btnNeutral, "h-8 px-2")} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-[80vh] overflow-y-auto px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

/* =================================================================================
   Helpers
================================================================================= */
const buildImg = (val?: string | null) =>
  isValidImageUrl(val || "") ? (/^https?:\/\//i.test(val!) ? val! : `${BASE}${val}`) : FALLBACK;

/* =================================================================================
   Stories Grid + Modal
================================================================================= */
function StoriesTable({
  page = 1,
  limit = 15,
  search = "",
  startDate,
}: {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
}) {
  const toast = useToast();
  const [data, setData] = useState<any[]>([]);
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // modal state
  const [activeAstroId, setActiveAstroId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function loadStories() {
      try {
        setLoading(true);
        const res = await getStories({ page, limit, search, startDate });
        setData(res.data || []);
        setAstrologers(res.astrologers || []);
      } catch {
        toast("error", "Load Failed", "Failed to load stories");
      } finally {
        setLoading(false);
      }
    }
    loadStories();
  }, [page, limit, search, startDate, toast]);

  const grouped = useMemo(() => {
    return data.reduce((acc: any, s: any) => {
      (acc[s.astrologerId] ||= []).push(s);
      return acc;
    }, {});
  }, [data]);

  const openModal = (astroId: number) => {
    setActiveAstroId(astroId);
    setCurrentIndex(0);
  };
  const closeModal = () => {
    setActiveAstroId(null);
    setCurrentIndex(0);
  };

  const activeStories = activeAstroId ? grouped[activeAstroId] || [] : [];
  const currentStory = activeStories[currentIndex];
  const astrologer = astrologers.find((a: any) => a.id === activeAstroId);

  const handleDelete = async (id: number) => {
    try {
      const res = await deleteStories(id);
      if (res?.status === false) {
        toast("error", "Delete Failed", res?.message || "Could not delete story");
        return;
      }
      toast("success", "Deleted", res?.message || "Story deleted");

      // remove from local state (grid + modal)
      setData((prev) => prev.filter((s) => s.id !== id));
      const remaining = activeStories.length - 1;
      if (remaining <= 0) {
        closeModal();
      } else {
        setCurrentIndex((i) => Math.max(0, Math.min(remaining - 1, i)));
      }
    } catch {
      toast("error", "Delete Failed", "Could not delete story");
    }
  };

  return (
    <>
      {/* Grid of astrologers */}
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <GlassCard hover={false} key={i} className="p-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
                  </div>
                </div>
              </GlassCard>
            ))
          : Object.keys(grouped).length
          ? Object.keys(grouped).map((astroId) => {
              const astro = astrologers.find((a: any) => Number(a.id) === Number(astroId));
              const stories = grouped[astroId];
              const cover = buildImg(astro?.profileImage);
              return (
                <button
                  key={astroId}
                  onClick={() => openModal(Number(astroId))}
                  className="text-left"
                >
                  <GlassCard className="p-5 w-full">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 shrink-0">
                        <Image src={cover} alt={astro?.name || "Astrologer"} fill className="rounded-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {astro?.name || "Astrologer"}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {stories.length} stories •{" "}
                          {stories[0]?.created_at ? dayjs(stories[0].created_at).format("DD MMM YYYY, h:mm A") : "-"}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </button>
              );
            })
          : (
            <GlassCard hover={false} className="p-10 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">No stories found</p>
            </GlassCard>
          )}
      </div>

      {/* Modal */}
      <GlassModal
        open={!!activeAstroId && !!currentStory}
        onClose={closeModal}
        title={astrologer?.name || "Story"}
      >
        {currentStory && (
          <div className="relative">
            {/* Header (avatar + timestamp) */}
            <div className="mb-4 flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <Image
                  src={buildImg(astrologer?.profileImage)}
                  alt={astrologer?.name || "Astrologer"}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {astrologer?.name || "Astrologer"}
                </div>
                <div className="text-xs text-slate-500">
                  {currentStory?.created_at ? dayjs(currentStory.created_at).format("DD MMM YYYY, h:mm A") : "-"}
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="mb-4">
              <div className="relative mx-auto w-full max-w-[720px] overflow-hidden rounded-2xl border border-white/30">
                <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-white/5">
                  {currentStory.mediaType === "image" && (
                    <Image
                      src={buildImg(currentStory.media)}
                      alt="Story Image"
                      fill
                      className="object-contain"
                    />
                  )}
                  {currentStory.mediaType === "video" && (
                    <video
                      src={buildImg(currentStory.media)}
                      controls
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                  )}
                  {currentStory.mediaType === "text" && (
                    <div className="absolute inset-0 grid place-items-center px-6 text-center">
                      <p className="text-sm text-slate-800 dark:text-slate-200">{currentStory.media}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Views + Delete */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                👁 {currentStory.StoryViewCount || 0} views
              </span>
              <button
                onClick={() =>
                  startTransition(() => {
                    handleDelete(currentStory.id);
                  })
                }
                className={cx(glass.btn, glass.btnDanger)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>

            {/* Navigation */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-1">
              {currentIndex > 0 && (
                <button
                  onClick={() => setCurrentIndex((i) => i - 1)}
                  className="rounded-full bg-white/90 p-2 shadow hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-1">
              {currentIndex < activeStories.length - 1 && (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="rounded-full bg-white/90 p-2 shadow hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </GlassModal>
    </>
  );
}

/* =================================================================================
   Page (client-safe search params)
================================================================================= */
export default function StoriesPage() {
  const sp = useSearchParams();
  const page = useMemo(() => Number(sp.get("page") || "1"), [sp]);
  const search = useMemo(() => sp.get("search") || "", [sp]);
  const startDate = useMemo(() => sp.get("startDate") || undefined, [sp]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-8">
        {/* Page title (replace Breadcrumb) */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stories</h1>
        </div>

        {/* Search */}
        <GlassCard className="p-5">
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name or contact"
              className={cx(glass.input, "min-w-[240px]")}
            />
            <input
              type="date"
              name="startDate"
              defaultValue={startDate}
              className={glass.input}
            />
            <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>
              Search
            </button>
            {search || startDate ? (
              <a href="?page=1" className={cx(glass.btn, glass.btnNeutral)}>
                Clear
              </a>
            ) : null}
          </form>
        </GlassCard>

        <Suspense
          fallback={
            <GlassCard className="p-8 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading…</p>
            </GlassCard>
          }
        >
          <StoriesTable page={page} search={search} startDate={startDate} />
        </Suspense>
      </div>
    </div>
  );
}
