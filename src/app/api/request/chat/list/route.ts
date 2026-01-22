// ===================================
// FILE: app/api/request/chat/list/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssignmentMetadata } from "@/lib/requestAssignment";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Filters
    const status = searchParams.get("status");
    const astrologerId = searchParams.get("astrologerId");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupId = searchParams.get("groupId");

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status) {
      where.chatStatus = status;
    }

    if (astrologerId) {
      where.astrologerId = BigInt(astrologerId);
    }

    if (userId) {
      where.userId = BigInt(userId);
    }

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Fetch chat requests
    const [chatRequests, totalCount] = await Promise.all([
      prisma.chatrequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              contactNo: true,
              email: true,
            },
          },
          astrologer: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.chatrequest.count({ where }),
    ]);

    // Enrich with assignment metadata
    const enrichedRequests = await Promise.all(
      chatRequests.map(async (chat) => {
        const metadata = await getAssignmentMetadata(chat.id, "chat");

        return {
          ...chat,
          assignmentMetadata: metadata,
        };
      })
    );

    // Filter by groupId if provided
    let finalRequests = enrichedRequests;
    if (groupId) {
      const groupIdInt = parseInt(groupId);
      finalRequests = enrichedRequests.filter(
        (req) =>
          req.assignmentMetadata?.assigned_group_id === groupIdInt
      );
    }

    return NextResponse.json({
      success: true,
      data: finalRequests,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching chat requests:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch chat requests",
      },
      { status: 500 }
    );
  }
}