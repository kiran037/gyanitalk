"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/adminUI/Modal";
import { useToast } from "@/components/Toast/ToastProvider";
import { MessageSquare } from "lucide-react";
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

  useEffect(() => {
    if (isOpen && chatId) {
      fetchChatMessages();
    }
  }, [isOpen, chatId]);

  const fetchChatMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/astrologers/${astrologerId}/chat-messages/${chatId}`
      );
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.messages || []);
        setChatRequest(data.data.chatRequest);
      } else {
        addToast("error", "Error", "Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      addToast("error", "Error", "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chat Messages" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Messages
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This chat doesn't have any messages yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Chat Info */}
          {chatRequest && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <div className="flex items-center gap-3">
                <img
                  src={avatar(chatRequest.user?.profile)}
                  alt={chatRequest.user?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {chatRequest.user?.name || "Unknown User"}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Chat ID: {chatId}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {messages.map((msg: any, index: number) => {
              const isAstrologer = msg.sender_id === chatRequest?.astrologer?.userId;

              return (
                <div
                  key={index}
                  className={`flex ${isAstrologer ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-xl ${
                      isAstrologer
                        ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="text-sm">{msg.message || msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isAstrologer ? "text-white/80" : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.createdAt || msg.created_at).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}