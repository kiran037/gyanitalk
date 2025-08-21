import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { CustomerTable } from "@/components/customers/customer-table";
import { CustomersSkeleton } from "@/components/customers/customer-skeleton";
import { Suspense } from "react";
import { TransactionsSkeleton } from "@/components/transactions/transaction-skeleton";
import { TransactionsTable } from "@/components/transactions/wallet-trans-table";


export default async function TransactionPage({
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

      <Breadcrumb pageName="Wallet Transactions" />

      <Suspense fallback={<TransactionsSkeleton />}>
        <TransactionsTable page={page} search={search} startDate={startDate} endDate={endDate} />
      </Suspense>
    </div>
  );
}
