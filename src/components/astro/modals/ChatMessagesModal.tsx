"use client";

import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { useToast } from "@/components/Toast/ToastProvider";
import { MessageSquare, AlertCircle } from "lucide-react";
import { avatar } from "@/lib/images";

interface ChatMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  astrologerId: string;
  chatId: string;
}

export function ChatMessagesModal({
  isOpen,
  onClose,
  astrologerId,
  chatId,
}: ChatMessagesModalProps) {
  const addToast = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [chatRequest, setChatRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref for auto-scrolling to bottom
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setChatRequest(null);
      setError(null);
    }
  }, [isOpen]);

  // Fetch when opening
  useEffect(() => {
    if (isOpen && chatId) {
      fetchChatMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, chatId]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchChatMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/astrologers/${astrologerId}/chat-messages/${chatId}`
      );
      
      if (!response.ok) throw new Error("Failed to connect");

      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages || []);
        setChatRequest(data.data.chatRequest);
      } else {
        setError(data.error || "Failed to load messages");
        addToast("error", "Error", "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("Network error occurred");
      addToast("error", "Error", "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const getMessageTime = (msg: any) => {
    const dateVal = msg.createdAt || msg.created_at;
    if (!dateVal) return "";
    return new Date(dateVal).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chat History" size="lg">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading conversation...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-red-500">
           <AlertCircle className="w-12 h-12 opacity-50 mb-2" />
           <p>{error}</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Messages Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This conversation appears to be empty.
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full max-h-[70vh]">
          {/* Sticky Header Info */}
          {chatRequest && (
            <div className="flex items-center gap-3 p-4 mb-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 shrink-0">
              <img
                src={avatar(chatRequest.user?.profile)}
                alt={chatRequest.user?.name || "User"}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {chatRequest.user?.name || "Unknown User"}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                   <span>ID: {chatId}</span>
                   <span>•</span>
                   <span>{messages.length} messages</span>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-[300px]">
            {messages.map((msg: any, index: number) => {
              // Determine if sender is the astrologer (Right side)
              const isAstrologer = Number(msg.sender_id) === Number(chatRequest?.astrologer?.userId);

              return (
                <div
                  key={index}
                  className={`flex ${isAstrologer ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                      isAstrologer
                        ? "bg-gradient-to-br from-[#FF6B35] to-[#FF9E45] text-white rounded-br-sm"
                        : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.message || msg.content || msg.text || <span className="italic opacity-50">Empty message</span>}
                    </p>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        isAstrologer ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {getMessageTime(msg)}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Invisible div to scroll to */}
            <div ref={scrollRef} />
          </div>
        </div>
      )}
    </Modal>
  );
}