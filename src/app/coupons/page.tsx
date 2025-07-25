import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Suspense } from "react";
import { TransactionsSkeleton } from "@/components/transactions/transaction-skeleton";
import { CouponsTable } from "@/components/coupons/coupons-table";


export default async function TransactionPage() {
  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Coupons" />
      <Suspense fallback={<TransactionsSkeleton />}>
        <CouponsTable />
      </Suspense>
    </div>
  );
}
