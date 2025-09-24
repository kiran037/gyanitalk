import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getReviews } from "@/components/review_astrologers/fetch";
import { Suspense } from "react";
import { ReviewAstrologerSkeleton } from "@/components/review_astrologers/review_astrologer-skeleton";
import ReviewAstrologerTable from "@/components/review_astrologers/review_astrologer-table";

export default async function ReviewPage({
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
const { reviews, totalPages, currentPage } = await getReviews({
  page,
  limit: 15,
  search,
});

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Reviews" />

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
      <Suspense fallback={<ReviewAstrologerSkeleton />}>
        <ReviewAstrologerTable
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
