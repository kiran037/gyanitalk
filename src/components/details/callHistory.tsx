
"use client";

import Image from "next/image";
import { format } from "date-fns";
import { useMemo, useState } from "react";

/* ---------- helpers ---------- */
const ensureAbs = (p?: string) =>
  p ? `${process.env.NEXT_PUBLIC_BASEURL}${p.startsWith("/") ? "" : "/"}${p}` : "";
const avatar = (p?: string) =>
  ensureAbs(p) || "https://gyanitalk.com/build/assets/images/person.png";

const STATUSES = ["All", "Completed", "Rejected", "Accepted", "Pending"] as const;

const statusClasses: Record<string, string> = {
  Completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Rejected: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Accepted: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Default: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
};

function StatusBadge({ s }: { s: string }) {
  const cls = statusClasses[s] || statusClasses.Default;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {s}
    </span>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "relative rounded-2xl overflow-hidden",
        "bg-white/55 dark:bg-white/[0.06] border border-white/60 dark:border-white/10",
        "backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent dark:from-white/[0.05] dark:via-white/[0.03] dark:to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

function SegmentedFilter({
  value,
  onChange,
  options = STATUSES,
}: {
  value: string;
  onChange: (s: string) => void;
  options?: readonly string[];
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl p-1 bg-white/60 dark:bg-white/[0.06] border border-white/50 dark:border-white/10 backdrop-blur-xl">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={[
              "px-3 py-1.5 text-xs font-medium rounded-lg transition",
              active
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "text-slate-700 dark:text-slate-300 hover:bg-white/70 dark:hover:bg-white/[0.08]",
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

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
        <SegmentedFilter value={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((session) => {
          const u = session.user || {};
          const createdAt = session.created_at ? format(new Date(session.created_at), "dd MMM yyyy, hh:mm a") : "-";
          const sec = parseInt(session.chat_duration || "0", 10); // keeping your original field
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
                <StatusBadge s={session.callStatus} />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/60 dark:border-white/10 p-4 text-sm">
                <RowInfo label="Contact" value={u.contactNo || "-"} />
                {session.callStatus === "Completed" && (
                  <>
                    <RowInfo
                      label="Duration"
                      value={<Duration seconds={isNaN(sec) ? 0 : sec} totalMin={session.totalMin} />}
                    />
                    <RowInfo
                      label="Deduction"
                      strong
                      value={session.deduction != null ? <span className="text-indigo-600 dark:text-indigo-400">{session.deduction} Coins</span> : "-"}
                    />
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
        <SegmentedFilter value={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((session) => {
          const a = session.astrologer || {};
          const createdAt = session.created_at ? format(new Date(session.created_at), "dd MMM yyyy, hh:mm a") : "-";
          const sec = parseInt(session.chat_duration || "0", 10); // keeping your original field
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
                <StatusBadge s={session.callStatus} />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/60 dark:border-white/10 p-4 text-sm">
                <RowInfo label="Contact" value={a.contactNo || "-"} />
                {session.callStatus === "Completed" && (
                  <>
                    <RowInfo
                      label="Duration"
                      value={<Duration seconds={isNaN(sec) ? 0 : sec} totalMin={session.totalMin} />}
                    />
                    <RowInfo
                      label="Deduction"
                      strong
                      value={session.deduction != null ? <span className="text-indigo-600 dark:text-indigo-400">{session.deduction} Coins</span> : "-"}
                    />
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
