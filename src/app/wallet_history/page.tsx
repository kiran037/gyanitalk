import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getWalletHistory } from "@/components/wallet_history/fetch";
import { Suspense } from "react";
import { WalletHistorySkeleton } from "@/components/wallet_history/wallet_history-skeleton";
import WalletHistoryTable from "@/components/wallet_history/wallet_history-table";

export default async function WalletHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}) {
  // 👇 await karo
  const params = await searchParams;

  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";

 // ✅ fetch data from server
  const { wallethistory, totalPages, currentPage } = await getWalletHistory({
    page,
    limit: 15,
    search,
  });

  return (
    <div className="space-y-10">
      <Breadcrumb pageName="Wallet History" />

      {/* Search Form */}
      <form method="get" className="flex gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name or contactNo"
          className="min-w-[250px] rounded border px-4 py-2 text-sm dark:bg-dark dark:text-white"
        />
        <button
          type="submit"
          className="bg-primary px-4 py-2 text-white rounded"
        >
          Search
        </button>
      </form>

      {/* Withdrawal Requests Table */}
      <Suspense fallback={<WalletHistorySkeleton />}>
        <WalletHistoryTable
          wallethistory={wallethistory}   // ✅ same naam as in Props
          totalPages={totalPages}
          currentPage={currentPage}
          page={page}
          search={search}
        />
      </Suspense>  
    </div>
  );
}
