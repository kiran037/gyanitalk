import { useState, useEffect } from "react";
import { Eye, Clock, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/adminUI/Button";
import { avatar } from "@/lib/images";
import ChatViewModal from "../ChatViewModal";

interface Chat {
  id: number;
  chatId: string | null;
  astrologerId: string;
  astrologerName: string;
  astrologerImage: string | null;
  chatStatus: string | null;
  duration: string;
  rate: string;
  deduction: string;
  isFreeSession: boolean;
  createdAt: Date;
  hasMessages: boolean;
}

interface ChatHistoryTabProps {
  customerId: string;
}

export default function ChatHistoryTab({ customerId }: ChatHistoryTabProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    fetchChats();
  }, [page]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/chats?page=${page}&limit=20`);
      const data = await response.json();

      if (data.success) {
        setChats(data.data.chats);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
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
        <p className="text-gray-600 dark:text-gray-400">Loading chat history...</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Chat History</h3>
        <p className="text-gray-600 dark:text-gray-400">This customer hasn't had any chat sessions yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="space-y-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-start gap-4 p-4 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              {/* Astrologer Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={avatar(chat.astrologerImage)}
                  alt={chat.astrologerName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </div>

              {/* Chat Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{chat.astrologerName}</h4>
                  {chat.isFreeSession && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                      Free
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      chat.chatStatus === "Completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}
                  >
                    {chat.chatStatus || "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{chat.duration || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Rate:</span>
                    <span>₹{chat.rate || "0"}/min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Charged:</span>
                    <span className="text-red-600 dark:text-red-400">₹{parseFloat(chat.deduction).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(chat.createdAt)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {chat.hasMessages && chat.chatId ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedChatId(chat.chatId)}
                    icon={<Eye className="w-4 h-4" />}
                  >
                    View Chat
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" disabled>
                    No Messages
                  </Button>
                )}
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

      {/* Chat View Modal */}
      {selectedChatId && (
        <ChatViewModal
          isOpen={!!selectedChatId}
          onClose={() => setSelectedChatId(null)}
          chatId={selectedChatId}
          customerId={customerId}
        />
      )}
    </>
  );
}