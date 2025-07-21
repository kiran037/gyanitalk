import { format } from "date-fns";

export default function NoitificationsList({ noitifications = [] }: { noitifications?: any[] }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
         Notifications
      </h2>

      <div className="w-full overflow-hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        {/* Table Header */}
        <div className="grid grid-cols-4 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 px-4 py-3">
          <div>#</div>
          <div>Title</div>
          <div>Description</div>
          <div>Date</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
          {noitifications.length > 0 ? (
            noitifications.map((txn, i) => {
              const date = txn?.created_at
                ? format(new Date(txn.created_at), "dd MMM yyyy, hh:mm a")
                : "N/A";

              return (
                <div
                  key={txn.id}
                  className="grid grid-cols-4 items-start px-4 py-3 text-gray-700 dark:text-gray-200"
                >
                  <div>{i + 1}</div>
                  <div className="truncate font-medium">{txn.title || "Untitled"}</div>
                  <div className="truncate">{txn.description || "-"}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-6">
              No notifications found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
