// app/user-activity/page.tsx
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { listDateIdsDesc, getUsersForDateWithRecent } from "./fetch";
import UserCards from "@/components/ui/user-cards";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- skeletons ---
function DatesSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-8 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  );
}
function UsersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 animate-pulse"
        />
      ))}
    </div>
  );
}

export default async function Page({
  searchParams,
}: {
  searchParams: { date?: string; userId?: string };
}) {
  const selectedDate = searchParams?.date; // "DD-MM-YYYY"

  // Server-side data
  const datesPromise = listDateIdsDesc();
  const usersPromise = selectedDate
    ? getUsersForDateWithRecent({ dateDocId: selectedDate, perUserLimit: 6 })
    : null;

  const [dates, users] = await Promise.all([datesPromise, usersPromise]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="mx-auto w-full">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
          User Activity Logs
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* LEFT: Dates */}
          <aside className="md:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="text-sm font-medium mb-2">Dates</div>
              <Suspense fallback={<DatesSkeleton />}>
                <div className="space-y-1 max-h-[70vh] overflow-auto pr-1">
                  {dates?.map((d) => {
                    const active = d === selectedDate;
                    return (
                      <a
                        key={d}
                        href={`?date=${encodeURIComponent(d)}`}
                        className={cn(
                          "block px-3 py-2 rounded text-sm transition",
                          active
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        )}
                      >
                        {d} <span className="text-xs text-gray-500 ml-1">(DD-MM-YYYY)</span>
                      </a>
                    );
                  })}
                  {!dates?.length && <div className="text-sm text-gray-500">No dates.</div>}
                </div>
              </Suspense>
            </div>
          </aside>

          {/* MIDDLE: Users for selected date (instant slide-over via client component) */}
          <section className="md:col-span-5">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  {selectedDate ? `Users on ${selectedDate}` : "Pick a date"}
                </div>
                {selectedDate && (
                  <form method="get" className="hidden md:block">
                    <input type="hidden" name="date" value={selectedDate} />
                    <input
                      name="userId"
                      placeholder="Filter userId…"
                      className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900"
                    />
                  </form>
                )}
              </div>

              {!selectedDate ? (
                <div className="text-sm text-gray-500">Select a date from the left.</div>
              ) : (
                <Suspense fallback={<UsersSkeleton />}>
                  <UserCards
                    selectedDate={selectedDate}
                    users={(users || []).map((u) => ({
                      userId: u.userId,
                      name: u.name ?? null,
                      profile: u.profile ?? null,
                      total: u.total,
                      recent: u.recent.map((a) => ({
                        id: a.id,
                        screenName: a.screenName,
                        timestampISO: a.timestamp ? a.timestamp.toISOString() : null,
                      })),
                    }))}
                  />
                </Suspense>
              )}
            </div>
          </section>

          {/* RIGHT: Help */}
          <aside className="md:col-span-4 hidden md:block">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-sm font-medium mb-1">How it works</div>
              <ul className="text-sm list-disc ml-5 space-y-1 text-gray-600 dark:text-gray-400">
                <li>
                  Dates are top-level docs under <code>user_activity_logs</code>.
                </li>
                <li>Click a date to see user IDs (names from Prisma).</li>
                <li>Click “View” to open the slide-over instantly (no page reload).</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
