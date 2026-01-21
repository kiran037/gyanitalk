// ===================================
// FILE: app/api/request/pending/all/route.ts
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
    const groupId = searchParams.get("groupId");
    const limit = parseInt(searchParams.get("limit") || "100");

    const expiryMinutes = await getRequestExpiryMinutes();

    // Fetch pending calls and chats
    const [pendingCalls, pendingChats] = await Promise.all([
      prisma.callrequest.findMany({
        where: { callStatus: "Pending" },
        include: {
          user: {
            select: {
              id: true, // BigInt
              name: true,
              contactNo: true,
            },
          },
        },
        orderBy: { created_at: "asc" },
        take: limit,
      }),
      prisma.chatrequest.findMany({
        where: { chatStatus: "Pending" },
        include: {
          user: {
            select: {
              id: true, // BigInt
              name: true,
              contactNo: true,
            },
          },
        },
        orderBy: { created_at: "asc" },
        take: limit,
      }),
    ]);

    // Enrich calls
    const enrichedCalls = await Promise.all(
      pendingCalls.map(async (call) => {
        const metadata = await getAssignmentMetadata(call.id, "call");
        const createdAt = new Date(call.created_at!);
        const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60000);
        const timeRemaining = Math.max(0, Math.floor((expiryTime.getTime() - Date.now()) / 1000));

        let assignmentTimeout = 0;
        if (metadata?.assignment_history.length) {
          const lastAssignment = metadata.assignment_history[metadata.assignment_history.length - 1];
          const timeoutAt = new Date(lastAssignment.timeout_at);
          assignmentTimeout = Math.max(0, Math.floor((timeoutAt.getTime() - Date.now()) / 1000));
        }

        return {
          id: call.id,
          type: "call" as const,
          userId: call.userId, // BigInt - handled by patch
          userName: call.user?.name,
          userContact: call.user?.contactNo,
          status: call.callStatus,
          createdAt: call.created_at,
          assignmentMetadata: metadata,
          timeRemaining,
          assignmentTimeout,
          isExpiringSoon: timeRemaining < 60,
        };
      })
    );

    // Enrich chats
    const enrichedChats = await Promise.all(
      pendingChats.map(async (chat) => {
        const metadata = await getAssignmentMetadata(chat.id, "chat");
        const createdAt = new Date(chat.created_at!);
        const expiryTime = new Date(createdAt.getTime() + expiryMinutes * 60000);
        const timeRemaining = Math.max(0, Math.floor((expiryTime.getTime() - Date.now()) / 1000));

        let assignmentTimeout = 0;
        if (metadata?.assignment_history.length) {
          const lastAssignment = metadata.assignment_history[metadata.assignment_history.length - 1];
          const timeoutAt = new Date(lastAssignment.timeout_at);
          assignmentTimeout = Math.max(0, Math.floor((timeoutAt.getTime() - Date.now()) / 1000));
        }

        return {
          id: chat.id,
          type: "chat" as const,
          userId: chat.userId, // BigInt - handled by patch
          userName: chat.user?.name,
          userContact: chat.user?.contactNo,
          status: chat.chatStatus,
          createdAt: chat.created_at,
          assignmentMetadata: metadata,
          timeRemaining,
          assignmentTimeout,
          isExpiringSoon: timeRemaining < 60,
        };
      })
    );

    // Combine and filter by group
    let combined = [...enrichedCalls, ...enrichedChats];

    if (groupId) {
      const groupIdInt = parseInt(groupId);
      combined = combined.filter(
        (req) => req.assignmentMetadata?.assigned_group_id === groupIdInt
      );
    }

    // Sort by urgency
    combined.sort((a, b) => a.timeRemaining - b.timeRemaining);

    return NextResponse.json({
      success: true,
      data: combined,
      summary: {
        totalPending: combined.length,
        pendingCalls: enrichedCalls.length,
        pendingChats: enrichedChats.length,
        expiringSoon: combined.filter((r) => r.isExpiringSoon).length,
        assigned: combined.filter((r) => r.assignmentMetadata).length,
        unassigned: combined.filter((r) => !r.assignmentMetadata).length,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching pending requests:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch pending requests" },
      { status: 500 }
    );
  }
}