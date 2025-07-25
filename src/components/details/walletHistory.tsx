import { format } from "date-fns";

export default function WalletTransactionList({ transactions, isUser }: { transactions: any[], isUser: boolean }) {


  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Wallet Transactions
      </h2>

      <div className="w-full overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        {/* Table Header */}
        <div className="grid grid-cols-5 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-3">
          <div>User</div>
          <div>Type</div>
          <div>Amount</div>
          <div>Total Min</div>
          <div>Date</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {transactions.length > 0 ? (
            transactions.map((txn) => {
              const type = txn?.transactionType || "-";

              const userName = isUser === true ? txn?.order_request?.astrologer?.name || txn?.order_request?.aiAstrologer?.name : txn?.order_request?.user?.name || "Unknown";
              const amount = txn?.amount || 0;
              const totalMin = txn?.order_request?.totalMin || 0;
              const date = txn?.created_at ? format(new Date(txn.created_at), "dd MMM yyyy, hh:mm a") : "N/A";

              return (
                <div
                  key={txn.id}
                  className="grid grid-cols-5 items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200"
                >
                  <div className="truncate">{userName}</div>
                  <div>{type}</div>
                  <div className="text-green-600 dark:text-green-400 font-medium">₹ {amount}</div>
                  <div>{totalMin} min</div>
                  <div>{date}</div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-6">
              No transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
