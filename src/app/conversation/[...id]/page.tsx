"use client";

import { use } from "react";
import ChatWrapper from "@/components/conversation/ChatWrapper";

interface PageProps {
  params: Promise<{ id: string | string[] }>;
}

export default function ConversationPage({ params }: PageProps) {
  const { id } = use(params);
  const idParam = Array.isArray(id) ? id.join("/") : id;
  return <ChatWrapper idParam={idParam} />;
}
