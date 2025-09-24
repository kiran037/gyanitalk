import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getGifts } from "@/components/gifts_astrologer/fetch";
import { Suspense } from "react";
import { GiftAstrologerSkeleton } from "@/components/gifts_astrologer/gift_astrologer-skeleton";
import GiftAstrologerTable from "@/components/gifts_astrologer/gift_astrologer-table";

export default async function GiftPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
  };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";

 // ✅ fetch data from server
const { gifts, totalPages, currentPage } = await getGifts({
  page,
  limit: 15,
  search,
});

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Gifts" />

      {/* Search Form */}
      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name"
          className="min-w-[250px] rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />
        <button
          type="submit"
          className="bg-primary px-4 py-2 text-white rounded"
        >
          Search
        </button>
      </form>

      {/* Withdrawal Requests Table */}
      <Suspense fallback={<GiftAstrologerSkeleton />}>
        <GiftAstrologerTable
          gifts={gifts}
          totalPages={totalPages}
          currentPage={currentPage}
          page={page}
          search={search}
        />
      </Suspense>  
    </div>
  );
}
