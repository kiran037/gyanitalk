"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import BannerListClient from "@/components/banners/BannerListClient";
import type { Banner, BannerType } from "@/types/banners";
import { getBanners, getBannerTypes } from "./fetch";

export default function BannersPage() {
  const [initialData, setInitialData] = useState<Banner[]>([]);
  const [types, setTypes] = useState<BannerType[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const [b, t] = await Promise.all([getBanners(), getBannerTypes()]);
    setInitialData(b?.data || []);
    setTypes(t?.data || []);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative w-full p-6 md:p-8 space-y-8">
        <GlassCard className="p-5">
          <BannerListClient.Toolbar />
        </GlassCard>

        {loading ? (
          <GlassCard className="p-8 text-center">Loading banners…</GlassCard>
        ) : (
          <BannerListClient initialData={initialData} types={types} onRefresh={refresh} />
        )}
      </div>
    </div>
  );
}
