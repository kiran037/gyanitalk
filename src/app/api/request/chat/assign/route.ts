// ===================================
// FILE: app/api/request/chat/assign/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assignToGroup } from "@/lib/requestAssignment";
import { notifyGroup } from "@/lib/notificationService";
import { isValidGroup } from "@/lib/assignmentRules";

// ✅ FIX: Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, groupId } = body;

    if (!requestId || !groupId) {
      return NextResponse.json(
        { success: false, error: "requestId and groupId are required" },
        { status: 400 }
      );
    }

    const requestIdInt = parseInt(requestId);
    const groupIdInt = parseInt(groupId);

    // Check if chat request exists
    const chatRequest = await prisma.chatrequest.findFirst({
      where: { id: requestIdInt },
    });

    if (!chatRequest) {
      return NextResponse.json(
        { success: false, error: "Chat request not found" },
        { status: 404 }
      );
    }

    if (chatRequest.chatStatus !== "Pending") {
      return NextResponse.json(
        { success: false, error: `Cannot assign request with status: ${chatRequest.chatStatus}` },
        { status: 400 }
      );
    }

    // Validate group exists
    const groupExists = await isValidGroup(groupIdInt);
    if (!groupExists) {
      return NextResponse.json(
        { success: false, error: "Invalid group ID" },
        { status: 404 }
      );
    }

    // Assign to group
    const result = await assignToGroup(
      requestIdInt,
      "chat",
      groupIdInt,
      chatRequest.userId // Keep as BigInt
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Notify group
    const notificationResult = await notifyGroup(
      groupIdInt,
      "chat",
      requestIdInt,
      false
    );

    // Get group details
    const group = await prisma.astrologer_groups.findFirst({
      where: { id: BigInt(groupIdInt) },
    });

    return NextResponse.json({
      success: true,
      message: `Chat request assigned to ${group?.name || "group"}`,
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
    console.error("❌ Error assigning chat request:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to assign chat request" },
      { status: 500 }
    );
  }
}