import { AstrologerSkeleton } from "@/components/(astros)/astrologers/astrologer-skeleton";
import { AstrologerTable } from "@/components/(astros)/astrologers/astrologer-table";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Suspense } from "react";

export default async function AstrologersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    isVerified?: string;
  };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";
  const sortBy = searchParams?.sortBy || "";
  const sortOrder = searchParams?.sortOrder || "asc";
  const isVerified = searchParams?.isVerified;

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Astrologers" />

      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or contact"
          className="min-w-[250px]  rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />

        <select
          name="isVerified"
          defaultValue={isVerified}
          className="rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        >
          <option value="">All</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>


        <button type="submit" className="bg-primary px-4 py-2 text-white rounded">
          Search
        </button>
      </form>

      <Suspense fallback={<AstrologerSkeleton />}>
        <AstrologerTable
          page={page}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isVerifiedKey={isVerified}
        />
      </Suspense>
    </div>
  );
}