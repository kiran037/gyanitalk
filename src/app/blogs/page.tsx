import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { BlogsForm } from "@/components/blogs/blogs-form";
import { Suspense } from "react";

export default function BlogsPage({
  searchParams,
}: {
  searchParams?: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.search || "";

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Blogs" />

      {/* Search form */}
      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search"
          className="min-w-[250px] rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />
        <button
          type="submit"
          className="bg-primary px-4 py-2 text-white rounded"
        >
          Search
        </button>
      </form>

       {/* ✅ Server → Client bridge */}
      <Suspense fallback={<p>Loading blogs...</p>}>
        <BlogsForm page={page} search={search} />
      </Suspense>
    </div>
  );
}
