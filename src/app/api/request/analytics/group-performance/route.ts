// ===================================
// FILE: app/api/request/analytics/group-performance/route.ts
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
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. Fetch all groups and requests in parallel
    const [groups, allCalls, allChats] = await Promise.all([
      prisma.astrologer_groups.findMany(),
      prisma.callrequest.findMany({
        where: { created_at: { gte: startDate } },
        select: { id: true, callStatus: true }, // Select only needed fields
      }),
      prisma.chatrequest.findMany({
        where: { created_at: { gte: startDate } },
        select: { id: true, chatStatus: true }, // Select only needed fields
      }),
    ]);

    // 2. Initialize stats map for all groups
    // Key: groupId (number), Value: Stats Object
    const statsMap = new Map<number, any>();

    groups.forEach((group) => {
      const gId = Number(group.id); // Convert BigInt to number for mapping
      statsMap.set(gId, {
        groupId: gId,
        groupName: group.name,
        assigned: 0,
        accepted: 0,
        completed: 0,
        timeout: 0,
      });
    });

    // 3. Process Calls (Fetch metadata in parallel)
    await Promise.all(
      allCalls.map(async (call) => {
        const metadata = await getAssignmentMetadata(call.id, "call");
        
        if (metadata && metadata.assigned_group_id) {
          const groupId = Number(metadata.assigned_group_id);
          const groupStats = statsMap.get(groupId);

          if (groupStats) {
            groupStats.assigned++;
            const status = call.callStatus || "";

            if (["Confirmed", "Completed"].includes(status)) {
              groupStats.accepted++;
            }
            if (status === "Completed") {
              groupStats.completed++;
            }
            
            // Check for timeout in history
            if (
              metadata.assignment_history &&
              metadata.assignment_history.some(
                (h: any) => Number(h.group_id) === groupId && h.status === "timeout"
              )
            ) {
              groupStats.timeout++;
            }
          }
        }
      })
    );

    // 4. Process Chats (Fetch metadata in parallel)
    await Promise.all(
      allChats.map(async (chat) => {
        const metadata = await getAssignmentMetadata(chat.id, "chat");

        if (metadata && metadata.assigned_group_id) {
          const groupId = Number(metadata.assigned_group_id);
          const groupStats = statsMap.get(groupId);

          if (groupStats) {
            groupStats.assigned++;
            const status = chat.chatStatus || "";

            if (["Confirmed", "Completed"].includes(status)) {
              groupStats.accepted++;
            }
            if (status === "Completed") {
              groupStats.completed++;
            }

            // Check for timeout in history
            if (
              metadata.assignment_history &&
              metadata.assignment_history.some(
                (h: any) => Number(h.group_id) === groupId && h.status === "timeout"
              )
            ) {
              groupStats.timeout++;
            }
          }
        }
      })
    );

    // 5. Calculate Rates and Format Output
    const groupStatsArray = Array.from(statsMap.values()).map((stat) => {
      const acceptanceRate =
        stat.assigned > 0
          ? ((stat.accepted / stat.assigned) * 100).toFixed(2)
          : "0.00";

      const completionRate =
        stat.accepted > 0
          ? ((stat.completed / stat.accepted) * 100).toFixed(2)
          : "0.00";

      const timeoutRate =
        stat.assigned > 0
          ? ((stat.timeout / stat.assigned) * 100).toFixed(2)
          : "0.00";

      return {
        ...stat,
        acceptanceRate: `${acceptanceRate}%`,
        completionRate: `${completionRate}%`,
        timeoutRate: `${timeoutRate}%`,
      };
    });

    // Sort by assigned count (descending)
    groupStatsArray.sort((a, b) => b.assigned - a.assigned);

    return NextResponse.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        groups: groupStatsArray,
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching group performance:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch group performance" },
      { status: 500 }
    );
  }
}