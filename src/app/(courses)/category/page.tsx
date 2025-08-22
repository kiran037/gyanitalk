import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Suspense } from "react";
import { TransactionsSkeleton } from "@/components/transactions/transaction-skeleton";
import { CategoryTable } from "@/components/courses/category-table";


export default async function TransactionPage() {
    return (
        <div className="space-y-10">

            <Breadcrumb pageName="Category" />

            <Suspense fallback={<TransactionsSkeleton />}>
                <CategoryTable />
            </Suspense>
        </div>
    );
}
