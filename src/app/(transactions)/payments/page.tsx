import moment from "moment";
import { getPaymentTransactions } from "../fetch";
import { GlassBadge } from "@/components/GlassUI/GlassBadge";
import { SearchBar } from "@/components/transactions/SearchBar";
import { Pagination } from "@/components/transactions/Pagination";
import { PaymentCard } from "@/components/transactions/PaymentCard";
import { isValidImageUrl } from "@/components/functions";

export default async function PaymentsPage({
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

  const { records, totalPages, currentPage } = await getPaymentTransactions({
    page,
    limit: 15,
    search,
    startDate,
    endDate,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Transactions</h1>
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
          placeholder="Search by name or contact..."
        />

        {/* List */}
        <div className="space-y-3">
          {records.length > 0 ? (
            records.map((item: any, idx: number) => (
              <PaymentCard
                key={item.id ?? idx}
                item={item}
                formatDate={(d) => (d ? moment(d).utcOffset("+05:30").format("DD MMM YY") : "-")}
                formatTime={(d) => (d ? moment(d).utcOffset("+05:30").format("hh:mm A") : "")}
                isValidImageUrl={isValidImageUrl}
              />
            ))
          ) : (
            <PaymentCard.Empty />
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
