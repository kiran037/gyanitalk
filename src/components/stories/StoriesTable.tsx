"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import GlassModal from "@/components/stories/StoriesModal";
import { useToast } from "@/components/Toast/ToastProvider";
import { getStories, deleteStories } from "@/app/stories/fetch";
import { buildImg } from "@/components/stories/utils";

type Props = {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
};

export default function StoriesTable({ page = 1, limit = 15, search = "", startDate }: Props) {
  const toast = useToast();
  const [data, setData] = useState<any[]>([]);
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // modal state
  const [activeAstroId, setActiveAstroId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
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
    })();
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
      if (remaining <= 0) closeModal();
      else setCurrentIndex((i) => Math.max(0, Math.min(remaining - 1, i)));
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
                  <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200/70 dark:bg-white/[0.06]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200/70 dark:bg-white/[0.06]" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200/70 dark:bg-white/[0.06]" />
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
                <button key={astroId} onClick={() => openModal(Number(astroId))} className="text-left">
                  <GlassCard className="w-full p-5">
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
      <GlassModal open={!!activeAstroId && !!currentStory} onClose={closeModal} title={astrologer?.name || "Story"}>
        {currentStory && (
          <div className="relative">
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0">
                <Image src={buildImg(astrologer?.profileImage)} alt={astrologer?.name || "Astrologer"} fill className="rounded-full object-cover" />
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
                    <Image src={buildImg(currentStory.media)} alt="Story Image" fill className="object-contain" />
                  )}
                  {currentStory.mediaType === "video" && (
                    <video src={buildImg(currentStory.media)} controls className="absolute inset-0 h-full w-full object-contain" />
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
              <span className="text-sm text-slate-600 dark:text-slate-400">👁 {currentStory.StoryViewCount || 0} views</span>
              <button
                onClick={() => startTransition(() => { /* optimistic */ })}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 px-3 text-sm font-medium text-white hover:from-rose-700 hover:to-orange-700"
                onMouseUp={() => handleDelete(currentStory.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>

            {/* Navigation */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 pl-1">
              {currentIndex > 0 && (
                <button onClick={() => setCurrentIndex((i) => i - 1)} className="rounded-full bg-white/90 p-2 shadow hover:bg-white">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-1">
              {currentIndex < activeStories.length - 1 && (
                <button onClick={() => setCurrentIndex((i) => i + 1)} className="rounded-full bg-white/90 p-2 shadow hover:bg-white">
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
