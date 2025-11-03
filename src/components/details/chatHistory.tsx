///Users/xeoren/gyanitallk-admin/src/components/details/chatHistory.tsx
"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import GlassModal from "@/components/ui/GlassModal";

/* --------- lazy ChatView (client-only) --------- */
const ChatView = dynamic(
  () => import("@/components/conversation/ChatView"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full grid place-items-center text-sm text-slate-600 dark:text-slate-300">
        Loading chat…
      </div>
    ),
  }
);

/* ---------- helpers ---------- */
const ensureAbs = (p?: string) =>
  p ? `${process.env.NEXT_PUBLIC_BASEURL}${p.startsWith("/") ? "" : "/"}${p}` : "";
const avatar = (p?: string) =>
  ensureAbs(p) || "https://gyanitalk.com/build/assets/images/person.png";

const STATUSES = ["All", "Completed", "Rejected", "Accepted", "Pending"] as const;

const statusClasses: Record<string, string> = {
  Completed:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Rejected:
    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Accepted:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  Pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Default:
    "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
};

function StatusBadge({ s }: { s: string }) {
  const cls = statusClasses[s] || statusClasses.Default;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {s}
    </span>
  );
}

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

function RowInfo({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <>
      <div className="text-slate-500 dark:text-slate-400">{label}</div>
      <div
        className={
          strong
            ? "text-right font-semibold text-slate-900 dark:text-white"
            : "text-right font-medium text-slate-800 dark:text-slate-200"
        }
      >
        {value}
      </div>
    </>
  );
}

function Duration({
  seconds,
  totalMin,
}: {
  seconds: number;
  totalMin?: number;
}) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const str = seconds >= 60 ? `${mins} min ${secs} sec` : `${seconds} sec`;
  return (
    <>
      {str}{" "}
      {totalMin ? (
        <span className="text-slate-400 dark:text-slate-500">({totalMin} Min)</span>
      ) : null}
    </>
  );
}

