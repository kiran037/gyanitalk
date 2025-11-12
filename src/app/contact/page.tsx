"use client";

import { use, useEffect, useState } from "react";
import dayjs from "dayjs";
import { Search, Mail, User, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { getContacts } from "./fetch";

// Rename cx to avoid conflicts
const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

/* ========== Glass Atoms ========== */
function GlassCard({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
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
      className={cn(
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
      className={cn(
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <GlassCard key={i} className="animate-pulse">
          <div className="space-y-3">
            <div className="h-4 bg-slate-300/50 dark:bg-slate-700/50 rounded w-3/4" />
            <div className="h-4 bg-slate-300/50 dark:bg-slate-700/50 rounded w-full" />
            <div className="h-4 bg-slate-300/50 dark:bg-slate-700/50 rounded w-5/6" />
            <div className="h-3 bg-slate-300/50 dark:bg-slate-700/50 rounded w-1/2" />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

/* ========== Contact Card ========== */
function ContactCard({ item }: { item: any }) {
  return (
    <GlassCard className="hover:shadow-lg transition-shadow">
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4 text-blue-500" />
          {item.contact_name || "-"}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Mail className="h-4 w-4 text-indigo-500" />
          {item.contact_email || "-"}
        </p>
        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 bg-slate-100/50 dark:bg-slate-800/30 p-3 rounded-lg">
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

  const makeUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", pageNum.toString());
    if (search) params.set("search", search);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return `?${params.toString()}`;
  };

  const pages: (number | string)[] = [];
  
  // Smart pagination logic
  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);
    
    if (currentPage > 3) {
      pages.push("…");
    }
    
    // Show pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 2) {
      pages.push("…");
    }
    
    // Always show last page
    pages.push(totalPages);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
      {/* Prev */}
      <a
        href={currentPage > 1 ? makeUrl(currentPage - 1) : "#"}
        className={cn(
          "px-3 py-2 rounded-xl border text-sm flex items-center gap-1 transition-all",
          currentPage === 1
            ? "opacity-40 pointer-events-none cursor-not-allowed"
            : "bg-white/70 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.12]"
        )}
        aria-disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" /> Prev
      </a>

      {pages.map((pageItem, idx) =>
        pageItem === "…" ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-slate-500">
            …
          </span>
        ) : (
          <a
            key={`page-${pageItem}`}
            href={makeUrl(pageItem as number)}
            className={cn(
              "px-3 py-2 rounded-xl border text-sm transition-all min-w-[40px] text-center",
              pageItem === currentPage
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "bg-white/70 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-white/[0.12]"
            )}
            aria-current={pageItem === currentPage ? "page" : undefined}
          >
            {pageItem}
          </a>
        )
      )}

      {/* Next */}
      <a
        href={currentPage < totalPages ? makeUrl(currentPage + 1) : "#"}
        className={cn(
          "px-3 py-2 rounded-xl border text-sm flex items-center gap-1 transition-all",
          currentPage === totalPages
            ? "opacity-40 pointer-events-none cursor-not-allowed"
            : "bg-white/70 dark:bg-white/[0.08] hover:bg-white dark:hover:bg-white/[0.12]"
        )}
        aria-disabled={currentPage === totalPages}
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await getContacts({ 
          page, 
          limit: 15, 
          search, 
          startDate, 
          endDate 
        });
        
        if (!mounted) return;
        
        // Handle potential error response
        if (res?.error) {
          setError(res.error);
          setContacts([]);
          setTotalPages(1);
          setCurrentPage(page);
        } else {
          setContacts(res?.data || []);
          setTotalPages(res?.totalPages || 1);
          setCurrentPage(res?.currentPage || page);
        }
      } catch (err: any) {
        console.error("Failed to fetch contacts:", err);
        if (mounted) {
          setError(err?.message || "Failed to load contacts");
          setContacts([]);
          setTotalPages(1);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, [page, search, startDate, endDate]);

  return (
    <div className="space-y-8 px-5 py-5 relative min-h-screen">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-32 w-[26rem] h-[26rem] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-32 w-[28rem] h-[28rem] rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      {/* Heading */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Contact Messages</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          User contact submissions with search & pagination.
        </p>
      </div>

      {/* Search Bar */}
      <form method="get" className="flex items-center gap-3 w-full md:w-2/3 lg:w-1/2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <GlassInput
            name="search"
            defaultValue={search}
            placeholder="Search by name, email, or message…"
            className="pl-10"
          />
        </div>
        <GlassButton type="submit">Search</GlassButton>
        {search && (
          <a
            href="?"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white underline"
          >
            Clear
          </a>
        )}
      </form>

      {/* Error Message */}
      {error && (
        <GlassCard className="bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">
            ⚠️ {error}
          </p>
        </GlassCard>
      )}

      {/* List */}
      {loading ? (
        <ContactSkeleton />
      ) : contacts.length === 0 ? (
        <GlassCard className="text-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Mail className="h-12 w-12 text-slate-400 dark:text-slate-600" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              No contacts found.
            </p>
            {search && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Try adjusting your search terms.
              </p>
            )}
          </div>
        </GlassCard>
      ) : (
        <>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Showing {contacts.length} contacts
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {contacts.map((item) => (
              <ContactCard key={item.id} item={item} />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          search={search}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}