"use client";

import { use, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Search, Mail, User, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { getContacts } from "./fetch";
const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");

/* ========== Glass Atoms ========== */
function GlassCard({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl p-5",
        "bg-white/60 dark:bg-white/[0.07] border border-white/30 dark:border-white/10",
        "backdrop-blur-2xl shadow-md transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}

function GlassButton(
  { children, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow hover:from-blue-700 hover:to-indigo-700",
        className
      )}
    >
      {children}
    </button>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "rounded-xl px-4 py-2.5 text-sm w-full outline-none",
        "bg-white/70 dark:bg-white/[0.08] border border-white/40 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60",
        "text-slate-900 dark:text-slate-100",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        props.className
      )}
    />
  );
}

/* ========== Skeleton Loader ========== */
function ContactSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <GlassCard key={i} className="animate-pulse h-24" />
      ))}
    </div>
  );
}

/* ========== Contact Card ========== */
function ContactCard({ item }: { item: any }) {
  return (
    <GlassCard>
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4" />
          {item.contact_name || "-"}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          {item.contact_email || "-"}
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
          {item.contact_message || "-"}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <CalendarDays className="h-3 w-3" />
          {item.created_at
            ? dayjs(item.created_at).format("DD MMM YYYY, hh:mm A")
            : "-"}
        </p>
      </div>
    </GlassCard>
  );
}

/* ========== Pagination (smart, ellipsis) ========== */
function Pagination({
  totalPages,
  currentPage,
  search,
  startDate,
  endDate,
}: {
  totalPages: number;
  currentPage: number;
  search: string;
  startDate?: string;
  endDate?: string;
}) {
  if (totalPages <= 1) return null;

  const makeUrl = (p: number) =>
    `?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ""}${
      startDate ? `&startDate=${encodeURIComponent(startDate)}` : ""
    }${endDate ? `&endDate=${encodeURIComponent(endDate)}` : ""}`;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (
      i === currentPage - 2 ||
      i === currentPage + 2
    ) {
      pages.push("…");
    }
  }

  return (
    <div className="flex justify-center gap-2 mt-6 flex-wrap">
      {/* Prev */}
      <a
        href={makeUrl(Math.max(1, currentPage - 1))}
        className={cx(
          "px-3 py-1 rounded-full border text-sm flex items-center gap-1",
          currentPage === 1
            ? "opacity-40 pointer-events-none"
            : "bg-white/70 dark:bg-white/[0.08]"
        )}
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </a>

      {pages.map((p, idx) =>
        p === "…" ? (
          <span key={idx} className="px-2">
            …
          </span>
        ) : (
          <a
            key={idx}
            href={makeUrl(p as number)}
            className={cx(
              "px-3 py-1 rounded-full border text-sm",
              p === currentPage
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                : "bg-white/70 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200"
            )}
          >
            {p}
          </a>
        )
      )}

      {/* Next */}
      <a
        href={makeUrl(Math.min(totalPages, currentPage + 1))}
        className={cx(
          "px-3 py-1 rounded-full border text-sm flex items-center gap-1",
          currentPage === totalPages
            ? "opacity-40 pointer-events-none"
            : "bg-white/70 dark:bg-white/[0.08]"
        )}
      >
        Next <ChevronRight className="h-4 w-4" />
      </a>
    </div>
  );
}

/* ========== Main Page ========== */
export default function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; startDate?: string; endDate?: string }>;
}) {
  const params = use(searchParams);
  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";
  const startDate = params?.startDate;
  const endDate = params?.endDate;

  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getContacts({ page, limit: 15, search, startDate, endDate });
        if (!mounted) return;
        setContacts(res?.data || []);
        setTotalPages(res?.totalPages || 1);
        setCurrentPage(res?.currentPage || page);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page, search, startDate, endDate]);

  return (
    <div className="space-y-8 px-5 py-5 relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-32 w-[26rem] h-[26rem] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-32 w-[28rem] h-[28rem] rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Messages</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          User contact submissions with filters & pagination.
        </p>
      </div>

      {/* Search Bar */}
      <form method="get" className="flex items-center gap-2 w-full md:w-1/2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <GlassInput
            name="search"
            defaultValue={search}
            placeholder="Search name or email…"
            className="pl-10"
          />
        </div>
        <GlassButton type="submit">Search</GlassButton>
      </form>

      {/* List */}
      {loading ? (
        <ContactSkeleton />
      ) : contacts.length === 0 ? (
        <GlassCard className="text-center text-slate-600 dark:text-slate-300">
          No contacts found.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((item, i) => (
            <ContactCard key={i} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        search={search}
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}
