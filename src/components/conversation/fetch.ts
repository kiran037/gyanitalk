"use server"
const prisma = require("../../prismaClient");
import FirestoreService from "@/services/firestore_services";

export async function getConversation(chatId: string, nextPageToken?: string) {
  const firestoreService = new FirestoreService();

  // chatId format = astroId_userId
  const [astroId, userId] = chatId.split("_");

  // Firestore messages
  const data = await firestoreService.getFullChat(chatId, userId);

  // Attach DB user info (optional)
  const user = await prisma.users.findFirst({
    where: { id: Number(userId) },
    select: { id: true, name: true, avatar: true },
  });

  const astro = await prisma.users.findFirst({
    where: { id: Number(astroId) },
    select: { id: true, name: true, avatar: true },
  });

  return {
    conversation: data.messages.map((m: any) => ({
      ...m,
      sender_id: Number(m.sender_id), // 🔹 force number
    })),
    userId: Number(userId),
    astroId: Number(astroId),
    chatId,
    user,
    astro,
    nextPageToken: nextPageToken || null,
  };
}
