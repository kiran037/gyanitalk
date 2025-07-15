import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { CustomerTable } from "@/components/Tables/invoice-table";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";
import { Suspense } from "react";


export default async function TablesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; startDate?: string; endDate?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;
  return (
    <div className="space-y-10">

      <Breadcrumb pageName="Customers" />


      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or contact"
          className="min-w-[250px]  rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />
        <input
          type="date"
          name="startDate"
          className="rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />
        <input
          type="date"
          name="endDate"
          className="rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />

        <button type="submit" className="bg-primary px-4 py-2 text-white rounded">
          Search
        </button>
      </form>

      <Suspense fallback={<TopProductsSkeleton />}>
        <CustomerTable page={page} search={search} startDate={startDate} endDate={endDate} />
      </Suspense>
    </div>
  );
}
