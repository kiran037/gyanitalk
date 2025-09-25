
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";
import { Share, CalendarDays, Banknote } from "lucide-react";
import { createPortal } from "react-dom";

import { useToast } from "@/components/Toast/ToastProvider";
import { isValidImageUrl } from "@/components/functions";
import {
  getWithdrawalRequests,
  releaseWithdrawal,
  rejectWithdrawal,
} from "@/app/withdrawal_requests/fetch";

/* =============================================================================
   Tiny glass kit
============================================================================= */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_28px_rgba(0,0,0,0.08)] " +
    "dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
  header:
    "flex items-center justify-between px-6 py-5 border-b border-white/20 " +
    "bg-gradient-to-r from-white/60 to-white/40 dark:from-white/[0.06] dark:to-white/[0.04]",
  input:
    "rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
    "px-4 py-2 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-4 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 " +
    "shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
  btnDanger:
    "text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 " +
    "shadow-[0_8px_20px_rgba(239,68,68,0.25)]",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 dark:border-white/10 hover:bg-white/90",
  pill:
    "inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] text-[11px] px-2.5 py-1 font-semibold",
};

/* =============================================================================
   Types
============================================================================= */
type WithdrawRequests = {
  id: number;
  profileImage?: string;
  name: string;
  contactNo: string;
  withdrawAmount: number;
  method_id?: number;
  method_name?: string;
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  status: "Pending" | "Released" | "Reject" | string;
  created_at: string | null;
  updated_at: string | null;
};

type FetchResult = {
  withdrawlRequests: WithdrawRequests[];
  totalPages: number;
  currentPage: number;
};

