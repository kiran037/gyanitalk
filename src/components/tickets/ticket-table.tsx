"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui-elements/table";
import { closeTickets } from "./fetch";
import { cn } from "@/lib/utils"; // 👈 clsx/utility import करो
import { useTransition } from "react";

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

type Props = {
  tickets: Ticket[];   // 👈 plural
  totalPages: number;
  currentPage: number;
  page: number;
  search: string;
};

export default function TicketTable({
  tickets: initialTickets,
  totalPages,
  currentPage,
  page,
  search,
}: Props) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB"); // dd-mm-yyyy
  };

   // Local state for tickets
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<TicketReview[]>([]);

  // Close Ticket
  const handleClose = async () => {
    if (!selectedTicketId) return;
    setLoading(true);
    const res = await closeTickets(selectedTicketId);
    setLoading(false);

    if (res.success) {
      toast.success("✅ Ticket closed successfully");
      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicketId ? { ...t, ticketStatus: "CLOSED" } : t
        )
      );
      setCloseModalOpen(false);
    } else {
      toast.error("❌ Failed to close ticket");
    }
  };

  // Open Review Modal
  const handleOpenReview = (reviews: TicketReview[]) => {
    if (!reviews || reviews.length === 0) {
      toast("No reviews available");
      return;
    }
    setSelectedReviews(reviews);
    setReviewModalOpen(true);
  };

  return (
    <div className="rounded-2xl border border-stroke bg-white shadow-md dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5 p-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">TICKET NO</TableHead>
            <TableHead className="text-center">SUBJECT</TableHead>
            <TableHead className="text-center">STATUS</TableHead>
            <TableHead className="text-center">Customer</TableHead>
            <TableHead className="text-center">CREATED DATE</TableHead>
            <TableHead className="text-center">DESCRIPTION</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tickets.map((item) => (
            <TableRow key={item.id}>

              {/* Ticket Number */}
              <TableCell>{item.ticketNumber}</TableCell>

              {/* Subject */}
              <TableCell className="text-center">{item.subject}</TableCell>

              {/* Status */}
              <TableCell className="text-center">{item.ticketStatus}</TableCell>

              {/* Customer Name + Contact */}
              <TableCell className="text-center">
                {item.userName} - {item.contactNo}
              </TableCell>

              {/* Created Date */}
              <TableCell className="text-center">
                {formatDate(item.created_at)}
              </TableCell>

              {/* Description */}
              <TableCell className="text-center">{item.description}</TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex justify-center items-center">
                  {/* Close Ticket */}
                  {item.ticketStatus !== "CLOSED" && (
                    <button
                      onClick={() => {
                        setSelectedTicketId(item.id);
                        setCloseModalOpen(true)
                      }}
                      className="flex items-center text-red-600 mr-3"
                    >
                      <i data-lucide="x" className="editbtn w-4 h-4 mr-1" />
                      Close Ticket
                    </button>
                  )}

                  {/* Review */}
                  <button
                    onClick={() => handleOpenReview(item.ticketReview)}
                    className="flex items-center mr-3"
                  >
                    <i data-lucide="eye" className="editbtn w-4 h-4 mr-1" />
                    Review
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {/* Empty State */}
          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No tickets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-6 flex justify-end gap-2 flex-wrap text-sm">
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          const isLast = pageNum === totalPages;
          const isCurrent = pageNum === currentPage;
          const shouldShow =
            pageNum <= 3 ||
            pageNum === totalPages ||
            pageNum === currentPage ||
            pageNum === currentPage - 1 ||
            pageNum === currentPage + 1;

          if (!shouldShow) {
            if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return <span key={i}>...</span>;
            }
            return null;
          }

          return (
            <a
              key={i}
              href={`?page=${pageNum}${search ? `&search=${search}` : ""}`}
              className={cn(
                "px-3 py-1 border rounded",
                isCurrent
                  ? "bg-primary text-white"
                  : "bg-white text-black dark:bg-dark dark:text-white"
              )}
            >
              {isLast ? "Last" : pageNum}
            </a>
          );
        })}
      </div>

      {/* Close Ticket Modal */}
      {closeModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-semibold mb-2">Are You Sure?</h2>
              <p className="text-slate-600 mb-6">
                You want to close this ticket!
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Closing..." : "Yes, Close it!"}
                </button>
                <button
                  onClick={() => setCloseModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Ticket Reviews</h2>
              {selectedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="border-b border-gray-200 py-2 last:border-none"
                >
                  <p className="font-medium">{rev.review || "No Review Text"}</p>
                  <p className="text-sm text-gray-500">
                    Rating: {rev.rating || "N/A"} | Date:{" "}
                    {new Date(rev.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}