import { AiAstrologerTable } from "@/components/(astros)/ai-astrologer/ai-astrologer-table";
import { AstrologerSkeleton } from "@/components/(astros)/astrologers/astrologer-skeleton";
import { AstrologerTable } from "@/components/(astros)/astrologers/astrologer-table";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Suspense } from "react";

export default async function AstrologersPage({
    searchParams,
}: {
    searchParams: {
        page?: string;
        search?: string;
    };
}) {
    const page = parseInt(searchParams?.page || "1", 10);
    const search = searchParams?.search || "";

    return (
        <div className="space-y-10">
            <Breadcrumb pageName="AI Astrologers" />

            <form method="get" className="flex gap-2">
                <input
                    name="search"
                    defaultValue={search}
                    placeholder="Search by name or contact"
                    className="min-w-[250px]  rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
                />


                <button type="submit" className="bg-primary px-4 py-2 text-white rounded">
                    Search
                </button>
            </form>

            <Suspense fallback={<AstrologerSkeleton />}>
                <AiAstrologerTable
                    page={page}
                    search={search}
                />
            </Suspense>
        </div>
    );
}