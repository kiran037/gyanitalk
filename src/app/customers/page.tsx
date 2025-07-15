import { CustomerTable } from "@/components/Tables/invoice-table";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";
import { Suspense } from "react";


export default async function TablesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);

  return (
    <div className="space-y-10">
      <Suspense fallback={<TopProductsSkeleton />}>
        <CustomerTable page={page} />
      </Suspense>
    </div>
  );
}
