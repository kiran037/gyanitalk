// ===================================
// FILE: app/api/request/chat/pending/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssignmentMetadata } from "@/lib/requestAssignment";
import { getRequestExpiryMinutes } from "@/lib/assignmentRules";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Filters
    const groupId = searchParams.get("groupId");

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Fetch pending chats
    // Note: userId inside chatRequests is BigInt
    const [chatRequests, totalCount] = await Promise.all([
      prisma.chatrequest.findMany({
        where: {
          chatStatus: "Pending",
        },
        include: {
          user: {
            select: {
              id: true, // BigInt
              name: true,
              contactNo: true,
              email: true,
              birthDate: true,
              birthPlace: true,
            },
          },
        },
        orderBy: { created_at: "asc" },
        skip,
        take: limit,
      }),
      prisma.chatrequest.count({ where: { chatStatus: "Pending" } }),
    ]);

    // Get expiry time
    const expiryMinutes = await getRequestExpiryMinutes();

    // Enrich with metadata and calculate time remaining
    const enrichedRequests = await Promise.all(
      chatRequests.map(async (chat) => {
        const metadata = await getAssignmentMetadata(chat.id, "chat");

        const createdAt = new Date(chat.created_at!);
        const expiryTime = new Date(
          createdAt.getTime() + expiryMinutes * 60000
        );
        const timeRemaining = Math.max(
          0,
          Math.floor((expiryTime.getTime() - Date.now()) / 1000)
        );

        // Calculate assignment timeout
        let assignmentTimeout = 0;
        if (metadata?.assignment_history.length) {
          const lastAssignment =
            metadata.assignment_history[metadata.assignment_history.length - 1];
          const timeoutAt = new Date(lastAssignment.timeout_at);
          assignmentTimeout = Math.max(
            0,
            Math.floor((timeoutAt.getTime() - Date.now()) / 1000)
          );
        }

        return {
          ...chat,
          assignmentMetadata: metadata,
          timeRemaining,
          assignmentTimeout,
          isExpiringSoon: timeRemaining < 60,
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

    // Sort by urgency
    finalRequests.sort((a, b) => a.timeRemaining - b.timeRemaining);

    return NextResponse.json({
      success: true,
      data: finalRequests,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      summary: {
        totalPending: totalCount,
        expiringSoon: finalRequests.filter((r) => r.isExpiringSoon).length,
        assigned: finalRequests.filter((r) => r.assignmentMetadata).length,
        unassigned: finalRequests.filter((r) => !r.assignmentMetadata).length,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching pending chats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch pending chats",
      },
      { status: 500 }
    );
  }
}