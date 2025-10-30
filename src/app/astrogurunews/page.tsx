// /src/app/astrogurunews/page.tsx
"use client";

import { useEffect, useState } from "react";
import { GlassCard, glass, cx } from "@/components/GlassUI/GlassKit";
import NewsListClient from "@/components/astrogurunews/NewsListClient";
import AddNewsModal from "@/components/astrogurunews/AddNewsModal";
import { getAstroguruNews } from "./fetch";
import type { News } from "@/types/astrogurunews";

export default function AstroGuruNewsPage() {
  const [initialData, setInitialData] = useState<News[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // local modal state (so we don't depend on NewsListClient for opening)
  const [isAddOpen, setAddOpen] = useState(false);

  async function refresh() {
    const res = await getAstroguruNews();
    setInitialData(res.data || []);
  }

  useEffect(() => {
    refresh().finally(() => setLoadingInitial(false));
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative w-full p-6 md:p-8 space-y-8">
        {/* Toolbar */}
        <GlassCard hover={false} className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">AstroGuru News</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">Manage latest news articles</p>
            </div>

            {/* Local Add button that toggles the modal */}
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className={cx(
                glass.btnPrimary,
                "h-10 px-4"
              )}
            >
              + Add News
            </button>
          </div>
        </GlassCard>

        {loadingInitial ? (
          <GlassCard hover={false} className="p-8 text-center">
            <p>Loading news…</p>
          </GlassCard>
        ) : (
          <NewsListClient initialData={initialData} onRefresh={refresh} />
        )}
      </div>

      {/* Modal mounted at page root so it always exists */}
      <AddNewsModal
        open={isAddOpen}
        onClose={() => setAddOpen(false)}
        onSaved={async () => {
          await refresh();
          setAddOpen(false);
        }}
      />
    </div>
  );
}
