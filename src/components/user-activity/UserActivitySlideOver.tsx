"use client";

import Image from "next/image";
import { Activity, Clock } from "lucide-react";
import { cx } from "@/components/GlassUI/GlassKit";
import { GlassCard } from "@/components/GlassUI/GlassKit";

export default function UserActivitySlideOver({ 
  open, 
  onClose, 
  user 
}: { 
  open: boolean; 
  onClose: () => void; 
  user: any 
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cx(
          "fixed right-0 top-0 h-full z-50 w-full sm:w-[32rem]",
          "bg-white dark:bg-gray-900 border-l border-slate-200 dark:border-white/10",
          "shadow-[-8px_0_40px_rgba(0,0,0,0.12)]",
          "transform transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {user?.profile ? (
                <Image
                  src={user.profile.startsWith("http") ? user.profile : `${process.env.NEXT_PUBLIC_BASEURL || ""}${user.profile}`}
                  alt={user.name || user.userId}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || '?'
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {user?.name || "Unknown User"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.userId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
          >
            <span className="text-2xl text-slate-400">×</span>
          </button>
        </div>

        {/* Activity List */}
        <div className="p-6 space-y-3 overflow-y-auto h-[calc(100%-5rem)]">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Activity ({user?.recent?.length || 0})
            </h4>
          </div>

          {user?.recent?.map((activity: any, idx: number) => (
            <GlassCard key={activity.id} hover={false} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {activity.screenName || "/"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.timestampISO
                        ? new Intl.DateTimeFormat("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "Asia/Kolkata",
                          }).format(new Date(activity.timestampISO))
                        : "—"}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">#{idx + 1}</span>
              </div>
            </GlassCard>
          ))}

          {(!user?.recent || user.recent.length === 0) && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No activity recorded</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
