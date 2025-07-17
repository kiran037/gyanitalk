import { format } from "date-fns";

export default function WalletTransactionList({ transactions }: { transactions: any[] }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Wallet Transactions
      </h2>

      {/* Header */}
      <div className="grid grid-cols-5 text-sm font-semibold text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 py-2">
        <div>User</div>
        <div>Type</div>
        <div>Amount</div>
        <div>Total Min</div>
        <div>Date</div>
      </div>

      {/* List Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
        {transactions.map((txn) => {
          const userName = txn.order_request?.user?.name || "Unknown";
          const type = txn.transactionType || "-";
          const amount = txn.amount || 0;
          const totalMin = txn.order_request?.totalMin || "-";
          const date = format(new Date(txn.created_at), "dd MMM yyyy, hh:mm a");

          return (
            <div
              key={txn.id}
              className="grid grid-cols-5 py-3 items-center text-gray-700 dark:text-gray-300"
            >
              <div>{userName}</div>
              <div>{type}</div>
              <div className="text-green-600 font-medium">₹{amount}</div>
              <div>{totalMin} min</div>
              <div>{date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
