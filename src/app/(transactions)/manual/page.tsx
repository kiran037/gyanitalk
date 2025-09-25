import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getManual } from "@/components/manual/fetch";
import { Suspense } from "react";
import { ManualSkeleton } from "@/components/manual/manual-skeleton";
import ManualTable from "@/components/manual/manual-table";

export default async function ManualPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) {
  // 👇 await karo
  const params = await searchParams;

  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";
  const status = params?.status || "";
  const startDate = params?.startDate;
  const endDate = params?.endDate;

 // ✅ fetch data from server
  const { payment_manual, totalPages, currentPage } = await getManual({
    page,
    limit: 15,
    search,
    status,
    startDate,
    endDate,
  });

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Manual Transaction" />

      {/* Search Form */}
      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or contactNo"
          className="min-w-[250px] rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />
        <div className="w-56 relative text-slate-500 inline-block">
            <select className ="form-control w-56 box pr-10 px-4 py-2" name="status"  defaultValue={status} >
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
            </select>
        </div>
        <input
          type="date"
          name="startDate"
          defaultValue={startDate}
          className="rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />
        <input
          type="date"
          name="endDate"
          defaultValue={endDate}
          className="rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />
        <button
          type="submit"
          className="bg-primary px-4 py-2 text-white rounded"
        >
          Search
        </button>
      </form>

      {/* Astrologer Categories Table */}
      <Suspense fallback={<ManualSkeleton />}>
        <ManualTable
          payment_manual={payment_manual}
          totalPages={totalPages}
          currentPage={currentPage}
          page={page}
          search={search}
          status={status}
          startDate={startDate}
          endDate={endDate}
        />
      </Suspense>  
    </div>
  );
}
