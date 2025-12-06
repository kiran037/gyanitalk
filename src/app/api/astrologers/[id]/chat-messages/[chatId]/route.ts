// app/api/astrologers/[id]/chat-messages/[chatId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import FirestoreService from '@/services/firestore_services';

const prisma = new PrismaClient();

/** Resolve the astrologer's users.id whether chatId uses astrologers.id or users.id */
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; chatId: string } }
) {
  try {
    const astrologerId = BigInt(params.id);
    const chatId = params.chatId;

    if (!chatId || !chatId.includes("_")) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid chatId format',
        },
        { status: 400 }
      );
    }

    // Get chat request details from database
    const chatRequest = await prisma.chatrequest.findFirst({
      where: {
        astrologerId: astrologerId,
        chatId: chatId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: true,
            email: true,
          },
        },
        astrologer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            userId: true,
          },
        },
      },
    });

    if (!chatRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Chat not found',
        },
        { status: 404 }
      );
    }

    // Get messages from Firestore
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

    return NextResponse.json({
      success: true,
      data: {
        chatRequest: {
          ...chatRequest,
          astrologer: {
            ...chatRequest.astrologer,
            userId: astroUserId,
          },
        },
        messages: allMessages,
        userId: userUserId,
        astroId: astroUserId,
      },
    });
  } catch (error: any) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chat messages',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}