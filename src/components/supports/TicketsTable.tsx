// components/supports/TicketsTable.tsx
import { Eye, Trash2, User, Calendar, Tag, Star } from "lucide-react";
import { Button } from "../adminUI/Button";
import { motion } from "framer-motion";

interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  ticketStatus: string;
  user: { name: string; email: string } | null;
  help_support: { name: string } | null;
  ticketreview: Array<{ rating: number | null }>;
  created_at: string;
}

interface TicketsTableProps {
  tickets: TicketData[];
  loading: boolean;
  onViewDetails: (ticket: TicketData) => void;
  onDelete: (ticket: TicketData) => void;
  pagination: any;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function TicketsTable({
  tickets,
  loading,
  onViewDetails,
  onDelete,
  pagination,
  currentPage,
  onPageChange,
}: TicketsTableProps) {
  const statusColors: Record<string, string> = {
    Open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "In Progress": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    "Awaiting Response": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAverageRating = (reviews: Array<{ rating: number | null }>) => {
    const validRatings = reviews.filter((r) => r.rating !== null);
    if (validRatings.length === 0) return null;
    const avg = validRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / validRatings.length;
    return avg.toFixed(1);
  };

  if (loading) {
    return (
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-8 text-center">
        <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Tickets Found</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200/60 dark:border-gray-700/60">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Rating</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
            {tickets.map((ticket, index) => {
              const avgRating = getAverageRating(ticket.ticketreview);
              return (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#FF6B35]">{ticket.ticketNumber}</p>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{ticket.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{formatDate(ticket.created_at)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {ticket.user ? (
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.user.name}</p>
                          <p className="text-xs text-gray-500">{ticket.user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {ticket.help_support ? (
                      <span className="inline-flex px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300">
                        {ticket.help_support.name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${statusColors[ticket.ticketStatus] || statusColors.Open}`}>
                      {ticket.ticketStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {avgRating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{avgRating}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No reviews</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => onViewDetails(ticket)}
                        ariaLabel="View details"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 className="w-4 h-4 text-red-500" />}
                        onClick={() => onDelete(ticket)}
                        ariaLabel="Delete ticket"
                      />
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((currentPage - 1) * pagination.limit) + 1} to{" "}
              {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} tickets
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pageNum = i + 1;
                  if (pagination.totalPages > 5) {
                    if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}