/* =============================================================================
   Portal Glass Modal (always on top)
============================================================================= */
function GlassModal({
  title,
  description,
  confirmLabel,
  confirmTone,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmTone: "primary" | "danger";
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cx(glass.surface, "relative z-10 w-full max-w-md")}>
        <div className="px-6 py-5 text-center space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-slate-600 dark:text-slate-400">{description}</p>
          <div className="flex justify-center gap-3 pt-4">
            <button onClick={onClose} className={cx(glass.btn, glass.btnNeutral)}>Cancel</button>
            <button
              onClick={async () => { await onConfirm(); onClose(); }}
              className={cx(glass.btn, confirmTone === "danger" ? glass.btnDanger : glass.btnPrimary)}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* =============================================================================
   Card (one request)
============================================================================= */
function RequestCard({
  item,
  onRelease,
  onReject,
}: {
  item: WithdrawRequests;
  onRelease: (id: number) => void;
  onReject: (id: number) => void;
}) {
  const profileSrc =
    item?.profileImage && isValidImageUrl(item.profileImage)
      ? `${process.env.NEXT_PUBLIC_BASEURL}${item.profileImage}`
      : "https://gyanitalk.com/build/assets/images/person.png";

  const statusClass =
    item.status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : item.status === "Released"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div
      className={cx(
        glass.surface,
        "p-4 sm:p-5 transition hover:scale-[1.005] hover:shadow-[0_16px_44px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_16px_44px_rgba(0,0,0,0.45)]"
      )}
    >
      {/* Top row */}
      <div className="flex items-start gap-4">
        <div className="relative h-12 w-12 shrink-0">
          <Image src={profileSrc} alt={item.name} fill className="rounded-full object-cover ring-1 ring-white/30" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</h3>
            <span className={cx(glass.pill, statusClass)}>{item.status}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{item.contactNo}</p>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-slate-500" />
          <div className="text-sm">
            <div className="text-slate-500 dark:text-slate-400 leading-none">Amount</div>
            <div className="font-semibold text-slate-900 dark:text-white">₹{item.withdrawAmount}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          <div className="text-sm">
            <div className="text-slate-500 dark:text-slate-400 leading-none">Requested</div>
            <div className="font-medium text-slate-900 dark:text-white">
              {item.created_at ? moment(item.created_at).utcOffset("+05:30").format("DD MMM YYYY, hh:mm A") : "-"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={glass.pill}>{item.method_name || "—"}</span>
        </div>

        <div className="text-sm text-slate-700 dark:text-slate-300">
          {item.method_id === 2 ? (
            <>UPI: <span className="font-medium">{item.upiId || "-"}</span></>
          ) : item.method_id === 3 ? (
            <>—</>
          ) : (
            <>
              A/C NO: <span className="font-medium">{item.accountNumber || "-"}</span>, IFSC:{" "}
              <span className="font-medium">{item.ifscCode || "-"}</span>, Holder:{" "}
              <span className="font-medium">{item.accountHolderName || "-"}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-[11px] text-slate-500 dark:text-slate-400">
          ID: <span className="font-mono">{item.id}</span>
        </div>

        {item.status === "Pending" ? (
          <div className="flex items-center gap-2">
            <button onClick={() => onRelease(item.id)} className={cx(glass.btn, glass.btnPrimary)}>
              <Share className="h-4 w-4" />
              Release
            </button>
            <button onClick={() => onReject(item.id)} className={cx(glass.btn, glass.btnDanger)}>
              <Share className="h-4 w-4" />
              Reject
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* =============================================================================
   Page
============================================================================= */
export default function WithdrawalRequestsPage() {
  const toast = useToast();
  const router = useRouter();
  const sp = useSearchParams();

  // URL params
  const page = useMemo(() => parseInt(sp.get("page") || "1", 10), [sp]);
  const search = useMemo(() => sp.get("search") || "", [sp]);
  const status = useMemo(() => sp.get("status") || "", [sp]);
  const startDate = useMemo(() => sp.get("startDate") || "", [sp]);
  const endDate = useMemo(() => sp.get("endDate") || "", [sp]);

  // State
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<WithdrawRequests[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  // Modals
  const [releaseId, setReleaseId] = useState<number | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);

  // Fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res: FetchResult = await getWithdrawalRequests({
          page,
          limit: 15,
          search,
          status,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        if (!mounted) return;
        setRows(res.withdrawlRequests || []);
        setTotalPages(res.totalPages || 1);
        setCurrentPage(res.currentPage || page);
      } catch (e) {
        console.error(e);
        toast("error", "Error", "Failed to load withdrawal requests");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [page, search, status, startDate, endDate, toast]);

  // Filters submit
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const s = String(fd.get("search") || "").trim();
    const st = String(fd.get("status") || "").trim();
    const sd = String(fd.get("startDate") || "").trim();
    const ed = String(fd.get("endDate") || "").trim();

    if (s) params.set("search", s);
    if (st) params.set("status", st);
    if (sd) params.set("startDate", sd);
    if (ed) params.set("endDate", ed);
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    router.push("?page=1");
  }

  function pageHref(targetPage: number) {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(targetPage));
    return `?${params.toString()}`;
  }

  // Actions (optimistic)
  async function doRelease(id: number) {
    const res = await releaseWithdrawal(id);
    if (res.success) {
      toast("success", "Released", `Request #${id} released`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Released" } : r)));
    } else {
      toast("error", "Error", res.error || "Failed to release");
    }
  }
  async function doReject(id: number) {
    const res = await rejectWithdrawal(id);
    if (res.success) {
      toast("success", "Rejected", `Request #${id} rejected`);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Reject" } : r)));
    } else {
      toast("error", "Error", res.error || "Failed to reject");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className={cx(glass.surface, "px-6 py-6")}>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Withdrawal Requests</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cleaner, card-based layout for dense financial details.
          </p>
        </div>

        {/* Filters */}
        <div className={cx(glass.surface, "px-6 py-5")}>
          <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name or contact no."
              className={cx(glass.input, "min-w-[240px]")}
            />
            <select name="status" defaultValue={status} className={glass.input}>
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Released">Released</option>
              <option value="Reject">Reject</option>
            </select>
            <input type="date" name="startDate" defaultValue={startDate} className={glass.input} />
            <input type="date" name="endDate" defaultValue={endDate} className={glass.input} />
            <button type="submit" className={cx(glass.btn, glass.btnPrimary)}>Search</button>
            {(search || status || startDate || endDate) && (
              <button type="button" onClick={clearFilters} className={cx(glass.btn, glass.btnNeutral)}>
                Clear
              </button>
            )}
          </form>
        </div>

        {/* List or Skeleton */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cx(glass.surface, "h-28 animate-pulse bg-white/60 dark:bg-white/[0.06]")} />
            ))}
          </div>
        ) : rows.length ? (
          <div className="grid gap-4">
            {rows.map((item) => (
              <RequestCard
                key={item.id}
                item={item}
                onRelease={() => setReleaseId(item.id)}
                onReject={() => setRejectId(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className={cx(glass.surface, "p-10 text-center text-slate-600 dark:text-slate-400")}>
            No withdrawal requests found
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={cx(glass.surface, "px-6 py-4 flex justify-end gap-2 flex-wrap")}>
            {Array.from({ length: totalPages }, (_, i) => {
              const num = i + 1;
              const isCurrent = num === currentPage;
              const shouldShow =
                num <= 3 || num === totalPages || num === currentPage || num === currentPage - 1 || num === currentPage + 1;

              if (!shouldShow) {
                if (num === currentPage - 2 || num === currentPage + 2) {
                  return (
                    <span key={num} className="px-2 text-slate-500">
                      …
                    </span>
                  );
                }
                return null;
              }

              return (
                <a
                  key={num}
                  href={pageHref(num)}
                  className={cx(glass.btn, isCurrent ? glass.btnPrimary : glass.btnNeutral)}
                >
                  {num === totalPages ? "Last" : num}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {releaseId && (
        <GlassModal
          title="Confirm Release"
          description={`Do you really want to release request #${releaseId}?`}
          confirmLabel="Release"
          confirmTone="primary"
          onConfirm={() => doRelease(releaseId)}
          onClose={() => setReleaseId(null)}
        />
      )}
      {rejectId && (
        <GlassModal
          title="Confirm Reject"
          description={`Do you really want to reject request #${rejectId}?`}
          confirmLabel="Reject"
          confirmTone="danger"
          onConfirm={() => doReject(rejectId)}
          onClose={() => setRejectId(null)}
        />
      )}
    </div>
  );
}
