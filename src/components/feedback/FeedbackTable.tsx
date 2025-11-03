"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { GlassCard, glass } from "@/components/GlassUI/GlassKit";
import { cn } from "@/lib/utils";
import { getFeedbacks } from "@/app/feedback/fetch";
import { buildImg } from "@/components/stories/utils";

type Props = {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export default function FeedbackTable({ page = 1, limit = 15, search = "", startDate, endDate }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [totalPages, setTotal] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getFeedbacks({ page, limit, search, startDate, endDate });

        setRows(res.data || []);
        setUsers(res.users || []);
        setTotal(res.totalPages || 1);
        setCurrentPage(res.currentPage || page);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, limit, search, startDate, endDate]);

  if (loading)
    return (
      <GlassCard className="p-6">
        <div className="text-sm">Loading feedback…</div>
      </GlassCard>
    );

  return (
    <GlassCard className="overflow-hidden p-0">
      {/* Header */}
      <div className="px-6 pt-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Feedback</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          User feedback across apps.
        </p>
      </div>

      {/* Table Head */}
      <div className="mt-4 grid grid-cols-12 gap-4 border-y border-white/30 bg-white/60 px-6 py-3 text-[12px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
        <div className="col-span-2 sm:col-span-1">Profile</div>
        <div className="col-span-4 sm:col-span-3">User</div>
        <div className="col-span-2 sm:col-span-2">App</div>
        <div className="col-span-2 sm:col-span-2">Date</div>
        <div className="col-span-12 sm:col-span-4">Feedback</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/20">
        {rows.map((item, idx) => {
          const user = users.find((u) => u.id === item.userId);
          const profileSrc = buildImg(user?.profile);

          return (
            <div
              key={item.id}
              className={cn(
                "grid grid-cols-12 items-center gap-4 px-6 py-3",
                idx % 2 ? "bg-white/50 dark:bg-white/[0.03]" : ""
              )}
            >
              <div className="col-span-2 sm:col-span-1">
                <div className="relative h-10 w-10">
                  <Image src={profileSrc} alt="profile" fill className="rounded-full object-cover" />
                </div>
              </div>

              <div className="col-span-4 sm:col-span-3 text-sm text-slate-700 dark:text-slate-200">
                {user?.name || "-"} {user?.contactNo && `, ${user.contactNo}`}
              </div>

              <div className="col-span-2 sm:col-span-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/70 px-3 py-1 text-xs dark:border-white/10 dark:bg-white/[0.06]">
                  {item.appId === 1 ? "Customer App" : "Partner App"}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-2 text-sm">
                {item.created_at ? dayjs(item.created_at).format("DD MMM YYYY") : "-"}
              </div>

              <div className="col-span-12 sm:col-span-4 text-sm">
                <p className="line-clamp-3 whitespace-pre-wrap">{item.review || "-"}</p>
              </div>
            </div>
          );
        })}

        {!rows.length && (
          <div className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No feedback found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-end gap-2 px-6 py-6 text-sm">
          {Array.from({ length: totalPages }, (_, i) => {
            const p = i + 1;
            const href = `?page=${p}`;

            return (
              <a
                key={p}
                href={href}
                className={cn(
                  glass.btnSecondary,
                  p === currentPage ? glass.btnPrimary : glass.btnSecondary
                )}
              >
                {p}
              </a>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
