// // components/details/callHistory.tsx
"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/GlassUI/GlassKit";
import { Segmented } from "@/components/GlassUI/Segmented";
import { GlassBadge, statusToVariant } from "@/components/GlassUI/GlassBadge";

const STATUSES = ["All", "Completed", "Rejected", "Accepted", "Pending"] as const;

const ensureAbs = (p?: string) =>
  p ? `${process.env.NEXT_PUBLIC_BASEURL}${p.startsWith("/") ? "" : "/"}${p}` : "";
const avatar = (p?: string) =>
  ensureAbs(p) || "https://gyanitalk.com/build/assets/images/person.png";

function RowInfo({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) {
  return (
    <>
      <div className="text-slate-500 dark:text-slate-400">{label}</div>
      <div className={strong ? "text-right font-semibold text-slate-900 dark:text-white" : "text-right font-medium text-slate-800 dark:text-slate-200"}>
        {value}
      </div>
    </>
  );
}
function Duration({ seconds, totalMin }: { seconds: number; totalMin?: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const str = seconds >= 60 ? `${mins} min ${secs} sec` : `${seconds} sec`;
  return (
    <>
      {str} {totalMin ? <span className="text-slate-400 dark:text-slate-500">({totalMin} Min)</span> : null}
    </>
  );
}

/* ---------- ASTRO view (calls from users) ---------- */
export default function AstroCallSessionList({ sessions }: { sessions: any[] }) {
  const [filter, setFilter] = useState<string>("All");
  const list = useMemo(() => (filter === "All" ? sessions : sessions.filter((s) => s.callStatus === filter)), [sessions, filter]);

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Filter: <span className="font-semibold text-blue-600 dark:text-blue-400">{filter}</span> •{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">{list.length}</span> records
        </div>
        <Segmented value={filter} onChange={setFilter} options={STATUSES} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((session) => {
          const u = session.user || {};
          const createdAt = session.created_at ? format(new Date(session.created_at), "dd MMM yyyy, hh:mm a") : "-";
          const sec = parseInt(session.chat_duration || "0", 10);
          return (
            <GlassCard key={session.id} className="hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/10 shadow-sm">
                    <Image src={avatar(u.profile)} alt="User" width={44} height={44} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{u.name || "Unknown"}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{createdAt}</div>
                  </div>
                </div>
                <GlassBadge variant={statusToVariant(session.callStatus)}>{session.callStatus}</GlassBadge>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/60 dark:border-white/10 p-4 text-sm">
                <RowInfo label="Contact" value={u.contactNo || "-"} />
                {session.callStatus === "Completed" && (
                  <>
                    <RowInfo label="Duration" value={<Duration seconds={isNaN(sec) ? 0 : sec} totalMin={session.totalMin} />} />
                    <RowInfo label="Deduction" strong value={session.deduction != null ? <span className="text-indigo-600 dark:text-indigo-400">{session.deduction} Coins</span> : "-"} />
                  </>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- USER view (user’s call sessions) ---------- */
export function UserCallSessionList({ sessions }: { sessions: any[] }) {
  const [filter, setFilter] = useState<string>("All");
  const list = useMemo(() => (filter === "All" ? sessions : sessions.filter((s) => s.callStatus === filter)), [sessions, filter]);

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Filter: <span className="font-semibold text-blue-600 dark:text-blue-400">{filter}</span> •{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">{list.length}</span> records
        </div>
        <Segmented value={filter} onChange={setFilter} options={STATUSES} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((session) => {
          const a = session.astrologer || {};
          const createdAt = session.created_at ? format(new Date(session.created_at), "dd MMM yyyy, hh:mm a") : "-";
          const sec = parseInt(session.chat_duration || "0", 10);
          return (
            <GlassCard key={session.id} className="hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/10 shadow-sm">
                    <Image src={avatar(a.profileImage)} alt="Astrologer" width={44} height={44} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{a.name || "Unknown"}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{createdAt}</div>
                  </div>
                </div>
                <GlassBadge variant={statusToVariant(session.callStatus)}>{session.callStatus}</GlassBadge>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/60 dark:border-white/10 p-4 text-sm">
                <RowInfo label="Contact" value={a.contactNo || "-"} />
                {session.callStatus === "Completed" && (
                  <>
                    <RowInfo label="Duration" value={<Duration seconds={isNaN(sec) ? 0 : sec} totalMin={session.totalMin} />} />
                    <RowInfo label="Deduction" strong value={session.deduction != null ? <span className="text-indigo-600 dark:text-indigo-400">{session.deduction} Coins</span> : "-"} />
                  </>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
