"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import AddBannerModal from "./AddBannerModal";
import BannerCard from "./BannerCard";
import type { Banner, BannerType } from "../../types/banners";

export default function BannerListClient({
  initialData,
  types,
  onRefresh,
}: {
  initialData: Banner[];
  types: BannerType[];
  onRefresh: () => Promise<void>;
}) {
  const [data, setData] = useState<Banner[]>(initialData);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);

  const afterChange = async () => {
    await onRefresh();
    setEditing(null);
    // parent will pass new initialData on refresh route; keep local as-is
  };

  return (
    <>
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
        {data?.length ? (
          data.map((item) => (
            <BannerCard
              key={item.id}
              item={item}
              onEdit={(b) => {
                setEditing(b);
                setOpen(true);
              }}
              onStatusChanged={afterChange}
            />
          ))
        ) : (
          <GlassCard className="p-10 text-center">No banners found</GlassCard>
        )}
      </div>

      <AddBannerModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        onSaved={afterChange}
        types={types}
        editing={editing}
      />
    </>
  );
}

BannerListClient.Toolbar = function Toolbar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Banners</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Manage date range, type, image, and status.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          + Add Banner
        </button>
      </div>

      <AddBannerModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={async () => {}}
        types={[]}
        editing={null}
      />
    </>
  );
};
