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

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: "Chat ID is required" },
        { status: 400 }
      );
    }

    const astrologerId = BigInt(id);

    // 1. Fetch Chat Request with relationships
    // We fetch user and astrologer here, so we don't need to query them again later.
    const chatRequest = await prisma.chatrequest.findFirst({
      where: {
        astrologerId,
        chatId,
      },
      include: {
        user: {
          select: {
            id: true, // This is the User's ID (bigint)
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
            userId: true, // This is the Astrologer's User ID (bigint)
          },
        },
      },
    });

    if (!chatRequest || !chatRequest.user || !chatRequest.astrologer) {
      return NextResponse.json(
        {
          success: false,
          error: "Chat request or participants not found",
        },
        { status: 404 }
      );
    }

    // 2. Extract reliable IDs from the DB result (No need to parse/guess from chatId string)
    const userUserId = Number(chatRequest.user.id);
    const astroUserId = Number(chatRequest.astrologer.userId);

    // 3. Get messages from Firestore
    const firestoreService = new FirestoreService();
    // Assuming getFullChat expects (chatId, user_id_string)
    const chatData = await firestoreService.getFullChat(chatId, String(userUserId));

    // 4. Normalize + sort messages safely
    const allMessages = (chatData?.messages || [])
      .map((m: any) => ({
        ...m,
        sender_id: Number(m.sender_id),
        receiver_id:
          m.receiver_id !== null && m.receiver_id !== undefined
            ? Number(m.receiver_id)
            : undefined,
      }))
      .sort((a: any, b: any) => {
        // Handle Firestore Timestamps or ISO strings safely
        const getTime = (dateObj: any) => {
          if (!dateObj) return 0;
          if (typeof dateObj.toDate === "function") return dateObj.toDate().getTime(); // Firestore Timestamp
          return new Date(dateObj).getTime(); // Standard Date/String
        };
        return getTime(a.createdAt) - getTime(b.createdAt);
      });

    // 5. Return safe response
    const safeResponse = convertPrismaTypes({
      success: true,
      data: {
        chatRequest: {
          ...chatRequest,
          // Ensure the frontend receives the normalized UserID for the astrologer
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

    return NextResponse.json(safeResponse);

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