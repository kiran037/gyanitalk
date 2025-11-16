import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { getUsersForDateWithRecent } from "./fetch";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import DatePicker from "@/components/user-activity/DatePicker";
import UserCardsClient from "@/components/user-activity/UserCardsClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function UserActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; userId?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params?.date;

  // Only fetch users if date is selected
  const users = selectedDate
    ? await getUsersForDateWithRecent({ dateDocId: selectedDate, perUserLimit: 20 })
    : [];

  // Serialize users for client
  const serializedUsers = users.map((u) => ({
    userId: u.userId,
    name: u.name ?? null,
    profile: u.profile ?? null,
    total: u.total ?? 0,
    recent: u.recent.map((a) => ({
      id: a.id,
      screenName: a.screenName,
      timestampISO: a.timestamp ? a.timestamp.toISOString() : null,
    })),
  }));

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/25 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-32 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-blue-400/15 to-purple-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tr from-purple-400/10 to-pink-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[16rem] w-[44rem] rounded-[40px] bg-gradient-to-r from-blue-300/10 via-purple-300/5 to-pink-300/10 blur-3xl" />
      </div>

      <div className="relative w-full p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              User Activity Logs
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Track and monitor user activities across different dates
            </p>
          </div>
        </div>

        {/* Date Picker Card */}
        <GlassCard hover={false} className="p-5">
          <div className="max-w-md">
            <DatePicker selectedDate={selectedDate || null} />
          </div>
        </GlassCard>

        {/* Users Section */}
        {!selectedDate ? (
          <GlassCard hover={false} className="p-12 text-center">
            <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Select a Date
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose a date from the picker above to view user activity logs
            </p>
          </GlassCard>
        ) : (
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-xl animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <UserCardsClient selectedDate={selectedDate} users={serializedUsers} />
          </Suspense>
        )}
      </div>
    </div>
  );
}