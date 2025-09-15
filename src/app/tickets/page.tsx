import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getTickets } from "@/components/tickets/fetch";
import TicketTable from "@/components/tickets/ticket-table";

export default async function TicketPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";

  // ✅ Directly fetch tickets on server
  const { tickets, totalPages, currentPage } = await getTickets({
    page,
    limit: 15,
    search,
  });

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Tickets" />

      {/* Search Form */}
      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or contactNo"
          className="min-w-[250px] rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />

        <button
          type="submit"
          className="bg-primary px-4 py-2 text-white rounded"
        >
          Search
        </button>
      </form>

      {/* Tickets Table */}
      <TicketTable
        tickets={tickets}      // ✅ plural prop
        totalPages={totalPages}
        currentPage={currentPage}
        page={page}
        search={search}
      />
    </div>
  );
}
