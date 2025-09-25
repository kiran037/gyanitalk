
import Image from "next/image";
import moment from "moment";
import { Suspense } from "react";
import { getWalletHistory } from "@/app/wallet_history/fetch";

/* ============================================================================
   Tiny Glass Kit
============================================================================ */
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

const glass = {
  surface:
    "relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] " +
    "dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
  input:
    "rounded-xl border border-white/30 dark:border-white/10 bg-white/85 dark:bg-white/[0.06] " +
    "px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/40",
  btn:
    "inline-flex items-center justify-center gap-2 rounded-xl h-9 px-3 text-sm font-medium transition active:scale-[0.98]",
  btnPrimary:
    "text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 " +
    "shadow-[0_8px_20px_rgba(59,130,246,0.25)]",
  btnNeutral:
    "text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/[0.06] border border-white/30 " +
    "dark:border-white/10 hover:bg-white",
  pill:
    "inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/10 " +
    "bg-white/70 dark:bg-white/[0.06] px-2.5 py-1 text-xs font-medium",
};

/* Helpers */
const BASE = process.env.NEXT_PUBLIC_BASEURL || "";
function isValidImageUrl(src?: string | null) {
  if (!src || typeof src !== "string") return false;
  return src.startsWith("/") || /^https?:\/\//i.test(src);
}
const buildImg = (src?: string | null) =>
  isValidImageUrl(src) ? (/^https?:\/\//i.test(src!) ? src! : `${BASE}${src}`) : "https://gyanitalk.com/build/assets/images/person.png";
const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtDateTime = (iso?: string | null) =>
  iso ? moment(iso).utcOffset("+05:30").format("DD MMM YYYY, hh:mm A") : "—";

/* Types */
type WalletHistory = {
  id: number;
  name: string;
  profile: string | null;
  contactNo: string;
  amount: number;
  created_at: string;
  paymentMode: string;
  paymentStatus: string;
};
type FetchResult = {
  wallethistory: WalletHistory[];
  totalPages: number;
  currentPage: number;
};

/* Skeleton */
function WalletHistorySkeleton() {
  return (
    <div className={cx(glass.surface, "p-6")}>
      <div className="h-6 w-36 rounded bg-slate-200/70 dark:bg-white/[0.06] animate-pulse mb-4" />
      <div className="grid gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-12 gap-4 items-center rounded-2xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-white/[0.05] px-4 py-3"
          >
            <div className="col-span-12 md:col-span-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
              <div className="h-4 w-40 rounded bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
            </div>
            <div className="col-span-6 md:col-span-2 h-4 rounded bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
            <div className="col-span-6 md:col-span-2 h-4 rounded bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
            <div className="col-span-6 md:col-span-2 h-6 rounded-full bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
            <div className="col-span-6 md:col-span-2 h-6 rounded-full bg-slate-200/70 dark:bg-white/[0.08] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Row Card */
function RowCard({ item }: { item: WalletHistory }) {
  const mode = item.paymentMode ? item.paymentMode.charAt(0).toUpperCase() + item.paymentMode.slice(1) : "—";
  const statusClass =
    item.paymentStatus === "success"
      ? "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40"
      : item.paymentStatus === "failed"
      ? "bg-rose-100/70 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/40"
      : "bg-yellow-100/70 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200/60 dark:border-yellow-800/40";

  return (
    <div
      className={cx(
        "grid grid-cols-12 gap-4 items-center rounded-2xl border border-white/30 dark:border-white/10",
        "bg-white/60 dark:bg-white/[0.05] px-4 py-3"
      )}
    >
      <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
        <div className="relative h-10 w-10">
          <Image
            fill
            alt={`${item.name} avatar`}
            src={buildImg(item.profile)}
            className="rounded-full object-cover"
            sizes="40px"
          />
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-900 dark:text-white">{item.name || "—"}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{item.contactNo}</div>
        </div>
      </div>

      <div className="col-span-6 md:col-span-2">
        <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</div>
        <div className="font-semibold text-slate-900 dark:text-white">{fmtINR(item.amount)}</div>
      </div>

      <div className="col-span-6 md:col-span-2">
        <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Date</div>
        <div className="text-slate-800 dark:text-slate-200">{fmtDateTime(item.created_at)}</div>
      </div>

      <div className="col-span-6 md:col-span-2">
        <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Method</div>
        <span className={glass.pill}>{mode}</span>
      </div>

      <div className="col-span-6 md:col-span-2 flex md:justify-end">
        <span className={cx(glass.pill, "border", statusClass)}>{item.paymentStatus || "—"}</span>
      </div>
    </div>
  );
}

/* Cards + Pagination */
function WalletHistoryCards({
  wallethistory,
  totalPages,
  currentPage,
  search,
}: {
  wallethistory: WalletHistory[];
  totalPages: number;
  currentPage: number;
  search: string;
}) {
  return (
    <div className={cx(glass.surface, "p-0 overflow-hidden")}>
      <div className="px-6 pt-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Wallet History</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          All wallet top-ups and transactions with status and metadata.
        </p>
      </div>

      <div className="px-6 pb-6 mt-4 space-y-3">
        {wallethistory.length ? (
          wallethistory.map((item) => <RowCard key={item.id} item={item} />)
        ) : (
          <div className="text-center text-slate-600 dark:text-slate-400 py-10">🚫 No Wallet History found</div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="px-6 pb-6 flex justify-end gap-2 flex-wrap text-sm">
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            const isCurrent = pageNum === currentPage;
            const isEdge = pageNum <= 3 || pageNum === totalPages;
            const nearCurrent = Math.abs(pageNum - currentPage) <= 1;

            if (!(isEdge || nearCurrent)) {
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
              <a key={i} href={href} className={cx(glass.btn, isCurrent ? glass.btnPrimary : glass.btnNeutral)}>
                {pageNum === totalPages ? "Last" : pageNum}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* PAGE (Server) */
export default async function WalletHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";

  const { wallethistory, totalPages, currentPage } = (await getWalletHistory({
    page,
    limit: 15,
    search,
  })) as FetchResult;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl p-6 md:p-8 space-y-6">
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet History</h1>

        <div className={cx(glass.surface, "p-5")}>
          <form method="get" className="flex flex-wrap items-center gap-3">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name or contact number"
              className={cx(glass.input, "min-w-[260px]")}
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

        <Suspense fallback={<WalletHistorySkeleton />}>
          <WalletHistoryCards
            wallethistory={wallethistory}
            totalPages={totalPages}
            currentPage={currentPage}
            search={search}
          />
        </Suspense>
      </div>
    </div>
  );
}
