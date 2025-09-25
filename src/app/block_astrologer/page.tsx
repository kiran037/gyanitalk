
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";

import { getBlockAstrologer } from "./fetch";
import { isValidImageUrl } from "@/components/functions";
import { cn } from "@/lib/utils";

/* =================================================================================
   Tiny Glass Kit
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
  pill:
    "inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] text-xs px-3 py-1",
  th:
    "text-left text-[12px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300",
  td: "align-middle text-sm text-slate-700 dark:text-slate-200",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
};

/* =================================================================================
   Skeleton
================================================================================= */
function BlockedSkeleton() {
  return (
    <div className={glass.surface + " p-6"}>
      <div className="h-6 w-40 mb-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
      <div className="overflow-hidden rounded-2xl border border-white/30">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cx(
              "grid grid-cols-12 items-center gap-4 px-4 py-3",
              i % 2 ? "bg-white/60 dark:bg-white/[0.04]" : "bg-transparent"
            )}
          >
            <div className="col-span-2 sm:col-span-1 h-10 rounded-full bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-3 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-3 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-2 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-2 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================================================================================
   Utilities
================================================================================= */
const buildImg = (val?: string) =>
  isValidImageUrl(val || "") ? (/^https?:\/\//i.test(val!) ? val! : `${BASE}${val}`) : FALLBACK;

/* =================================================================================
   Table (client-fetched)
================================================================================= */
function BlockedTable({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getBlockAstrologer({ page, limit, search });
        if (!mounted) return;
        setRows(res.reviews || []);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || page);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, limit, search]);

  if (loading) return <BlockedSkeleton />;
  return (
    <div className={glass.surface + " p-0 overflow-hidden"}>
      <div className="px-6 pt-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Blocked Astrologers</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          List of astrologers blocked by users with reasons and timestamps.
        </p>
      </div>

      {/* Head */}
      <div className="mt-4">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-y border-white/30 bg-white/60 dark:bg-white/[0.06]">
          <div className={cx("col-span-2 sm:col-span-1", glass.th)}>User</div>
          <div className={cx("col-span-3 sm:col-span-3", glass.th)}>Astrologer</div>

          <div className={cx("col-span-2 sm:col-span-2", glass.th)}>Blocked Date</div>
          <div className={cx("col-span-2 sm:col-span-3", glass.th)}>Contact</div>
          <div className={cx("col-span-3 sm:col-span-3", glass.th)}>Reason</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/30">
          {rows.map((item: any, idx: number) => {
            const profileSrc = buildImg(item.profile);
            return (
              <div
                key={item.id}
                className={cx(
                  "grid grid-cols-12 items-center gap-4 px-6 py-3",
                  idx % 2 ? "bg-white/50 dark:bg-white/[0.03]" : "bg-transparent"
                )}
              >
                {/* User */}
                <div className="col-span-2 sm:col-span-1">
                  <div className="relative h-10 w-10">
                    <Image
                      src={profileSrc}
                      alt={`${item.userName || "User"} profile`}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* Astrologer */}
                <div className={cx("col-span-3 sm:col-span-3", glass.td)}>
                  <div className="font-medium truncate">{item.astrologerName || "-"}</div>
                </div>

                {/* Date */}
                <div className={cx("col-span-2 sm:col-span-2", glass.td)}>
                  {item.created_at ? dayjs(item.created_at).format("DD MMM YYYY, hh:mm A") : "-"}
                </div>

                {/* Contact */}
                <div className={cx("col-span-2 sm:col-span-3", glass.td)}>
                  <p className="truncate text-sm">{item.contactNo || "-"}</p>
                </div>

                {/* Reason */}
                <div className={cx("col-span-3 sm:col-span-3", glass.td)}>
                  <span className={glass.pill}>{item.reason || "-"}</span>
                </div>
              </div>
            );
          })}

          {!rows.length && (
            <div className="px-6 py-10 text-center text-sm text-slate-600 dark:text-slate-400">
              No blocked astrologers found
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 pt-4 pb-6 flex justify-end gap-2 flex-wrap text-sm">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            const isLast = pageNum === totalPages;
            const isCurrent = pageNum === currentPage;
            const shouldShow =
              pageNum <= 3 ||
              pageNum === totalPages ||
              pageNum === currentPage ||
              pageNum === currentPage - 1 ||
              pageNum === currentPage + 1;

            if (!shouldShow) {
              if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return (
                  <span key={i} className="px-2 text-slate-500">
                    …
                  </span>
                );
              }
              return null;
            }

            const href = `?page=${pageNum}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

            return (
              <a
                key={i}
                href={href}
                className={cn(
                  glass.btn,
                  isCurrent
                    ? glass.btnPrimary
                    : glass.btnNeutral
                )}
              >
                {isLast ? "Last" : pageNum}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =================================================================================
   Page (client)
================================================================================= */
export default function Page() {
  const sp = useSearchParams();
  const page = useMemo(() => parseInt(sp.get("page") || "1", 10), [sp]);
  const search = useMemo(() => sp.get("search") || "", [sp]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Blocked Astrologers</h1>
        </div>

        {/* Filters */}
        <div className={glass.surface + " p-5"}>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name/contact"
              className={cx(glass.input, "min-w-[240px]")}
            />
            <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>
              Search
            </button>
            {search && (
              <a href="?page=1" className={cx(glass.btn, glass.btnNeutral)}>
                Clear
              </a>
            )}
          </form>
        </div>

        <Suspense fallback={<BlockedSkeleton />}>
          <BlockedTable page={page} search={search} />
        </Suspense>
      </div>
    </div>
  );
}
