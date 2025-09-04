import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { StoriesTable } from "@/components/stories/stories-table";
import { StoriesSkeleton } from "@/components/stories/stories-skeleton";
import { Suspense } from "react";


export default async function StoriesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; startDate?: string; };
}) {
  const page = Number(searchParams?.page || "1");
  const search = searchParams?.search || "";
  const startDate = searchParams?.startDate;
  return (
    <div className="space-y-10">

      <Breadcrumb pageName="Stories" />


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

        <button type="submit" className="bg-primary px-4 py-2 text-white rounded">
          Search
        </button>
      </form>

      <Suspense fallback={<StoriesSkeleton />}>
        <StoriesTable page={page} search={search} startDate={startDate} />
      </Suspense>
    </div>
  );
}
