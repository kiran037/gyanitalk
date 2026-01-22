// ===================================
// FILE: app/api/request/groups/[id]/performance/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssignmentMetadata } from "@/lib/requestAssignment";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = parseInt(params.id);

    if (isNaN(groupId)) {
      return NextResponse.json(
        { success: false, error: "Invalid group ID" },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get group info
    // ✅ FIX: Use BigInt(groupId) for Prisma lookup
    const group = await prisma.astrologer_groups.findFirst({
      where: { id: BigInt(groupId) },
      include: {
        astrologerassign: {
          select: { astrologerId: true },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { success: false, error: "Group not found" },
        { status: 404 }
      );
    }

    const astrologerIds = group.astrologerassign.map((a) => a.astrologerId);

    // Get all call/chat requests in time period
    const [allCallRequests, allChatRequests] = await Promise.all([
      prisma.callrequest.findMany({
        where: {
          created_at: { gte: startDate },
        },
      }),
      prisma.chatrequest.findMany({
        where: {
          created_at: { gte: startDate },
        },
      }),
    ]);

    // --- Process Calls ---
    let assignedCalls = 0;
    let acceptedCalls = 0;
    let completedCalls = 0;
    let timeoutCalls = 0;

    // OPTIMIZATION: Fetch metadata in parallel instead of sequential loop
    await Promise.all(
      allCallRequests.map(async (call) => {
        const metadata = await getAssignmentMetadata(call.id, "call");
        
        // groupId is number here, assuming metadata.assigned_group_id is also number
        if (metadata?.assigned_group_id === groupId) {
          assignedCalls++;

          if (call.callStatus === "Confirmed" || call.callStatus === "Completed") {
            acceptedCalls++;
          }
          if (call.callStatus === "Completed") {
            completedCalls++;
          }
          if (
            metadata.assignment_history &&
            metadata.assignment_history.some(
              (h: any) => h.group_id === groupId && h.status === "timeout"
            )
          ) {
            timeoutCalls++;
          }
        }
      })
    );

    // --- Process Chats ---
    let assignedChats = 0;
    let acceptedChats = 0;
    let completedChats = 0;
    let timeoutChats = 0;

    // OPTIMIZATION: Fetch metadata in parallel
    await Promise.all(
      allChatRequests.map(async (chat) => {
        const metadata = await getAssignmentMetadata(chat.id, "chat");
        
        if (metadata?.assigned_group_id === groupId) {
          assignedChats++;

          if (chat.chatStatus === "Confirmed" || chat.chatStatus === "Completed") {
            acceptedChats++;
          }
          if (chat.chatStatus === "Completed") {
            completedChats++;
          }
          if (
            metadata.assignment_history &&
            metadata.assignment_history.some(
              (h: any) => h.group_id === groupId && h.status === "timeout"
            )
          ) {
            timeoutChats++;
          }
        }
      })
    );

    const totalAssigned = assignedCalls + assignedChats;
    const totalAccepted = acceptedCalls + acceptedChats;
    const totalCompleted = completedCalls + completedChats;
    const totalTimeout = timeoutCalls + timeoutChats;

    const acceptanceRate =
      totalAssigned > 0 ? ((totalAccepted / totalAssigned) * 100).toFixed(2) : "0.00";

    const completionRate =
      totalAccepted > 0 ? ((totalCompleted / totalAccepted) * 100).toFixed(2) : "0.00";

    const timeoutRate =
      totalAssigned > 0 ? ((totalTimeout / totalAssigned) * 100).toFixed(2) : "0.00";

    return NextResponse.json({
      success: true,
      data: {
        groupId,
        groupName: group.name,
        period: `Last ${days} days`,
        totalAstrologers: astrologerIds.length,
        calls: {
          assigned: assignedCalls,
          accepted: acceptedCalls,
          completed: completedCalls,
          timeout: timeoutCalls,
        },
        chats: {
          assigned: assignedChats,
          accepted: acceptedChats,
          completed: completedChats,
          timeout: timeoutChats,
        },
        totals: {
          assigned: totalAssigned,
          accepted: totalAccepted,
          completed: totalCompleted,
          timeout: totalTimeout,
        },
        rates: {
          acceptanceRate: `${acceptanceRate}%`,
          completionRate: `${completionRate}%`,
          timeoutRate: `${timeoutRate}%`,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching group performance:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch performance" },
      { status: 500 }
    );
  }
}