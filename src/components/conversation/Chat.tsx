"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import "@/css/chat.css";
import { getConversation, sendChatMessage } from "@/components/conversation/fetch"; // ✅ direct import — no /api call

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

   // ✅ Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Poll new messages every 10 seconds, merge with existing
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getConversation(chatId);
        if (data?.conversation?.length) {
          setMessages((prev) => {
            const existing = new Set(prev.map((m) => m.messageId));
            const newOnes = data.conversation.filter(
              (m) => m.messageId && !existing.has(m.messageId)
            );
            return [...prev, ...newOnes]
              .map((msg) => ({
                ...msg,
                sender_id: String(msg.sender_id),
                receiver_id: msg.receiver_id ? String(msg.receiver_id) : undefined,
              }))
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
          });
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    // fetch immediately on page load
    fetchData();

    // continue polling every 10s
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [chatId]);

  // ✅ Handle send (user or astro)
  const handleSend = async (role: "sender" | "receiver") => {
    if (!newMessage.trim()) return;

     const isSender = role === "sender";
     const messageId = `${Date.now()}-${Math.random()}`; // single source of truth

     // temporary local message with unique ID
     const localMessage: Chat = {
      messageId,
      message: newMessage.trim(),
      sender_id: isSender ? String(userId) : String(astroId),
      receiver_id: isSender ? String(astroId) : String(userId),
      createdAt: new Date().toISOString(),
    };
     // show message instantly in UI
    setMessages((prev) => [...prev, localMessage]);
    setNewMessage("");

    // call Firestore via server action
     try {
      // ✅ dynamically send correct IDs
      const res = await sendChatMessage(
        chatId,
        isSender ? userId : astroId,
        isSender ? astroId : userId,
        newMessage.trim(),
        messageId // 👈 send same ID
      );

      if (!res.success) {
        console.error("❌ Failed to send:", res.error);
      }
    } catch (error) {
      console.error("🔥 Error sending:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-5 mb-5 border border-gray-300 rounded-lg overflow-hidden">
      <div className="messaging">
        <div className="inbox_msg">
          <div className="mesgs">
            <div className="msg_history">
              {/* Chat messages */}
                {messages.length === 0 ? (
                  <div className="incoming_msg">
                    <div className="incoming_msg_img">
                      <img src="https://ptetutorials.com/images/user-profile.png" alt="no chat" />
                    </div>
                    <div className="received_msg">
                      <div className="received_withd_msg">
                        <p>No Chat available</p>
                        <span className="time_date">
                          {format(new Date(), "hh:mm a")} |{" "}
                          {format(new Date(), "MMMM dd")}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((chat, idx) => {
                    const isUserSender = Number(chat.sender_id) === userId;
                    const isEndedChat = chat.message.includes("ended chat");

                    // ✅ User → left side | Astro → right side
                  if (isUserSender) {
                  // INCOMING (receiver’s messages)
                    return (
                      <div className="incoming_msg" key={idx}>
                      {isEndedChat ? (
                        <div className="received_msg" style={{ width: "100%", padding: 0 }}>
                          <div className="received_withd_msg" style={{ width: "100%", textAlign: "center" }}>
                            <p style={{ borderRadius: "12px 15px 15px 12px", background: "#f88e0f", color: "#fff" }}>
                              {chat.message}
                            </p>
                            <span className="time_date">
                              {format(new Date(chat.createdAt), "hh:mm a")} |{" "}
                              {format(new Date(chat.createdAt), "MMMM dd")}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="incoming_msg_img">
                            <img src="https://ptetutorials.com/images/user-profile.png" alt="user" />
                          </div>
                          <div className="received_msg">
                            <div className="received_withd_msg">
                              <p>{chat.message}</p>
                              <span className="time_date">
                                {format(new Date(chat.createdAt), "hh:mm a")} |{" "}
                                {format(new Date(chat.createdAt), "MMMM dd")}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                } else {
                  // OUTGOING (current user messages)
                  return (
                    <div className="outgoing_msg" key={idx}>
                      <div className="sent_msg" style={isEndedChat ? { width: "100%", textAlign: "center" } : {}}>
                        <p
                          style={
                            isEndedChat
                              ? { borderRadius: "12px 15px 15px 12px", background: "#f88e0f", color: "#fff" }
                              : {}
                          }
                        >
                          {chat.message}
                        </p>
                        <span className="time_date">
                          {format(new Date(chat.createdAt), "hh:mm a")} |{" "}
                          {format(new Date(chat.createdAt), "MMMM dd")}
                        </span>
                      </div>
                    </div>
                  );
                }
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>

    {/* Message Input Section */}
    <div className="flex items-center gap-3 p-4 border-t border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
      <button
        onClick={() => handleSend("receiver")}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-150"
      >
        👤 Astro
      </button>
      <input
        type="text"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-150"
        onKeyDown={(e) => e.key === "Enter" &&  handleSend("sender")}
      />
      <button
        onClick={() => handleSend("sender")}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-500 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-150"
      >
        💬 User
      </button>
    </div>
  </div>
  );
};

export default ChatPage;
