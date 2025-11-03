"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import AddVideoModal from "./AddVideoModal";
import VideoCard from "./VideoCard";
import type { Video } from "../../types/videos";

export default function VideoListClient({
  initialData,
  onRefresh,
}: {
  initialData: Video[];
  onRefresh: () => Promise<void>;
}) {
  const [data, setData] = useState(initialData);
  const [open, setOpen] = useState(false);

  const afterChange = async () => {
    await onRefresh();
    setData((prev) => prev.map((x) => x)); // trigger refresh from parent via prop update
  };

  return (
    <>
      {/* Grid */}
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {data?.length ? (
          data.map((item) => <VideoCard key={item.id} item={item} onRefresh={afterChange} />)
        ) : (
          <GlassCard className="p-10 text-center">No videos found</GlassCard>
        )}
      </div>

      {/* Modal */}
      <AddVideoModal open={open} onClose={() => setOpen(false)} onSaved={afterChange} />
    </>
  );
}

VideoListClient.Toolbar = function Toolbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Ads Videos</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Manage cover, title, link, and visibility.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          + Add New Video
        </button>
      </div>
      <AddVideoModal open={open} onClose={() => setOpen(false)} onSaved={async () => {}} />
    </>
  );
};
