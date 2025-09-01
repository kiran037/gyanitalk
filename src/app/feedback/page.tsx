import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { FeedbackTable } from "@/components/feedback/feedback-table";
import { FeedbackSkeleton } from "@/components/feedback/feedback-skeleton";
import { Suspense } from "react";


export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; startDate?: string; endDate?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";
  const startDate = searchParams?.startDate;
  const endDate = searchParams?.endDate;
  return (
    <div className="space-y-10">

      <Breadcrumb pageName="Feedback" />


      {/* <form method="get" className="flex gap-2">
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
        <input
          type="date"
          name="endDate"
          className="rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />

        <button type="submit" className="bg-primary px-4 py-2 text-white rounded">
          Search
        </button>
      </form> */}

      <Suspense fallback={<FeedbackSkeleton />}>
        <FeedbackTable page={page} search={search} startDate={startDate} endDate={endDate} />
      </Suspense>
    </div>
  );
}
