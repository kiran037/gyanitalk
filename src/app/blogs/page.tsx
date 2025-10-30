"use client";

import { use } from "react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import BlogListClient from "@/components/blogs/BlogListClient";
import { GlassCard, glass, cx } from "@/components/GlassUI/GlassKit";
import type { Blog } from "@/types/blogs";
import { getBlogsData } from "./fetch";

export default function BlogsPage({
  searchParams,
}: {
  // Next.js 15: unwrap with React.use()
  searchParams?: Promise<{ page?: string; search?: string }>;
}) {
  const params = searchParams ? use(searchParams) : undefined;
  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";

  const [initialData, setInitialData] = useState<Blog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const refresh = async () => {
    const { data, totalPages } = await getBlogsData({ page, limit: 15, search });
    setInitialData(data || []);
    setTotalPages(totalPages || 1);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingInitial(true);
        const { data, totalPages } = await getBlogsData({ page, limit: 15, search });
        if (!mounted) return;
        setInitialData(data || []);
        setTotalPages(totalPages || 1);
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, search]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative w-full p-6 md:p-8 space-y-8">
        {/* Search */}
        <GlassCard hover={false} className="p-5">
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search blogs…"
              className={cx(glass.input, "min-w-[240px]")}
            />
            <button type="submit" className={glass.btnPrimary}>
              Search
            </button>
            {search ? (
              <Link href="?page=1" className={glass.btnSecondary}>
                Clear
              </Link>
            ) : null}
          </form>
        </GlassCard>

        {/* Content */}
        {loadingInitial ? (
          <GlassCard hover={false} className="p-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading blogs…</p>
          </GlassCard>
        ) : (
          <BlogListClient
            initialData={initialData}
            page={page}
            totalPages={totalPages}
            search={search}
            onRefresh={refresh}
          />
        )}
      </div>
    </div>
  );
}
