"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";

export interface Chat {
  name?: string;
  message: string;
  messageId?: string;
  sender_id: string;
  receiver_id?: string;
  replymsg?: string;
  createdAt: string;
}

export interface ChatProps {
  chatHistory: Chat[];
  userId: number;
  astroId: number;
  chatId: string;
}

const ChatPage = ({ chatHistory, userId, astroId, chatId }: ChatProps) => {
  const [messages, setMessages] = useState<Chat[]>(chatHistory);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll every 5 seconds for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/chat/${chatId}`);
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [chatId]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Optimistic UI update
    const messageObj: Chat = {
      sender_id: String(userId),
      message: newMessage.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, messageObj]);
    setNewMessage("");

    // API call
    try {
      await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.trim(),
          sender_id: userId,
        }),
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-5 border border-gray-300 rounded-lg overflow-hidden">
      {/* Chat messages */}
      <div className="p-6 space-y-4 h-[500px] overflow-y-auto bg-white">
        {messages.length === 0 ? (
          <div className="text-gray-500">No chat available</div>
        ) : (
          messages.map((chat, idx) => {
            const isSender = Number(chat.sender_id) === userId;
            const time = format(new Date(chat.createdAt), "hh:mm a");
            return (
              <div
                key={`${chat.sender_id}-${chat.createdAt}-${idx}`}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                    isSender
                      ? "bg-blue-700 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {chat.message}
                  <div className="text-xs text-gray-400 mt-1 text-right">
                    {time}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <div className="flex p-4 border-t border-gray-300 bg-gray-50">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-3 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
