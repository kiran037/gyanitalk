"use client";

import Image from "next/image";
import dayjs from "dayjs";
import { CheckSquare } from "lucide-react";
import { GlassCard, glass, cx } from "@/components/GlassUI/GlassKit";
import { bannerSrc, aspectForType, aspectClass } from "./utils";
import BannerStatusToggle from "./BannerStatusToggle";
import type { Banner, BannerType } from "../../types/banners";

export default function BannerCard({
  item,
  onEdit,
  onStatusChanged,
}: {
  item: Banner;
  onEdit: (b: Banner) => void;
  onStatusChanged?: () => void;
}) {
  const t: BannerType | undefined = item.bannerType;
  const { w, h } = aspectForType(t);
  const isActive = !!item.isActive;

  return (
    <GlassCard className="overflow-hidden">
      {/* Type-aware canvas */}
      <div
        className="relative w-full"
        style={{ aspectRatio: `${w} / ${h}` }}
      >
        <Image src={bannerSrc(item.bannerImage)} alt="Banner" fill className="object-cover" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <span className={cx("absolute top-3 left-3", isActive ? glass.chipOn : glass.chipOff)}>
          {isActive ? "Active" : "Inactive"}
        </span>
        {/* Type tag (top-right) */}
        {t?.name ? (
          <span className="absolute top-3 right-3 rounded-full bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-200 backdrop-blur">
            {t.name}
          </span>
        ) : null}
      </div>

      {/* Meta */}
      <div className="p-5 space-y-2 text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">From:</span>
          <span>{item.fromDate ? dayjs(item.fromDate).format("DD-MMM-YYYY") : "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">To:</span>
          <span>{item.toDate ? dayjs(item.toDate).format("DD-MMM-YYYY") : "-"}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 items-center gap-2 p-5 pt-4 border-t border-white/30">
        <button onClick={() => onEdit(item)} className={cx(glass.btnPrimary, "rounded-xl h-9 px-3 text-sm font-medium")}>
          <CheckSquare className="h-4 w-4" />
          Edit
        </button>

        <div className="col-span-1 flex items-center justify-end">
          <BannerStatusToggle id={item.id} status={isActive} onAfter={onStatusChanged} />
        </div>
      </div>
    </GlassCard>
  );
}
