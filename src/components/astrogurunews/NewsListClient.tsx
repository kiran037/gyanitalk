"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import AddNewsModal from "./AddNewsModal";
import NewsCard from "./NewsCard";
import type { News } from "../../types/astrogurunews";

export default function NewsListClient({
  initialData,
  onRefresh,
}: {
  initialData: News[];
  onRefresh: () => Promise<void>;
}) {
  const [data, setData] = useState(initialData);
  const [addOpen, setAddOpen] = useState(false);

  const afterSave = async () => {
    await onRefresh();
    setData(initialData);
  };

  return (
    <>
      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {data?.length ? (
          data.map((item) => (
            <NewsCard key={item.id} item={item} onRefresh={afterSave} />
          ))
        ) : (
          <GlassCard hover={false} className="p-10 text-center">
            <p>No news found</p>
          </GlassCard>
        )}
      </div>

      {/* Modal */}
      <AddNewsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={afterSave}
      />
    </>
  );
}

NewsListClient.AddButton = function AddButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:opacity-90"
    >
      + Add News
    </button>
  );
};
