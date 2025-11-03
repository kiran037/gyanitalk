"use server";
const prisma = require("../../prismaClient");
import FirestoreService from "@/services/firestore_services";

/** Resolve the astrologer’s users.id whether chatId uses astrologers.id or users.id */
async function resolveAstroUserId(rawAstroIdNum: number): Promise<number> {
  // If it's an astrologers.id, fetch its users.id
  const astroRow = await prisma.astrologers.findFirst({
    where: { id: Number(rawAstroIdNum) },
    select: { userId: true },
  });
  if (astroRow?.userId) return Number(astroRow.userId);

  // Otherwise assume it's already a users.id
  return Number(rawAstroIdNum);
}

export async function getConversation(chatId: string, nextPageToken?: string) {
  if (!chatId || !chatId.includes("_")) {
    throw new Error(`Invalid chatId format: ${chatId}`);
  }

  const firestoreService = new FirestoreService();
  const [astroPart, userPart] = chatId.split("_");
  const rawAstroId = Number(astroPart);
  const userUserId = Number(userPart);

  // Normalize to the IDs your UI should use everywhere (both are users.id)
  const astroUserId = await resolveAstroUserId(rawAstroId);

  // Get Firestore chat (room key stays the original chatId)
  const chatData = await firestoreService.getFullChat(chatId, String(userUserId));

  // Sort + normalize fields
  const allMessages = (chatData?.messages || [])
    .map((m: any) => ({
      ...m,
      sender_id: Number(m.sender_id),
      receiver_id: m.receiver_id != null ? Number(m.receiver_id) : undefined,
    }))
    .sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  // Fetch user (customer)
  const user = await prisma.users.findFirst({
    where: { id: userUserId },
    select: { id: true, name: true, profile: true },
  });

  // Fetch astrologer display from both tables (prefer astrologers table)
  const astroUser = await prisma.users.findFirst({
    where: { id: astroUserId },
    select: { id: true, name: true, profile: true },
  });

  const astroProfileRow = await prisma.astrologers.findFirst({
    where: {
      OR: [{ id: rawAstroId }, { userId: astroUserId }],
    },
    select: { name: true, profileImage: true },
  });

  const astro = {
    id: astroUserId,
    name: astroProfileRow?.name ?? astroUser?.name ?? null,
    profile: astroProfileRow?.profileImage ?? astroUser?.profile ?? null,
  };

  const userDisplay = {
    id: userUserId,
    name: user?.name ?? null,
    profile: user?.profile ?? null,
  };

  return {
    conversation: allMessages,
    // ⬇️ Use these for comparisons and for sending
    userId: Number(userDisplay.id),
    astroId: Number(astro.id),
    chatId,
    user: userDisplay,
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
