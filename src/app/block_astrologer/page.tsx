import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getBlockAstrologer } from "@/components/block_astrologer/fetch";
import { Suspense } from "react";
import { BlockAstrologerSkeleton } from "@/components/block_astrologer/block_astrologer-skeleton";
import BlockAstrologerTable from "@/components/block_astrologer/block_astrologer-table";

export default async function BlockAstrologerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  // await the searchParams first
  const params = await searchParams;

  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";

 // ✅ fetch data from server
  const { reviews, totalPages, currentPage } = await getBlockAstrologer({
    page,
    limit: 15,
    search,
  });

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Block Astrologer" />

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

      {/* Table */}
      <Suspense fallback={<BlockAstrologerSkeleton />}>
        <BlockAstrologerTable
          reviews={reviews}
          totalPages={totalPages}
          currentPage={currentPage}
          page={page}
          search={search}
        />
      </Suspense>
    </div>
  );
}
