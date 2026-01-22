// ===================================
// FILE: app/api/request/chat/reassign/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignToGroup, broadcastToAll } from "@/lib/requestAssignment";
import { notifyGroup, broadcastToAllAstrologers } from "@/lib/notificationService";
import { isValidGroup } from "@/lib/assignmentRules";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, groupId, broadcast = false } = body;

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "requestId is required" },
        { status: 400 }
      );
    }

    if (!broadcast && !groupId) {
      return NextResponse.json(
        { success: false, error: "groupId is required (or set broadcast=true)" },
        { status: 400 }
      );
    }

    const requestIdInt = parseInt(requestId);

    const chatRequest = await prisma.chatrequest.findFirst({
      where: { id: requestIdInt },
    });

    if (!chatRequest) {
      return NextResponse.json(
        { success: false, error: "Chat request not found" },
        { status: 404 }
      );
    }

    if (["Completed", "Rejected"].includes(chatRequest.chatStatus!)) {
      return NextResponse.json(
        { success: false, error: `Cannot reassign request with status: ${chatRequest.chatStatus}` },
        { status: 400 }
      );
    }

    // --- Handle Broadcast ---
    if (broadcast) {
      const result = await broadcastToAll(
        requestIdInt,
        "chat",
        chatRequest.userId // userId is BigInt
      );

      const notificationResult = await broadcastToAllAstrologers(
        "chat",
        requestIdInt
      );

      return NextResponse.json({
        success: true,
        message: "Chat request broadcasted to all astrologers",
        data: {
          requestId: requestIdInt,
          isBroadcast: true,
          assignmentMetadata: result.metadata,
          notificationsSent: notificationResult.totalSent,
          notificationsFailed: notificationResult.failedCount,
        },
      });
    }

    // --- Handle Group Reassignment ---

    // 1. Helpers expect number
    const groupIdInt = parseInt(groupId);
    // 2. Prisma expects BigInt
    const groupIdBigInt = BigInt(groupId);

    // Validate group exists (Helper expects number)
    const groupExists = await isValidGroup(groupIdInt);
    if (!groupExists) {
      return NextResponse.json(
        { success: false, error: "Invalid group ID" },
        { status: 404 }
      );
    }

    // Reassign to group
    // assignToGroup(requestId: number, type: string, groupId: number, userId: bigint)
    const result = await assignToGroup(
      requestIdInt,
      "chat",
      groupIdInt,
      chatRequest.userId // Passed as BigInt
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Notify new group (Helper expects number)
    const notificationResult = await notifyGroup(
      groupIdInt,
      "chat",
      requestIdInt,
      true
    );

    // Get group details (Prisma expects BigInt)
    const group = await prisma.astrologer_groups.findFirst({
      where: { id: groupIdBigInt },
    });

    return NextResponse.json({
      success: true,
      message: `Chat request reassigned to ${group?.name || "group"}`,
      data: {
        requestId: requestIdInt,
        groupId: groupIdInt,
        groupName: group?.name,
        assignmentMetadata: result.metadata,
        notificationsSent: notificationResult.totalSent,
        notificationsFailed: notificationResult.failedCount,
      },
    });
  } catch (error: any) {
    console.error("❌ Error reassigning chat request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reassign chat request" },
      { status: 500 }
    );
  }
}