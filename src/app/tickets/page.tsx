// /src/app/tickets/page.tsx
"use client";

import { use, useEffect, useState, useCallback } from "react";
import { X, Eye, Ticket, User, Phone, CalendarDays } from "lucide-react";
import { createPortal } from "react-dom";
import { useToast } from "@/components/Toast/ToastProvider";
import { getTickets, closeTickets } from "./fetch";

/* ---------------- Utilities ---------------- */
const cx = (...c: Array<string | false | null | undefined>) =>
  c.filter(Boolean).join(" ");

/* ---------------- Glass Atoms ---------------- */
function GlassCard({
  children,
  className = "",
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cx(
        "relative overflow-hidden rounded-2xl p-5",
        "bg-white/60 dark:bg-white/[0.07]",
        "border border-white/30 dark:border-white/10",
        "backdrop-blur-2xl shadow-md transition-all",
        className
      )}
    >
      {children}
    </div>
  );
}

function GlassButton(
  { children, className = "", variant = "primary", ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger";
  }
) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50";
  const styles = {
    primary:
      "text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
    secondary:
      "text-slate-900 dark:text-white bg-white/70 dark:bg-white/[0.08] border border-white/30 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/[0.12]",
    danger:
      "text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700",
  } as const;
  return (
    <button {...rest} className={cx(base, styles[variant], className)}>
      {children}
    </button>
  );
}

function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-xl px-4 py-2.5 text-sm outline-none",
        "bg-white/70 dark:bg-white/[0.08]",
        "border border-white/30 dark:border-white/10",
        "focus:ring-2 focus:ring-blue-500/60 focus:border-transparent",
        "text-slate-900 dark:text-slate-100",
        "placeholder:text-slate-500 dark:placeholder:text-slate-400",
        props.className
      )}
    />
  );
}

function GlassModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />
      <div
        className={`relative w-full ${maxWidth} rounded-2xl bg-white/70 dark:bg-white/[0.07] backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/40 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ---------------- Types ---------------- */
type TicketReview = {
  id: number;
  review: string | null;
  rating: number | null;
  created_at: string;
  userId: number;
};

type Ticket = {
  id: number;
  ticketNumber: string;
  subject: string;
  ticketStatus: string;
  userName: string;
  contactNo: string;
  created_at: string;
  description: string;
  ticketReview: TicketReview[];
};

/* ---------------- Ticket Item ---------------- */
function TicketItem({
  item,
  onClose,
  onReview,
}: {
  item: Ticket;
  onClose: (id: number) => void;
  onReview: (reviews: TicketReview[]) => void;
}) {
  return (
    <GlassCard>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            <Ticket className="inline h-4 w-4 mr-1" />
            {item.ticketNumber} — {item.subject}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {item.description}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <User className="inline h-3 w-3 mr-1" />
            {item.userName} ({item.contactNo}) •{" "}
            <CalendarDays className="inline h-3 w-3 mr-1" />
            {new Date(item.created_at).toLocaleDateString("en-GB")}
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          {item.ticketStatus !== "CLOSED" && (
            <GlassButton variant="danger" onClick={() => onClose(item.id)}>
              Close
            </GlassButton>
          )}
          <GlassButton variant="secondary" onClick={() => onReview(item.ticketReview)}>
            <Eye className="h-4 w-4" /> Reviews
          </GlassButton>
        </div>
      </div>
      <span
        className={cx(
          "absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full",
          item.ticketStatus === "CLOSED"
            ? "bg-rose-500/80 text-white"
            : "bg-green-500/80 text-white"
        )}
      >
        {item.ticketStatus}
      </span>
    </GlassCard>
  );
}

/* ---------------- Main Page ---------------- */
export default function TicketPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = use(searchParams);
  const page = parseInt(params?.page || "1", 10);
  const search = params?.search || "";
  const toast = useToast();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(true);

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<TicketReview[]>([]);
  const [closing, setClosing] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTickets({ page, limit: 10, search });
      setTickets(res.tickets || []);
      setTotalPages(res.totalPages || 1);
      setCurrentPage(res.currentPage || page);
    } catch {
      toast("error", "Error", "Failed to fetch tickets");
    }
    setLoading(false);
  }, [page, search, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  async function handleCloseTicket() {
    if (!selectedTicketId) return;
    setClosing(true);
    const res = await closeTickets(selectedTicketId);
    setClosing(false);
    if (res.success) {
      toast("success", "Closed", "Ticket closed successfully");
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicketId ? { ...t, ticketStatus: "CLOSED" } : t
        )
      );
      setCloseModalOpen(false);
    } else {
      toast("error", "Error", "Failed to close ticket");
    }
  }

  return (
    <div className="space-y-8 relative">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-32 w-[26rem] h-[26rem] rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-32 w-[28rem] h-[28rem] rounded-full bg-purple-400/20 blur-3xl" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tickets</h2>
        <form method="get" className="flex gap-2">
          <GlassInput
            name="search"
            defaultValue={search}
            placeholder="Search by name or contactNo"
          />
          <GlassButton type="submit">Search</GlassButton>
        </form>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} className="animate-pulse h-24" />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <GlassCard className="text-center text-slate-600 dark:text-slate-300">
          No tickets found
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {tickets.map((item) => (
            <TicketItem
              key={item.id}
              item={item}
              onClose={(id) => {
                setSelectedTicketId(id);
                setCloseModalOpen(true);
              }}
              onReview={(reviews) => {
                if (!reviews || reviews.length === 0) {
                  toast("info", "Info", "No reviews available");
                  return;
                }
                setSelectedReviews(reviews);
                setReviewModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const isCurrent = pageNum === currentPage;
          return (
            <a
              key={i}
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
              className={cx(
                "px-3 py-1 rounded-full border text-sm",
                isCurrent
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  : "bg-white/70 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200"
              )}
            >
              {pageNum}
            </a>
          );
        })}
      </div>

      {/* Close Modal */}
      <GlassModal
        open={closeModalOpen}
        onClose={() => setCloseModalOpen(false)}
        title="Close Ticket"
      >
        <p className="mb-6">Are you sure you want to close this ticket?</p>
        <div className="flex justify-end gap-3">
          <GlassButton variant="secondary" onClick={() => setCloseModalOpen(false)}>
            Cancel
          </GlassButton>
          <GlassButton variant="danger" onClick={handleCloseTicket} disabled={closing}>
            {closing ? "Closing..." : "Yes, Close it!"}
          </GlassButton>
        </div>
      </GlassModal>

      {/* Review Modal */}
      <GlassModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Ticket Reviews"
      >
        {selectedReviews.map((rev) => (
          <div
            key={rev.id}
            className="border-b border-white/20 dark:border-white/5 py-3 last:border-none"
          >
            <p className="font-medium text-slate-900 dark:text-white">
              {rev.review || "No review text"}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Rating: {rev.rating || "N/A"} •{" "}
              {new Date(rev.created_at).toLocaleDateString("en-GB")}
            </p>
          </div>
        ))}
        <div className="flex justify-end mt-4">
          <GlassButton variant="secondary" onClick={() => setReviewModalOpen(false)}>
            Close
          </GlassButton>
        </div>
      </GlassModal>
    </div>
  );
}
