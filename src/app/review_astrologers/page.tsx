
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import { Trash2 } from "lucide-react";

import { getReviews, deleteReview } from "@/app/review_astrologers/fetch";
import { isValidImageUrl } from "@/components/functions";
import { cn } from "@/lib/utils";

/* ============================================================================
   Tiny Glass Kit
============================================================================ */
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
  th:
    "text-[11px] sm:text-[12px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300",
  td: "align-middle text-sm text-slate-700 dark:text-slate-200",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white",
};

/* ============================================================================
   Types
============================================================================ */
type Review = {
  id: number;
  review: string;
  created_at: string;
  userName: string;
  userProfile: string | null;
  userContactNo: string;
  astrologerName: string;
  astrologerContactNo: string;
};

/* ============================================================================
   Skeleton
============================================================================ */
function ReviewSkeleton() {
  return (
    <div className={glass.surface + " p-6"}>
      <div className="h-6 w-40 mb-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
      <div className="overflow-hidden rounded-2xl border border-white/30">
        {/* header skeleton */}
        <div className="sticky top-0 z-10 grid grid-cols-12 gap-3 px-6 py-3 bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cx(
              "grid grid-cols-12 items-center gap-3 px-6 py-4",
              i % 2 ? "bg-white/60 dark:bg-white/[0.04]" : "bg-transparent"
            )}
          >
            <div className="col-span-2 sm:col-span-1 h-10 w-10 rounded-full bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-2 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-3 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-3 h-10 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-1 h-4 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
            <div className="col-span-1 h-9 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   Table (client)
============================================================================ */
function ReviewTable({
  page = 1,
  limit = 15,
  search = "",
}: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const [rows, setRows] = useState<Review[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(false);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const buildImg = (val: string | null) =>
    isValidImageUrl(val || "") ? (/^https?:\/\//i.test(val!) ? val! : `${BASE}${val}`) : FALLBACK;

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getReviews({ page, limit, search });
      setRows(res.reviews || []);
      setTotalPages(res.totalPages || 1);
      setCurrentPage(res.currentPage || page);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  if (loading) return <ReviewSkeleton />;

  return (
    <div className={glass.surface + " p-0 overflow-hidden"}>
      <div className="px-6 pt-6">
        <h2 className="text-xl font-bold  dark:text-white">Reviews</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          User reviews for astrologers with timestamps and quick actions.
        </p>
      </div>

      {/* Head */}
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="sticky top-0 z-10 grid grid-cols-12 gap-3 px-6 py-3 border-y border-white/30 bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl">
            {/* Keep separate columns */}
            <div className={cx("col-span-2 sm:col-span-1", glass.th)}>User Profile</div>
            <div className={cx("col-span-3 sm:col-span-3", glass.th)}>User Name</div>
            <div className={cx("col-span-3 sm:col-span-3", glass.th)}>Astrologer</div>
            <div className={cx("col-span-3 sm:col-span-3", glass.th)}>Review</div>
            <div className={cx("col-span-1 sm:col-span-1", glass.th, "text-right")}>Date</div>
            <div className={cx("col-span-0 sm:col-span-1", glass.th, "text-right")}>Action</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/30">
            {rows.map((item, idx) => {
              const profileSrc = buildImg(item.userProfile);
              return (
                <div
                  key={item.id}
                  className={cx(
                    "grid grid-cols-12 items-center gap-3 px-6 py-3",
                    "hover:bg-white/60 dark:hover:bg-white/[0.05] transition-colors",
                    idx % 2 ? "bg-white/50 dark:bg-white/[0.03]" : "bg-transparent"
                  )}
                >
                  {/* USERPROFILE */}
                  <div className="col-span-2 sm:col-span-1">
                    <div className="relative h-10 w-10">
                      <Image
                        src={profileSrc}
                        alt={`${item.userName || "User"} profile`}
                        fill
                        className="rounded-full object-cover ring-1 ring-white/30"
                      />
                    </div>
                  </div>

                  {/* USERNAME */}
                  <div className={cx("col-span-3 sm:col-span-3", glass.td)}>
                    <div className="truncate font-medium">{item.userName || "User"}</div>
                    <div className="text-xs text-slate-500">{item.userContactNo}</div>
                  </div>

                  {/* ASTROLOGER */}
                  <div className={cx("col-span-3 sm:col-span-3", glass.td)}>
                    <div className="truncate">{item.astrologerName}</div>
                    <div className="text-xs text-slate-500">{item.astrologerContactNo}</div>
                  </div>

                  {/* REVIEW */}
                  <div className={cx("col-span-3 sm:col-span-3", glass.td)}>
                    <p className="line-clamp-3 whitespace-pre-wrap">{item.review || "-"}</p>
                  </div>

                  {/* DATE */}
                  <div className={cx("col-span-1 sm:col-span-1", glass.td, "text-right")}>
                    {item.created_at ? dayjs(item.created_at).format("DD MMM YYYY") : "-"}
                  </div>

                  {/* ACTION (icon only) */}
                  <div className={cx("hidden sm:flex col-span-0 sm:col-span-1 justify-end")}>
                    <button
                      aria-label="Delete review"
                      title="Delete review"
                      onClick={() => {
                        setSelectedReviewId(item.id);
                        setShowModal(true);
                      }}
                      className={cn(
                        "h-9 w-9 rounded-xl border border-white/30 dark:border-white/10",
                        "bg-white/80 dark:bg-white/[0.06] hover:bg-white text-red-600 hover:text-red-700",
                        "flex items-center justify-center transition"
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {!rows.length && (
              <div className="px-6 py-10 text-center text-sm text-slate-600 dark:text-slate-400">
                🚫 No reviews found
              </div>
            )}
          </div>
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
                className={cn(glass.btn, isCurrent ? glass.btnPrimary : glass.btnNeutral)}
              >
                {isLast ? "Last" : pageNum}
              </a>
            );
          })}
        </div>
      )}

      {/* Delete Modal (glass, centered, blurred bg) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className={glass.surface + " max-w-md w-full p-6"}>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Delete Review?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className={cn(glass.btn, glass.btnNeutral)}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedReviewId) return;
                  const result = await deleteReview(selectedReviewId);
                  if (result?.success) {
                    setShowModal(false);
                    setSelectedReviewId(null);
                    fetchReviews();
                  }
                }}
                className={cn(glass.btn, glass.btnPrimary)}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   Page (client)
============================================================================ */
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewPage />
    </Suspense>
  );
}
function ReviewPage() {
  const sp = useSearchParams();
  const page = useMemo(() => parseInt(sp.get("page") || "1", 10), [sp]);
  const search = useMemo(() => sp.get("search") || "", [sp]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[14rem] w-[40rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reviews</h1>

        {/* Filters */}
        <div className={glass.surface + " p-5"}>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by user or astrologer"
              className={cx(glass.input, "min-w-[240px]")}
            />
            <button type="submit" className={cn(glass.btn, glass.btnPrimary)}>
              Search
            </button>
            {search && (
              <a href="?page=1" className={cn(glass.btn, glass.btnNeutral)}>
                Clear
              </a>
            )}
          </form>
        </div>

        <Suspense fallback={<ReviewSkeleton />}>
          <ReviewTable page={page} search={search} />
        </Suspense>
      </div>
    </div>
  );
}
