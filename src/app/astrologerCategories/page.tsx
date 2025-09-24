import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getAstrologerCategories } from "@/components/astrologerCategories/fetch";
import { Suspense } from "react";
import { AstrologerCategoriesSkeleton } from "@/components/astrologerCategories/astrologer_categories-skeleton";
import AstrologerCategoriesTable from "@/components/astrologerCategories/astrologer_categories-table";

export default async function AstrologerCategoriesPage({
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
const { astrologer_categories, totalPages, currentPage } = await getAstrologerCategories({
  page,
  limit: 15,
  search,
});

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Astrologer Category" />

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

      {/* Astrologer Categories Table */}
      <Suspense fallback={<AstrologerCategoriesSkeleton />}>
        <AstrologerCategoriesTable
          astrologer_categories={astrologer_categories}
          totalPages={totalPages}
          currentPage={currentPage}
          page={page}
          search={search}
        />
      </Suspense>  
    </div>
  );
}
