"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Activity, User } from "lucide-react";
import { cx } from "@/components/GlassUI/GlassKit";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import SearchInput from "./SearchInput";
import UserActivitySlideOver from "./UserActivitySlideOver";

type UserData = {
  userId: string;
  name: string | null;
  profile: string | null;
  total: number;
  recent: Array<{
    id: string;
    screenName: string;
    timestampISO: string | null;
  }>;
};

export default function UserCardsClient({ 
  selectedDate, 
  users 
}: { 
  selectedDate: string; 
  users: UserData[] 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const searchParams = useSearchParams();

  // Check URL for userId param to open slide-over on mount
  useEffect(() => {
    const userId = searchParams?.get("userId");
    if (userId) {
      const user = users.find(u => u.userId === userId);
      if (user) {
        setSelectedUser(user);
        setSlideOverOpen(true);
      }
    }
  }, [searchParams, users]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.userId.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setSlideOverOpen(true);
  };

  const handleCloseSlideOver = () => {
    setSlideOverOpen(false);
    setSelectedUser(null);
  };

  return (
    <>
      <div className="mb-6">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <GlassCard key={user.userId} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white/50 dark:ring-white/10">
                  {user.profile ? (
                    <Image
                      src={user.profile.startsWith("http") ? user.profile : `${process.env.NEXT_PUBLIC_BASEURL || ""}${user.profile}`}
                      alt={user.name || user.userId}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-lg">
                      {user.name?.[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                    {user.name || "Unknown User"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.userId}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200/50 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {user.total || 0} activities
                </span>
              </div>
            </div>

            {/* Recent Preview */}
            <div className="space-y-2 mb-4">
              {user.recent.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-xs">
                  <span className="truncate max-w-[60%] text-slate-600 dark:text-slate-400">
                    {activity.screenName || "/"}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">
                    {activity.timestampISO
                      ? new Intl.DateTimeFormat("en-IN", {
                          timeStyle: "short",
                          timeZone: "Asia/Kolkata",
                        }).format(new Date(activity.timestampISO))
                      : "—"}
                  </span>
                </div>
              ))}
              {user.recent.length === 0 && (
                <p className="text-xs text-slate-400">No recent activity</p>
              )}
            </div>

            {/* View Button */}
            <button
              onClick={() => handleViewUser(user)}
              className={cx(
                "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
                "bg-gradient-to-r from-blue-600 to-purple-600 text-white",
                "hover:from-blue-700 hover:to-purple-700",
                "transition-all active:scale-[0.98]"
              )}
            >
              <User className="h-4 w-4" />
              View All Activity
            </button>
          </GlassCard>
        ))}

        {filteredUsers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <User className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? "No users found matching your search" : "No users found for this date"}
            </p>
          </div>
        )}
      </div>

      <UserActivitySlideOver
        open={slideOverOpen}
        onClose={handleCloseSlideOver}
        user={selectedUser}
      />
    </>
  );
}