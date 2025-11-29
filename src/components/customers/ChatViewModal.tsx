import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // ADD THIS IMPORT
import { X, User } from "lucide-react";
import { avatar } from "@/lib/images";

interface Message {
  message: string;
  sender_id: number;
  receiver_id?: number;
  createdAt: string;
}

interface ChatUser {
  id: number;
  name: string;
  profile: string | null;
}

interface ChatViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  customerId: string;
}

export default function ChatViewModal({
  isOpen,
  onClose,
  chatId,
  customerId,
}: ChatViewModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<ChatUser | null>(null);
  const [astro, setAstro] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && chatId) {
      fetchChatMessages();
    }
  }, [isOpen, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchChatMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${customerId}/chats/${chatId}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data.conversation);
        setUser(data.data.user);
        setAstro(data.data.astro);
      }
    } catch (error) {
      console.error("Failed to fetch chat messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen || !mounted) return null; // UPDATE THIS LINE

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl transform transition-all flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {user && astro && (
                <>
                  <div className="flex items-center gap-2">
                    <img
                      src={avatar(user.profile)}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Customer</p>
                    </div>
                  </div>

                  <div className="text-gray-400">↔</div>

                  <div className="flex items-center gap-2">
                    <img
                      src={avatar(astro.profile)}
                      alt={astro.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{astro.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Astrologer</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-900/30">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <User className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No messages in this conversation</p>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => {
                  const isCustomer = user && msg.sender_id === user.id;
                  const sender = isCustomer ? user : astro;

                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 ${isCustomer ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <img
                          src={avatar(sender?.profile)}
                          alt={sender?.name || "User"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[70%] ${
                          isCustomer
                            ? "bg-gradient-to-r from-[#FF6B35] to-[#FFB347] text-white"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                        } rounded-2xl px-4 py-3 shadow-sm`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isCustomer ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              {messages.length} messages • Chat ID: {chatId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // WRAP RETURN WITH PORTAL
  return createPortal(modalContent, document.body);
}