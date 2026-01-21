// ===================================
// FILE: app/api/request/call/reassign/route.ts
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

    // Validation
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

    // Prepare ID
    const requestIdInt = parseInt(requestId);

    // Check if call request exists
    const callRequest = await prisma.callrequest.findFirst({
      where: { id: requestIdInt },
    });

    if (!callRequest) {
      return NextResponse.json(
        { success: false, error: "Call request not found" },
        { status: 404 }
      );
    }

    // Check if already completed/rejected
    if (["Completed", "Rejected"].includes(callRequest.callStatus!)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot reassign request with status: ${callRequest.callStatus}`,
        },
        { status: 400 }
      );
    }

    // --- Handle Broadcast ---
    if (broadcast) {
      // broadcastToAll likely expects (requestId: number, type: string, userId: bigint)
      const result = await broadcastToAll(
        requestIdInt,
        "call",
        callRequest.userId // userId is BigInt
      );

      const notificationResult = await broadcastToAllAstrologers(
        "call",
        requestIdInt
      );

      return NextResponse.json({
        success: true,
        message: "Call request broadcasted to all astrologers",
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
    
    // 1. Helpers expect number (based on previous errors)
    const groupIdInt = parseInt(groupId);
    // 2. Prisma expects BigInt (based on Schema)
    const groupIdBigInt = BigInt(groupId);

    // Validate group exists (using helper)
    const groupExists = await isValidGroup(groupIdInt);
    if (!groupExists) {
      return NextResponse.json(
        { success: false, error: "Invalid group ID" },
        { status: 404 }
      );
    }

    // Reassign to new group
    // assignToGroup(requestId: number, type: string, groupId: number, userId: bigint)
    const result = await assignToGroup(
      requestIdInt,
      "call",
      groupIdInt,
      callRequest.userId // Passed as BigInt
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // Send notifications to new group (helper expects number)
    const notificationResult = await notifyGroup(
      groupIdInt,
      "call",
      requestIdInt,
      true // isReassignment
    );

    // Get group details (Prisma expects BigInt)
    const group = await prisma.astrologer_groups.findFirst({
      where: { id: groupIdBigInt },
    });

    return NextResponse.json({
      success: true,
      message: `Call request reassigned to ${group?.name || "group"}`,
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
    console.error("❌ Error reassigning call request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to reassign call request",
      },
      { status: 500 }
    );
  }
}