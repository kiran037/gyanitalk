import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Suspense } from "react";
import { TransactionsSkeleton } from "@/components/transactions/transaction-skeleton";
import { ChapterTable } from "@/components/courses/chapter-table";


export default async function TransactionPage() {
    return (
        <div className="space-y-10">

            <Breadcrumb pageName="Chapter" />

            <Suspense fallback={<TransactionsSkeleton />}>
                <ChapterTable />
            </Suspense>
        </div>
    );
}
