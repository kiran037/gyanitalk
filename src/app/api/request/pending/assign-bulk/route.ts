// ===================================
// FILE: app/api/request/pending/assign-bulk/route.ts
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
    const { requests, groupId } = body; // requests: [{id, type}]

    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { success: false, error: "requests array is required" },
        { status: 400 }
      );
    }

    if (!groupId) {
      return NextResponse.json(
        { success: false, error: "groupId is required" },
        { status: 400 }
      );
    }

    // --- Prepare Group IDs ---
    // 1. Helper functions expect number
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

    const results = [];
    let successCount = 0;
    let failedCount = 0;

    for (const req of requests) {
      try {
        const { id, type } = req;
        const requestIdInt = parseInt(id);

        if (!id || !type || !["call", "chat"].includes(type)) {
          results.push({ id, type, success: false, error: "Invalid request" });
          failedCount++;
          continue;
        }

        // Get request data
        let requestData: any;
        let status: string | null = null;

        if (type === "call") {
          requestData = await prisma.callrequest.findFirst({ where: { id: requestIdInt } });
          status = requestData?.callStatus || null;
        } else {
          requestData = await prisma.chatrequest.findFirst({ where: { id: requestIdInt } });
          status = requestData?.chatStatus || null;
        }

        if (!requestData) {
          results.push({ id, type, success: false, error: "Request not found" });
          failedCount++;
          continue;
        }

        if (status !== "Pending") {
          results.push({ id, type, success: false, error: `Status is ${status}` });
          failedCount++;
          continue;
        }

        // Assign to group
        // assignToGroup(requestId: number, type: string, groupId: number, userId: bigint)
        const result = await assignToGroup(
          requestIdInt,
          type as "call" | "chat",
          groupIdInt, // Passed as number
          requestData.userId // Passed as BigInt (no conversion needed)
        );

        if (result.success) {
          results.push({ id, type, success: true, message: result.message });
          successCount++;
        } else {
          results.push({ id, type, success: false, error: result.message });
          failedCount++;
        }
      } catch (error: any) {
        results.push({ id: req.id, type: req.type, success: false, error: error.message });
        failedCount++;
      }
    }

    if (successCount > 0) {
      await notifyGroup(
        groupIdInt,
        "call",
        0,
        false
      );
    }

    const group = await prisma.astrologer_groups.findFirst({
      where: { id: groupIdBigInt },
    });

    return NextResponse.json({
      success: true,
      message: `Bulk assignment completed: ${successCount} successful, ${failedCount} failed`,
      data: {
        groupId: groupIdInt,
        groupName: group?.name,
        successCount,
        failedCount,
        results,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in bulk assignment:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to bulk assign requests" },
      { status: 500 }
    );
  }
}