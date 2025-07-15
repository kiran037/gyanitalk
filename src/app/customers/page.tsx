import { CustomerTable } from "@/components/Tables/invoice-table";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";
import { Suspense } from "react";


export default async function TablesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";

  return (
    <div className="space-y-10">

      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or contact"
          className="w-full rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />
        <button type="submit" className="bg-primary px-4 py-2 text-white rounded">
          Search
        </button>
      </form>

      <Suspense fallback={<TopProductsSkeleton />}>
        <CustomerTable page={page} search={search} />
      </Suspense>
    </div>
  );
}
