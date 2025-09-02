import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { BlogsForm } from "@/components/blogs/blogs-form";
import { Suspense } from "react";


export default async function BlogsPage({
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

      <Breadcrumb pageName="Blogs" />
      
      <Suspense>
        <BlogsForm />
      </Suspense>
    </div>
  );
}
