"use server"
const prisma = require("../../prismaClient");
import FirestoreService from "@/services/firestore_services";

export async function getConversation(chatId: string, nextPageToken?: string) {

  if (!chatId || !chatId.includes("_")) {
    throw new Error(`Invalid chatId format: ${chatId}`);
  }

  const firestoreService = new FirestoreService();
  const [astroId, userId] = chatId.split("_");

  // ✅ Fetch only once
  const chatData = await firestoreService.getFullChat(chatId, userId);

  // ✅ Sort by createdAt
  const allMessages = (chatData?.messages || []).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const user = await prisma.users.findFirst({
    where: { id: Number(userId) },
    select: { id: true, name: true, profile: true },
  });

  const astro = await prisma.users.findFirst({
    where: { id: Number(astroId) },
    select: { id: true, name: true, profile: true },
  });

  return {
    conversation: allMessages.map((m: any) => ({
      ...m,
      sender_id: Number(m.sender_id),
    })),
    userId: Number(userId),
    astroId: Number(astroId),
    chatId,
    user,
    astro,
    nextPageToken: nextPageToken || null,
  };
}

export async function sendChatMessage(
  chatId: string,
  senderId: number,
  receiverId: number,
  message: string,
  messageId: string
) {
  const firestoreService = new FirestoreService();
  try {
    const res = await firestoreService.sendMessage(
      chatId,
      String(senderId),
      String(receiverId),
      message,
      messageId
    );
    return { success: true, data: { ...res, messageId } };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: String(error) };
  }
}
