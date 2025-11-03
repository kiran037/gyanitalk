import moment from "moment";
import { getWalletTransactions } from "@/app/(transactions)/fetch";
import { GlassBadge } from "@/components/GlassUI/GlassBadge";
import { SearchBar } from "@/components/transactions/SearchBar";
import { Pagination } from "@/components/transactions/Pagination";
import { WalletCard } from "@/components/transactions/WalletCard";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import { cn } from "@/lib/utils";

export default async function WalletPage({
  searchParams,
}: {
  // Next 15: searchParams is async
  searchParams: Promise<{ page?: string; search?: string; startDate?: string; endDate?: string }>;
}) {
  const sp = await searchParams; // ✅ must await
  const page = parseInt(sp?.page || "1", 10);
  const search = sp?.search || "";
  const startDate = sp?.startDate;
  const endDate = sp?.endDate;

  const { records, totalPages, currentPage, summary } = await getWalletTransactions({
    page,
    limit: 15,
    search,
    startDate,
    endDate,
  });

  const totalCredits = Number(summary?.totalCredits || 0);
  const totalDebits = Number(summary?.totalDebits || 0);
  const netAmount = totalCredits - totalDebits;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet Transactions</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {records.length} transaction{records.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <GlassBadge variant="blue" className="px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </GlassBadge>
        </div>

        {/* Search Bar */}
        <SearchBar
          search={search}
          startDate={startDate}
          endDate={endDate}
          placeholder="Search by name, type or reference…"
        />

        {/* Summary Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total Credits</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">₹{totalCredits.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/90 text-white grid place-items-center font-bold">+</div>
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">Total Debits</p>
                <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">₹{totalDebits.toFixed(2)}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/90 text-white grid place-items-center font-bold">−</div>
            </div>
          </GlassCard>

          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    netAmount >= 0 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400"
                  )}
                >
                  Net Balance
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    netAmount >= 0 ? "text-blue-700 dark:text-blue-300" : "text-amber-700 dark:text-amber-300"
                  )}
                >
                  ₹{Math.abs(netAmount).toFixed(2)}
                </p>
              </div>
              <div
                className={cn(
                  "w-10 h-10 rounded-xl text-white grid place-items-center font-bold",
                  netAmount >= 0 ? "bg-blue-600/90" : "bg-amber-600/90"
                )}
              >
                {netAmount >= 0 ? "↑" : "↓"}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* List */}
        <div className="space-y-3">
          {records.length > 0 ? (
            records.map((item: any, idx: number) => (
              <WalletCard
                key={item.id ?? idx}
                item={item}
                formatDate={(d) => (d ? moment(d).utcOffset("+05:30").format("DD MMM YY") : "-")}
                formatTime={(d) => (d ? moment(d).utcOffset("+05:30").format("hh:mm A") : "")}
              />
            ))
          ) : (
            <WalletCard.Empty />
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            buildHref={(pageNum) => {
              const qs =
                `?page=${pageNum}` +
                (search ? `&search=${encodeURIComponent(search)}` : "") +
                (startDate ? `&startDate=${encodeURIComponent(startDate)}` : "") +
                (endDate ? `&endDate=${encodeURIComponent(endDate)}` : "");
              return qs;
            }}
          />
        )}
      </div>
    </div>
  );
}
