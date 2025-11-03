import moment from "moment";
import { revalidatePath } from "next/cache";
import { getManual, manualtransactionapprove } from "@/app/(transactions)/manual/fetch";
import { GlassBadge } from "@/components/GlassUI/GlassBadge";
import { SearchBar } from "@/components/transactions/SearchBar";
import { Pagination } from "@/components/transactions/Pagination";
import { ManualCard } from "@/components/transactions/ManualCard";

type PaymentManual = {
  id: number;
  userId: number;
  amount: number;
  paymentMode: string;
  paymentReference: string | null;
  paymentStatus: "success" | "pending" | "failed" | string;
  created_at: string | null;
  updated_at: string | null;
  user?: { name: string | null; contactNo: string | null };
};

// server action (page-owned)
async function updateStatus(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const status = (formData.get("status") as "success" | "failed") || "failed";
  if (!id || !["success", "failed"].includes(status)) return;
  await manualtransactionapprove({ id, status });
  revalidatePath("/(transactions)/manual");
}

export default async function ManualPage({
  searchParams,
}: {
  // 👇 Next 15: it's a Promise now
  searchParams: Promise<{ page?: string; search?: string; status?: string; startDate?: string; endDate?: string }>;
}) {
  const sp = await searchParams; // ✅ await before using
  const page = parseInt(sp?.page || "1", 10);
  const search = sp?.search || "";
  const status = sp?.status || "";
  const startDate = sp?.startDate;
  const endDate = sp?.endDate;

  const { payment_manual, totalPages, currentPage } = (await getManual({
    page,
    limit: 15,
    search,
    status,
    startDate,
    endDate,
  })) as {
    payment_manual: PaymentManual[];
    totalPages: number;
    currentPage: number;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manual Transactions</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {payment_manual.length} transaction{payment_manual.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <GlassBadge variant="blue" className="px-4 py-2 text-sm">
            Page {currentPage} of {totalPages}
          </GlassBadge>
        </div>

        {/* Search Bar with Status filter */}
        <SearchBar
          search={search}
          startDate={startDate}
          endDate={endDate}
          statusValue={status}
          statusOptions={[
            { label: "All Status", value: "" },
            { label: "Success", value: "success" },
            { label: "Pending", value: "pending" },
            { label: "Failed", value: "failed" },
          ]}
          placeholder="Search by name or contact..."
        />

        {/* List */}
        <div className="space-y-3">
          {payment_manual.length > 0 ? (
            payment_manual.map((item) => (
              <ManualCard
                key={item.id}
                item={item}
                onApproveAction={updateStatus}
                onRejectAction={updateStatus}
                formatDate={(d) => (d ? moment(d).utcOffset("+05:30").format("DD MMM YY") : "-")}
                formatTime={(d) => (d ? moment(d).utcOffset("+05:30").format("hh:mm A") : "")}
              />
            ))
          ) : (
            <ManualCard.Empty />
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
                (status ? `&status=${encodeURIComponent(status)}` : "") +
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
