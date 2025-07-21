import { format } from "date-fns";
import Image from "next/image";

export default function GiftList({ gifts = [] }: { gifts?: any[] }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4"> Gift History</h2>

      <div className="w-full overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        {/* Table Header */}
        <div className="grid grid-cols-5 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-3">
          <div>Name</div>
          <div>Gift Icon</div>
          <div>Gift Name</div>
          <div>Amount</div>
          <div>Date</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
          {gifts.length > 0 ? (
            gifts.map((txn, i) => {
              const userName = txn?.user?.name || "Unknown";
              const amount = txn?.giftAmount || 0;
              const icon = txn?.gift?.image || "";
              const giftName = txn?.gift?.name || "Unknown";
              const date = txn?.created_at
                ? format(new Date(txn.created_at), "dd MMM yyyy, hh:mm a")
                : "N/A";

              return (
                <div
                  key={txn.id}
                  className="grid grid-cols-5 items-center px-4 py-3 text-gray-700 dark:text-gray-200"
                >
                  <div className="truncate">{userName}</div>

                  <div className="flex justify-center">
                    <Image
                      src={
                        icon
                          ? `${process.env.NEXT_PUBLIC_BASEURL}${icon}`
                          : "https://gyanitalk.com/build/assets/images/person.png"
                      }
                      alt={`${giftName} Icon`}
                      width={40}
                      height={40}
                      className="rounded-full border object-cover"
                    />
                  </div>

                  <div className="truncate">{giftName}</div>
                  <div className="text-green-600 dark:text-green-400 font-medium">₹ {amount}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-6">
              No gifts found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
