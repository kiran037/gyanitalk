"use client";

import { useEffect, useState } from "react";
import ChatPage from "./Chat";
import { ChatMessage } from "@/types/chat";

interface Props {
  idParam: string | string[];
}

export default function ChatWrapper({ idParam }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatId, setChatId] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [astroId, setAstroId] = useState<number | null>(null);

  useEffect(() => {
    let id = "";
    if (Array.isArray(idParam)) id = idParam[0];
    else if (typeof idParam === "string") id = idParam;

    if (!id.includes("_")) return;

    const [astro, user] = id.split("_");
    setChatId(id);
    setUserId(parseInt(user));
    setAstroId(parseInt(astro));

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${id}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    };

    fetchMessages();
  }, [idParam]);

  if (!chatId || userId === null || astroId === null)
    return <div>Invalid chat ID</div>;

  return (
    <ChatPage
      chatHistory={messages}
      userId={userId}
      astroId={astroId}
      chatId={chatId}
    />
  );
}
