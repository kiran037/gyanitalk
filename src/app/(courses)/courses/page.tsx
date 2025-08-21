import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Suspense } from "react";
import { TransactionsSkeleton } from "@/components/transactions/transaction-skeleton";
import { TransactionsTable } from "@/components/transactions/wallet-trans-table";
import { CoursesTable } from "@/components/courses/courses-table";


export default async function TransactionPage() {
  return (
    <div className="space-y-10">

      <Breadcrumb pageName="Courses" />

      <Suspense fallback={<TransactionsSkeleton />}>
        <CoursesTable />
      </Suspense>
    </div>
  );
}
