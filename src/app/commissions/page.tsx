import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getCommissions } from "@/components/commissions/fetch";
import { Suspense } from "react";
import { CommissionsSkeleton } from "@/components/commissions/commissions-skeleton";
import CommissionsTable from "@/components/commissions/commissions-table";

export default async function CommissionsPage({
  searchParams,
}: {
  searchParams: URLSearchParams;
}) {
  const pageParam = searchParams.get?.("page") || "1";
  const page = parseInt(pageParam, 10);

 // ✅ fetch data from server
const { commissions, commissionTypes, astrologers, totalPages, currentPage } = await getCommissions({
  page,
  limit: 15,
});

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Commissions" />

      {/* Commission Table */}
        <Suspense fallback={<CommissionsSkeleton />}>
          <CommissionsTable
            commissions={commissions}
            astrologers={astrologers}
            commissionTypes={commissionTypes}
            totalPages={totalPages}
            currentPage={currentPage}
            page={page}
          />
      </Suspense>
    </div>
  );
}
