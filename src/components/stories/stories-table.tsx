"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { deleteStories, getStories } from "./fetch";
import { isValidImageUrl } from "../functions";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export function StoriesTable({
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
  const [data, setData] = useState<any[]>([]);
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeAstroId, setActiveAstroId] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function loadStories() {
      try {
        setLoading(true);
        const res = await getStories({ page, limit, search, startDate }); setData(res.data || []);
        setAstrologers(res.astrologers || []);
      } catch (err) {
        toast.error("Failed to load stories");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadStories();
  }, [page, limit, search, startDate]);
  const grouped = data.reduce((acc: any, story: any) => {
    if (!acc[story.astrologerId]) acc[story.astrologerId] = [];
    acc[story.astrologerId].push(story);
    return acc;
  }, {});

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
      if (res.status === false) {
        toast.error(res.message);
        return;
      } else {
        toast.success(res.message);
      }
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  if (loading) return <p className="text-center py-10">Loading stories...</p>;

  return (
    <div className="grid grid-cols-12 gap-6 mt-5">
      {Object.keys(grouped).map((astroId) => {
        const astro = astrologers.find((a: any) => Number(a.id) === Number(astroId));
        const stories = grouped[astroId];
        return (
          <div
            key={astroId}
            className="col-span-12 md:col-span-6 xl:col-span-3 bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md transition"
            onClick={() => openModal(Number(astroId))}
          >
            <div className="flex items-center gap-3">
              <Image
                src={
                  astro?.profileImage && isValidImageUrl(astro?.profileImage)
                    ? `${process.env.NEXT_PUBLIC_BASEURL}${astro.profileImage}`
                    : "https://gyanitalk.com/build/assets/images/person.png"
                }
                width={50}
                height={50}
                className="rounded-full object-cover"
                alt={astro?.name || "Astrologer"}
              />
              <div>
                <h3 className="font-semibold text-slate-800">{astro?.name}</h3>
                <p className="text-sm text-slate-500">
                  {stories.length} Stories <br />
                  {dayjs(stories[0]?.created_at).format("DD MMM YYYY, hh:mm A")}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal */}
      {activeAstroId && currentStory && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={closeModal}>
          <div className="relative bg-white rounded-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Image
                  src={
                    astrologer?.profileImage && isValidImageUrl(astrologer?.profileImage)
                      ? `${process.env.NEXT_PUBLIC_BASEURL}${astrologer.profileImage}`
                      : "https://gyanitalk.com/build/assets/images/person.png"
                  }
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  alt={astrologer?.name || "Astrologer"}
                />
                <div>
                  <h3 className="font-semibold">{astrologer?.name}</h3>
                  <p className="text-xs text-slate-500">
                    {dayjs(currentStory.created_at).format("DD MMM YYYY, hh:mm A")}
                  </p>
                </div>
              </div>
              <button onClick={closeModal}>
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Story Media */}
            <div className="flex justify-center mb-4">
              {currentStory.mediaType === "image" && (
                <Image
                  src={
                    isValidImageUrl(currentStory.media)
                      ? `${process.env.NEXT_PUBLIC_BASEURL}${currentStory.media}`
                      : "https://gyanitalk.com/build/assets/images/person.png"
                  }
                  width={400}
                  height={300}
                  className="rounded-lg object-cover"
                  alt="Story Image"
                />
              )}
              {currentStory.mediaType === "video" && (
                <video
                  src={
                    isValidImageUrl(currentStory.media)
                      ? `${process.env.NEXT_PUBLIC_BASEURL}${currentStory.media}`
                      : ""
                  }
                  controls
                  width={400}
                  className="rounded-lg"
                />
              )}
              {currentStory.mediaType === "text" && (
                <p className="text-center text-slate-700">{currentStory.media}</p>
              )}
            </div>

            {/* Views + Actions */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">
                👁 {currentStory.StoryViewCount || 0} views
              </span>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(currentStory.id)}
                  className="hover:bg-red-100 text-red-600"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute inset-y-0 left-2 flex items-center">
              {currentIndex > 0 && (
                <button
                  onClick={() => setCurrentIndex((i) => i - 1)}
                  className="p-2 rounded-full bg-white/80 shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              {currentIndex < activeStories.length - 1 && (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="p-2 rounded-full bg-white/80 shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
