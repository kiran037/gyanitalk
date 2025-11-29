// app/api/customers/[id]/chats/[chatId]/route.ts
// GET: Get specific chat conversation messages

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import FirestoreService from "@/services/firestore_services";

interface RouteParams {
  params: {
    id: string;
    chatId: string;
  };
}

/** Resolve the astrologer's users.id whether chatId uses astrologers.id or users.id */
async function resolveAstroUserId(rawAstroIdNum: number): Promise<number> {
  const astroRow = await prisma.astrologers.findFirst({
    where: { id: Number(rawAstroIdNum) },
    select: { userId: true },
  });
  if (astroRow?.userId) return Number(astroRow.userId);
  return Number(rawAstroIdNum);
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id, chatId } = await params;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    if (!chatId || !chatId.includes("_")) {
      return NextResponse.json(
        { success: false, error: "Invalid chatId format" },
        { status: 400 }
      );
    }

    const userId = BigInt(id);
    const firestoreService = new FirestoreService();
    const [astroPart, userPart] = chatId.split("_");
    const rawAstroId = Number(astroPart);
    const userUserId = Number(userPart);

    // Verify user ID matches
    if (userUserId !== Number(userId)) {
      return NextResponse.json(
        { success: false, error: "User ID mismatch" },
        { status: 403 }
      );
    }

    // Normalize to users.id
    const astroUserId = await resolveAstroUserId(rawAstroId);

    // Get Firestore chat
    const chatData = await firestoreService.getFullChat(
      chatId,
      String(userUserId)
    );

    // Sort + normalize messages
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
      where: { id: BigInt(userUserId) },
      select: { id: true, name: true, profile: true },
    });

    // Fetch astrologer
    const astroUser = await prisma.users.findFirst({
      where: { id: BigInt(astroUserId) },
      select: { id: true, name: true, profile: true },
    });

    const astroProfileRow = await prisma.astrologers.findFirst({
      where: {
        OR: [{ id: BigInt(rawAstroId) }, { userId: BigInt(astroUserId) }],
      },
      select: { name: true, profileImage: true },
    });

    const astro = {
      id: astroUserId,
      name: astroProfileRow?.name ?? astroUser?.name ?? "Astrologer",
      profile: astroProfileRow?.profileImage ?? astroUser?.profile ?? null,
    };

    const userDisplay = {
      id: userUserId,
      name: user?.name ?? "Customer",
      profile: user?.profile ?? null,
    };

    return NextResponse.json({
      success: true,
      data: {
        conversation: allMessages,
        userId: Number(userDisplay.id),
        astroId: Number(astro.id),
        chatId,
        user: userDisplay,
        astro,
      },
    });
  } catch (error: any) {
    console.error("Error fetching chat conversation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch chat conversation",
        message: error.message,
      },
      { status: 500 }
    );
  }
}