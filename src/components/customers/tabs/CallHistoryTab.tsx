import { useState, useEffect } from "react";
import { Phone, Video, Clock } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { avatar } from "@/lib/images";

interface Call {
  id: number;
  astrologerId: string | null;
  astrologerName: string;
  astrologerImage: string | null;
  callStatus: string | null;
  duration: string;
  rate: string;
  deduction: string;
  callType: string;
  isFreeSession: boolean;
  createdAt: Date;
}

interface CallHistoryTabProps {
  customerId: string;
}

export default function CallHistoryTab({ customerId }: CallHistoryTabProps) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCalls();
  }, [page]);

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/calls?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setCalls(data.data.calls);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch calls:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading call history...</p>
      </div>
    );
  }

  if (calls.length === 0) {
    return (
      <div className="p-12 text-center">
        <Phone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Call History</h3>
        <p className="text-gray-600 dark:text-gray-400">This customer hasn't made any calls yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="space-y-4">
        {calls.map((call) => (
          <div
            key={call.id}
            className="flex items-start gap-4 p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
          >
            {/* Astrologer Avatar */}
            <div className="flex-shrink-0">
              <img
                src={avatar(call.astrologerImage)}
                alt={call.astrologerName}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>

            {/* Call Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">{call.astrologerName}</h4>
                <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded">
                  {call.callType === "Video" ? (
                    <Video className="w-3 h-3" />
                  ) : (
                    <Phone className="w-3 h-3" />
                  )}
                  <span>{call.callType}</span>
                </div>
                {call.isFreeSession && (
                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                    Free
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded ${
                    call.callStatus === "Completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {call.callStatus || "N/A"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{call.duration || "N/A"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Rate:</span>
                  <span>₹{call.rate || "0"}/min</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Charged:</span>
                  <span className="text-red-600 dark:text-red-400">₹{parseFloat(call.deduction).toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(call.createdAt)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}