import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getWithdrawalRequests } from "@/components/withdrawal_requests/fetch";
import { Suspense } from "react";
import { WithdrawalRequestsSkeleton } from "@/components/withdrawal_requests/withdrawal_requests-skeleton";
import WithdrawalRequestsTable from "@/components/withdrawal_requests/withdrawal_requests-table";

export default async function WithdrawalRequestsPage({
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
  const { withdrawlRequests, totalPages, currentPage } = await getWithdrawalRequests({
    page,
    limit: 15,
    search,
    status,
    startDate,
    endDate,
  });

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Withdrawal Requests" />

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
                <option value="Pending">Pending </option>
                <option value="Released">Released</option>
                <option value="Reject">Reject</option>
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

      {/* Withdrawal Requests Table */}
      <Suspense fallback={<WithdrawalRequestsSkeleton />}>
        <WithdrawalRequestsTable
          withdrawlRequests={withdrawlRequests}  // ✅ plural prop name
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
