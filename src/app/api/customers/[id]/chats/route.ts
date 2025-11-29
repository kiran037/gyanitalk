// app/api/customers/[id]/chats/route.ts
// GET: Get customer chat history

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { success: false, error: "Invalid customer ID" },
        { status: 400 }
      );
    }

    const userId = BigInt(id);
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.chatrequest.count({
      where: { userId },
    });

    // Fetch chat history
    const chats = await prisma.chatrequest.findMany({
      where: { userId },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: limit,
    });

    const formattedChats = chats.map((chat) => ({
      id: chat.id,
      chatId: chat.chatId,
      astrologerId: chat.astrologerId.toString(),
      astrologerName: chat.astrologer?.name || "N/A",
      astrologerImage: chat.astrologer?.profileImage || null,
      chatStatus: chat.chatStatus,
      duration: chat.chat_duration || chat.totalMin || "N/A",
      rate: chat.chatRate || "N/A",
      deduction: chat.deduction?.toString() || "0",
      deductionFromAstrologer:
        chat.deductionFromAstrologer?.toString() || "0",
      isFreeSession: chat.isFreeSession || false,
      createdAt: chat.created_at,
      hasMessages: !!chat.chatId, // Can view chat if chatId exists
    }));

    return NextResponse.json({
      success: true,
      data: {
        chats: formattedChats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          perPage: limit,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch chat history",
        message: error.message,
      },
      { status: 500 }
    );
  }
}