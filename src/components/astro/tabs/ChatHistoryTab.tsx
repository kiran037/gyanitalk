"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import { SearchInput } from "@/components/adminUI/SearchInput";
import { Button } from "@/components/adminUI/Button";
import { MessageSquare, Calendar, Clock, Eye, Filter } from "lucide-react";
import { avatar } from "@/lib/images";
import { motion } from "framer-motion";
import { ChatMessagesModal } from "../modals/ChatMessagesModal";

interface ChatHistoryTabProps {
  astrologerId: string;
}

export function ChatHistoryTab({ astrologerId }: ChatHistoryTabProps) {
  const addToast = useToast();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ totalEarnings: 0 });

  // Filters
  const [chatStatus, setChatStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [showMessagesModal, setShowMessagesModal] = useState(false);

  useEffect(() => {
    fetchChatHistory();
  }, [astrologerId, pagination.page, chatStatus, fromDate, toDate]);

  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (chatStatus) params.append("chatStatus", chatStatus);
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);

      const response = await fetch(`/api/astrologers/${astrologerId}/chat-history?${params}`);
      const data = await response.json();

      if (data.success) {
        setChats(data.data);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        addToast("error", "Error", data.error || "Failed to fetch chat history");
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
      addToast("error", "Error", "Failed to fetch chat history");
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessages = async (chat: any) => {
    setSelectedChat(chat);
    setShowMessagesModal(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Chat History
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Earnings: <span className="font-semibold text-[#FF6B35]">₹{stats.totalEarnings}</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={chatStatus}
                onChange={(e) => setChatStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>
          </motion.div>
        )}

        {/* Chat List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Chat History
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This astrologer hasn't had any chat sessions yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat, index) => (
              <motion.div
                key={chat.id}
                className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* User Avatar */}
                    <img
                      src={avatar(chat.user?.profile)}
                      alt={chat.user?.name || "User"}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    {/* Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {chat.user?.name || "Unknown User"}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(chat.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {chat.chat_duration || "0"} min
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${chat.chatStatus === "Completed"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                            : chat.chatStatus === "Accepted"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                              : "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400"
                          }`}>
                          {chat.chatStatus}
                        </span>
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{chat.deductionFromAstrologer || 0}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Rate: ₹{chat.chatRate}/min
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {chat.chatStatus === "Completed" && (
                    <Button
                      className="ml-6"
                      variant="outline"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => handleViewMessages(chat)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Chat Messages Modal */}
      {showMessagesModal && selectedChat && (
        <ChatMessagesModal
          isOpen={showMessagesModal}
          onClose={() => {
            setShowMessagesModal(false);
            setSelectedChat(null);
          }}
          astrologerId={astrologerId}
          chatId={selectedChat.chatId}
        />
      )}
    </>
  );
}