import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { OrderSkeleton } from "@/components/orders/order-skeleton";
import { Suspense } from "react";
import { getOrders } from "@/components/orders/fetch";
import { OrderTable } from "@/components/orders/order-table";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";

    // ✅ Directly fetch orders here
  const { orders, totalPages, currentPage } = await getOrders({
    page,
    limit: 15,
    search,
  });

  return (
    <div className="space-y-10">

      <Breadcrumb pageName="Orders" />
      
       {/* Search Form */}
      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name"
          className="min-w-[250px]  rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />

        <button type="submit" className="bg-primary px-4 py-2 text-white rounded">
          Search
        </button>
      </form>

      {/* Orders Table */}
      <Suspense fallback={<OrderSkeleton />}>
        <OrderTable
          orders={orders}
          totalPages={totalPages}
          currentPage={currentPage}
          page={page}
          search={search}
        />
      </Suspense>
    </div>
  );
}
