// app/api/astrologers/[id]/chat-messages/[chatId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import FirestoreService from "@/services/firestore_services";

// JSON-safe converter for BigInt / Decimal / Date
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") return obj.toString();

  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  if (obj instanceof Date) return obj.toISOString();

  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

/** Resolve the astrologer's users.id whether chatId uses astrologers.id or users.id */
async function resolveAstroUserId(rawAstroIdNum: number): Promise<number> {
  const astroRow = await prisma.astrologers.findFirst({
    where: { id: BigInt(rawAstroIdNum) },
    select: { userId: true },
  });

  if (astroRow?.userId) return Number(astroRow.userId);

  // Otherwise assume it's already a users.id
  return Number(rawAstroIdNum);
}

// Next 15 style: params is a Promise
type RouteContext = {
  params: Promise<{ id: string; chatId: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id, chatId } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    if (!chatId || !chatId.includes("_")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid chatId format",
        },
        { status: 400 }
      );
    }

    const astrologerId = BigInt(id);

    // Get chat request details from database
    const chatRequest = await prisma.chatrequest.findFirst({
      where: {
        astrologerId,
        chatId,
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
          error: "Chat not found",
        },
        { status: 404 }
      );
    }

    // Parse chatId pieces: "<astroPart>_<userPart>"
    const [astroPart, userPart] = chatId.split("_");
    const rawAstroId = Number(astroPart);
    const userUserId = Number(userPart);

    if (Number.isNaN(rawAstroId) || Number.isNaN(userUserId)) {
      return NextResponse.json(
        { success: false, error: "Invalid numeric IDs in chatId" },
        { status: 400 }
      );
    }

    // Normalize to users.id for astrologer
    const astroUserId = await resolveAstroUserId(rawAstroId);

    // Get messages from Firestore
    const firestoreService = new FirestoreService();
    const chatData = await firestoreService.getFullChat(chatId, String(userUserId));

    // Normalize + sort messages
    const allMessages = (chatData?.messages || [])
      .map((m: any) => ({
        ...m,
        sender_id: Number(m.sender_id),
        receiver_id:
          m.receiver_id !== null && m.receiver_id !== undefined
            ? Number(m.receiver_id)
            : undefined,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    const safe = convertPrismaTypes({
      success: true,
      data: {
        chatRequest: {
          ...chatRequest,
          astrologer: chatRequest.astrologer
            ? {
                ...chatRequest.astrologer,
                userId: astroUserId,
              }
            : null,
        },
        messages: allMessages,
        userId: userUserId,
        astroId: astroUserId,
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching chat messages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch chat messages",
        message: error.message,
      },
      { status: 500 }
    );
  }
}