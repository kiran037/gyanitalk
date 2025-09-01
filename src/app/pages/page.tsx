import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { PagesForm } from "@/components/pages/pages-form";
import { Suspense } from "react";


export default async function PagesPage({
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

      <Breadcrumb pageName="Pages" />
      
      <Suspense>
        <PagesForm />
      </Suspense>
    </div>
  );
}
