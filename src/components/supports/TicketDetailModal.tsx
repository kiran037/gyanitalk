// components/supports/TicketDetailModal.tsx
import { Modal } from "../adminUI/Modal";
import { Button } from "../adminUI/Button";
import { User, Mail, Phone, Calendar, Tag, Star, MessageSquare, Clock } from "lucide-react";
import { useState } from "react";

interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  ticketStatus: string;
  chatId: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    contactNo: string;
  } | null;
  help_support: {
    id: string;
    name: string;
  } | null;
  ticketreview: Array<{
    id: number;
    rating: number | null;
    review: string | null;
    created_at: string;
  }>;
}

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: TicketData | null;
  onStatusUpdate: () => void;
}

export function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
  onStatusUpdate,
}: TicketDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!ticket) return null;

  const statusOptions = [
    "Open",
    "In Progress",
    "Awaiting Response",
    "Resolved",
    "Closed",
    "Reopened",
  ];

  const statusColors: Record<string, string> = {
    Open: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    "In Progress": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    "Awaiting Response": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    Resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    Reopened: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === ticket.ticketStatus) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/support/tickets/${ticket.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketStatus: selectedStatus,
          modifiedBy: 1, // Replace with actual user ID
        }),
      });

      if (response.ok) {
        onStatusUpdate();
        setSelectedStatus("");
      }
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getAverageRating = () => {
    const validRatings = ticket.ticketreview.filter((r) => r.rating !== null);
    if (validRatings.length === 0) return null;
    const avg = validRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / validRatings.length;
    return avg.toFixed(1);
  };

  const avgRating = getAverageRating();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ticket Details" size="xl">
      <div className="space-y-6">
        {/* Header with Ticket Number & Status */}
        <div className="flex items-center justify-between bg-gradient-to-br from-[#FF6B35]/10 to-[#FFB347]/10 dark:from-[#FF6B35]/5 dark:to-[#FFB347]/5 rounded-xl p-6 border border-[#FF6B35]/20">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ticket ID</p>
            <h3 className="text-2xl font-bold text-[#FF6B35]">{ticket.ticketNumber}</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Status</p>
            <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold ${statusColors[ticket.ticketStatus]}`}>
              {ticket.ticketStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subject & Description */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{ticket.subject}</h4>
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
                <p className="text-sm text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* Category & Chat Link */}
            <div className="grid grid-cols-2 gap-4">
              {ticket.help_support && (
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-[#FF6B35]" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Category</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.help_support.name}</p>
                </div>
              )}
              {ticket.chatId && (
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-[#FF6B35]" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">Chat ID</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.chatId}</p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            {ticket.ticketreview.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Reviews & Ratings</h4>
                  {avgRating && (
                    <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                      <span className="text-sm font-bold text-yellow-800 dark:text-yellow-400">{avgRating}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {ticket.ticketreview.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        {review.rating && (
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating!
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                      </div>
                      {review.review && (
                        <p className="text-sm text-gray-900 dark:text-white">{review.review}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Customer Info */}
            {ticket.user && (
              <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Customer Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB347] flex items-center justify-center text-white font-bold">
                      {ticket.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{ticket.user.name}</p>
                      <p className="text-xs text-gray-500">ID: {ticket.user.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="break-all">{ticket.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{ticket.user.contactNo}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Changer */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Update Status</h4>
              <select
                value={selectedStatus || ticket.ticketStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/50 mb-3"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleStatusUpdate}
                loading={updatingStatus}
                disabled={!selectedStatus || selectedStatus === ticket.ticketStatus}
              >
                Update Status
              </Button>
            </div>

            {/* Timestamps */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Created</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(ticket.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Last Updated</p>
                    <p className="text-sm text-gray-900 dark:text-white">{formatDate(ticket.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}