/* ---------- ASTRO view (users chatting with astrologer) ---------- */
export default function AstroChatSessionList({ sessions }: { sessions: any[] }) {
  const [filter, setFilter] = useState<string>("All");
  const list = useMemo(
    () =>
      filter === "All"
        ? sessions
        : sessions.filter((s) => s.chatStatus === filter),
    [sessions, filter]
  );

  const [open, setOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const openModal = (session: any) => {
    setActiveChatId(session.chatId ?? null);
    setOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Filter:{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {filter}
          </span>{" "}
          •{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {list.length}
          </span>{" "}
          records
        </div>
        <SegmentedFilter value={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((session) => {
          const u = session.user || {};
          const createdAt = session.created_at
            ? format(new Date(session.created_at), "dd MMM yyyy, hh:mm a")
            : "-";
          const sec = parseInt(session.chat_duration || "0", 10);

          // ✅ Only show when Completed & has chatId
          const hasChatId = Boolean(session.chatId);
          const canView = session.chatStatus === "Completed" && hasChatId;

          return (
            <GlassCard key={session.id} className="hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/10 shadow-sm">
                    <Image
                      src={avatar(u.profile)}
                      alt="User"
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {u.name || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {createdAt}
                    </div>
                  </div>
                </div>
                <StatusBadge s={session.chatStatus} />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/60 dark:border-white/10 p-4 text-sm">
                <RowInfo label="Contact" value={u.contactNo || "-"} />
                {session.chatStatus === "Completed" && (
                  <>
                    <RowInfo
                      label="Duration"
                      value={
                        <Duration
                          seconds={isNaN(sec) ? 0 : sec}
                          totalMin={session.totalMin}
                        />
                      }
                    />
                    <RowInfo
                      label="Deduction"
                      strong
                      value={
                        session.deduction != null ? (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {session.deduction} Coins
                          </span>
                        ) : (
                          "-"
                        )
                      }
                    />
                    <RowInfo label="Chat ID" value={session.chatId || "N/A"} />
                  </>
                )}
              </div>

              <div className="text-right mb-5 mr-2">
                {canView ? (
                  <button
                    onClick={() => openModal(session)}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 transition-colors shadow-sm"
                  >
                    View History
                  </button>
                ) : (
                  <span className="text-slate-300 text-sm">&nbsp;</span>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Modal on TOP with full height content */}
      <GlassModal
        open={open}
        onClose={() => setOpen(false)}
        title={activeChatId ? `Chat History — ${activeChatId}` : "Chat History"}
        /* Make the panel wider & taller */
        maxWidthClass="max-w-5xl"
        panelClassName="h-[86vh]"
        noBodyPadding
      >
        {/* ChatView takes 100% height and manages its own sticky header/composer */}
        <div className="h-full">
          {activeChatId ? <ChatView chatId={String(activeChatId)} /> : null}
        </div>
      </GlassModal>
    </div>
  );
}

/* ---------- USER view (user chatting with astrologer/AI) ---------- */
export function UserChatSessionList({ sessions }: { sessions: any[] }) {
  const [filter, setFilter] = useState<string>("All");
  const list = useMemo(
    () =>
      filter === "All"
        ? sessions
        : sessions.filter((s) => s.chatStatus === filter),
    [sessions, filter]
  );

  const [open, setOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const openModal = (session: any) => {
    setActiveChatId(session.chatId ?? null);
    setOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          Filter:{" "}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {filter}
          </span>{" "}
          •{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {list.length}
          </span>{" "}
          records
        </div>
        <SegmentedFilter value={filter} onChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((session) => {
          const a = session.astrologer || session.aiAstrologer || {};
          const profile = a.profileImage || a.image;
          const createdAt = session.created_at
            ? format(new Date(session.created_at), "dd MMM yyyy, hh:mm a")
            : "-";
          const sec = parseInt(session.chat_duration || "0", 10);

          // ✅ Only show when Completed & has chatId
          const hasChatId = Boolean(session.chatId);
          const canView = session.chatStatus === "Completed" && hasChatId;

          return (
            <GlassCard key={session.id} className="hover:-translate-y-0.5 transition">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-white/70 dark:ring-white/10 shadow-sm">
                    <Image
                      src={avatar(profile)}
                      alt="Astrologer"
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {a.name || "Unknown"}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {createdAt}
                    </div>
                  </div>
                </div>
                <StatusBadge s={session.chatStatus} />
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-white/60 dark:border-white/10 p-4 text-sm">
                <RowInfo label="Contact" value={a.contactNo || "-"} />
                {session.chatStatus === "Completed" && (
                  <>
                    <RowInfo
                      label="Duration"
                      value={
                        <Duration
                          seconds={isNaN(sec) ? 0 : sec}
                          totalMin={session.totalMin}
                        />
                      }
                    />
                    <RowInfo
                      label="Deduction"
                      strong
                      value={
                        session.deduction != null ? (
                          <span className="text-indigo-600 dark:text-indigo-400">
                            {session.deduction} Coins
                          </span>
                        ) : (
                          "-"
                        )
                      }
                    />
                    <RowInfo label="Chat ID" value={session.chatId || "N/A"} />
                  </>
                )}
              </div>

              <div className="text-right mb-5 mr-2">
                {canView ? (
                  <button
                    onClick={() => openModal(session)}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-green-200 transition-colors shadow-sm"
                  >
                    View History
                  </button>
                ) : (
                  <span className="text-slate-300 text-sm">&nbsp;</span>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassModal
        open={open}
        onClose={() => setOpen(false)}
        title={activeChatId ? `Chat History — ${activeChatId}` : "Chat History"}
        maxWidthClass="max-w-5xl"
        panelClassName="h-[86vh]"
        noBodyPadding
      >
        <div className="h-full">
          {activeChatId ? <ChatView chatId={String(activeChatId)} /> : null}
        </div>
      </GlassModal>
    </div>
  );
}
