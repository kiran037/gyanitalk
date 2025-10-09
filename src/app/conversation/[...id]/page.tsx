import ChatPage from "@/components/conversation/Chat";
import { getConversation } from "@/components/conversation/fetch";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ unwrap the Promise

  // ✅ Join ["415", "20411"] → "415_20411"
  const chatId = Array.isArray(id) ? id.join("_") : id;

  const data = await getConversation(chatId);

  return (
    <ChatPage
      chatHistory={data.conversation}
      userId={data.userId}
      astroId={data.astroId}
      chatId={data.chatId}
    />
  );
}
