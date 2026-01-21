// ===================================
// FILE: app/api/request/analytics/overview/route.ts
// ===================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    // Fetch counts in parallel
    const [
      totalCalls,
      totalChats,
      pendingCalls,
      pendingChats,
      confirmedCalls,
      confirmedChats,
      completedCalls,
      completedChats,
      rejectedCalls,
      rejectedChats,
    ] = await Promise.all([
      // Total Requests
      prisma.callrequest.count({
        where: { created_at: { gte: startDate } },
      }),
      prisma.chatrequest.count({
        where: { created_at: { gte: startDate } },
      }),

      // Pending
      prisma.callrequest.count({
        where: {
          callStatus: "Pending",
          created_at: { gte: startDate },
        },
      }),
      prisma.chatrequest.count({
        where: {
          chatStatus: "Pending",
          created_at: { gte: startDate },
        },
      }),

      // Confirmed
      prisma.callrequest.count({
        where: {
          callStatus: "Confirmed",
          created_at: { gte: startDate },
        },
      }),
      prisma.chatrequest.count({
        where: {
          chatStatus: "Confirmed",
          created_at: { gte: startDate },
        },
      }),

      // Completed
      prisma.callrequest.count({
        where: {
          callStatus: "Completed",
          created_at: { gte: startDate },
        },
      }),
      prisma.chatrequest.count({
        where: {
          chatStatus: "Completed",
          created_at: { gte: startDate },
        },
      }),

      // Rejected
      prisma.callrequest.count({
        where: {
          callStatus: "Rejected",
          created_at: { gte: startDate },
        },
      }),
      prisma.chatrequest.count({
        where: {
          chatStatus: "Rejected",
          created_at: { gte: startDate },
        },
      }),
    ]);

    const totalRequests = totalCalls + totalChats;
    const totalPending = pendingCalls + pendingChats;
    const totalConfirmed = confirmedCalls + confirmedChats;
    const totalCompleted = completedCalls + completedChats;
    const totalRejected = rejectedCalls + rejectedChats;

    // Calculate rates
    const completionRate =
      totalRequests > 0
        ? ((totalCompleted / totalRequests) * 100).toFixed(2)
        : "0.00";

    const rejectionRate =
      totalRequests > 0
        ? ((totalRejected / totalRequests) * 100).toFixed(2)
        : "0.00";

    const acceptanceRate =
      totalRequests > 0
        ? (((totalConfirmed + totalCompleted) / totalRequests) * 100).toFixed(2)
        : "0.00";

    // Get active astrologers count
    // Logic: Active AND Not Deleted AND (Online in Chat OR Online in Call)
    const activeAstrologers = await prisma.astrologers.count({
      where: {
        isActive: true,
        isDelete: false,
        OR: [
          { chatStatus: { not: "Offline" } },
          { callStatus: { not: "Offline" } },
        ],
      },
    });

    // Get groups count
    const totalGroups = await prisma.astrologer_groups.count();

    return NextResponse.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        summary: {
          totalRequests,
          totalPending,
          totalConfirmed,
          totalCompleted,
          totalRejected,
          activeAstrologers,
          totalGroups,
        },
        calls: {
          total: totalCalls,
          pending: pendingCalls,
          confirmed: confirmedCalls,
          completed: completedCalls,
          rejected: rejectedCalls,
        },
        chats: {
          total: totalChats,
          pending: pendingChats,
          confirmed: confirmedChats,
          completed: completedChats,
          rejected: rejectedChats,
        },
        rates: {
          completionRate: `${completionRate}%`,
          rejectionRate: `${rejectionRate}%`,
          acceptanceRate: `${acceptanceRate}%`,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching overview analytics:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}