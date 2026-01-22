// ===================================
// FILE: app/api/request/analytics/acceptance-rate/route.ts
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
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Group by day
    const callsByDay: { [key: string]: any } = {};
    const chatsByDay: { [key: string]: any } = {};

    // Get all requests
    const [calls, chats] = await Promise.all([
      prisma.callrequest.findMany({
        where: { created_at: { gte: startDate } },
        select: {
          id: true,
          callStatus: true,
          created_at: true,
        },
      }),
      prisma.chatrequest.findMany({
        where: { created_at: { gte: startDate } },
        select: {
          id: true,
          chatStatus: true,
          created_at: true,
        },
      }),
    ]);

    // Process calls
    for (const call of calls) {
      if (!call.created_at) continue;
      const day = new Date(call.created_at).toISOString().split("T")[0];

      if (!callsByDay[day]) {
        callsByDay[day] = {
          date: day,
          total: 0,
          accepted: 0,
          completed: 0,
          rejected: 0,
        };
      }

      callsByDay[day].total++;
      const status = call.callStatus || "";

      if (["Confirmed", "Completed"].includes(status)) {
        callsByDay[day].accepted++;
      }
      if (status === "Completed") {
        callsByDay[day].completed++;
      }
      if (status === "Rejected") {
        callsByDay[day].rejected++;
      }
    }

    // Process chats
    for (const chat of chats) {
      if (!chat.created_at) continue;
      const day = new Date(chat.created_at).toISOString().split("T")[0];

      if (!chatsByDay[day]) {
        chatsByDay[day] = {
          date: day,
          total: 0,
          accepted: 0,
          completed: 0,
          rejected: 0,
        };
      }

      chatsByDay[day].total++;
      const status = chat.chatStatus || "";

      if (["Confirmed", "Completed"].includes(status)) {
        chatsByDay[day].accepted++;
      }
      if (status === "Completed") {
        chatsByDay[day].completed++;
      }
      if (status === "Rejected") {
        chatsByDay[day].rejected++;
      }
    }

    // Convert to arrays and calculate rates
    const callsData = Object.values(callsByDay).map((day: any) => ({
      ...day,
      acceptanceRate:
        day.total > 0 ? ((day.accepted / day.total) * 100).toFixed(2) : "0.00",
      completionRate:
        day.accepted > 0 ? ((day.completed / day.accepted) * 100).toFixed(2) : "0.00",
      rejectionRate:
        day.total > 0 ? ((day.rejected / day.total) * 100).toFixed(2) : "0.00",
    }));

    const chatsData = Object.values(chatsByDay).map((day: any) => ({
      ...day,
      acceptanceRate:
        day.total > 0 ? ((day.accepted / day.total) * 100).toFixed(2) : "0.00",
      completionRate:
        day.accepted > 0 ? ((day.completed / day.accepted) * 100).toFixed(2) : "0.00",
      rejectionRate:
        day.total > 0 ? ((day.rejected / day.total) * 100).toFixed(2) : "0.00",
    }));

    // Sort by date
    callsData.sort((a, b) => a.date.localeCompare(b.date));
    chatsData.sort((a, b) => a.date.localeCompare(b.date));

    // Overall stats
    const totalCalls = calls.length;
    const acceptedCalls = calls.filter((c) =>
      ["Confirmed", "Completed"].includes(c.callStatus || "")
    ).length;
    const completedCalls = calls.filter((c) => c.callStatus === "Completed").length;

    const totalChats = chats.length;
    const acceptedChats = chats.filter((c) =>
      ["Confirmed", "Completed"].includes(c.chatStatus || "")
    ).length;
    const completedChats = chats.filter((c) => c.chatStatus === "Completed").length;

    const overallCallAcceptance =
      totalCalls > 0 ? ((acceptedCalls / totalCalls) * 100).toFixed(2) : "0.00";

    const overallChatAcceptance =
      totalChats > 0 ? ((acceptedChats / totalChats) * 100).toFixed(2) : "0.00";

    const overallCallCompletion =
      acceptedCalls > 0 ? ((completedCalls / acceptedCalls) * 100).toFixed(2) : "0.00";

    const overallChatCompletion =
      acceptedChats > 0 ? ((completedChats / acceptedChats) * 100).toFixed(2) : "0.00";

    return NextResponse.json({
      success: true,
      data: {
        period: `Last ${days} days`,
        overall: {
          calls: {
            total: totalCalls,
            accepted: acceptedCalls,
            completed: completedCalls,
            acceptanceRate: `${overallCallAcceptance}%`,
            completionRate: `${overallCallCompletion}%`,
          },
          chats: {
            total: totalChats,
            accepted: acceptedChats,
            completed: completedChats,
            acceptanceRate: `${overallChatAcceptance}%`,
            completionRate: `${overallChatCompletion}%`,
          },
        },
        dailyTrends: {
          calls: callsData,
          chats: chatsData,
        },
      },
    });
  } catch (error: any) {
    console.error("❌ Error fetching acceptance rate:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch acceptance rate" },
      { status: 500 }
    );
  }
}