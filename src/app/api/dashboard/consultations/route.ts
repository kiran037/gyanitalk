import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

// Helper: convert BigInt / Decimal / Date → JSON-safe primitives
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  // bigint → string
  if (typeof obj === "bigint") return obj.toString();

  // Prisma Decimal (runtime class name "Decimal") → number
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  // Date → ISO string
  if (obj instanceof Date) return obj.toISOString();

  // primitives
  if (typeof obj !== "object") return obj;

  // arrays
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  // objects: recurse
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const dateRange = getDateRange(filter, customStart || undefined, customEnd || undefined);
    const previousRange = getPreviousDateRange(dateRange);

    // Consultation Overview
    const [
      currentChats,
      previousChats,
      currentCalls,
      previousCalls,
      freeChats,
      freeCalls,
      chatStatuses,
      callStatuses,
    ] = await Promise.all([
      // Current period chats
      prisma.chatrequest.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),

      // Previous period chats
      prisma.chatrequest.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
        },
      }),

      // Current period calls
      prisma.callrequest.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),

      // Previous period calls
      prisma.callrequest.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
        },
      }),

      // Free chat sessions
      prisma.chatrequest.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isFreeSession: true,
        },
      }),

      // Free call sessions
      prisma.callrequest.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isFreeSession: true,
        },
      }),

      // Chat status breakdown
      prisma.chatrequest.groupBy({
        by: ["chatStatus"],
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
        _count: true,
      }),

      // Call status breakdown
      prisma.callrequest.groupBy({
        by: ["callStatus"],
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
        _count: true,
      }),
    ]);

    const totalConsultations = currentChats + currentCalls;
    const previousConsultations = previousChats + previousCalls;

    const consultationsComparison = calculateComparison(
      totalConsultations,
      previousConsultations
    );
    const chatsComparison = calculateComparison(currentChats, previousChats);
    const callsComparison = calculateComparison(currentCalls, previousCalls);

    // Daily Consultation Trend
    const dailyTrend = await prisma.$queryRaw<
      Array<{ date: Date; chats: number; calls: number; videoCalls: number }>
    >`
      SELECT 
        DATE(created_at) as date,
        (SELECT COUNT(*) FROM chatrequest WHERE DATE(created_at) = DATE(cr.created_at) 
         AND created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}) as chats,
        (SELECT COUNT(*) FROM callrequest WHERE DATE(created_at) = DATE(cr.created_at) 
         AND call_type = 0 
         AND created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}) as calls,
        (SELECT COUNT(*) FROM callrequest WHERE DATE(created_at) = DATE(cr.created_at) 
         AND call_type = 1 
         AND created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}) as videoCalls
      FROM (
        SELECT DISTINCT DATE(created_at) as created_at FROM chatrequest 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
        UNION
        SELECT DISTINCT DATE(created_at) FROM callrequest 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
      ) cr
      ORDER BY date ASC
    `;

    // Peak Hours Analysis (Hour of Day)
    const peakHours = await prisma.$queryRaw<
      Array<{ hour: number; chats: number; calls: number }>
    >`
      SELECT 
        HOUR(created_at) as hour,
        (SELECT COUNT(*) FROM chatrequest WHERE HOUR(created_at) = HOUR(cr.created_at) 
         AND created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}) as chats,
        (SELECT COUNT(*) FROM callrequest WHERE HOUR(created_at) = HOUR(cr.created_at) 
         AND created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}) as calls
      FROM (
        SELECT created_at FROM chatrequest 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
        UNION ALL
        SELECT created_at FROM callrequest 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
      ) cr
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `;

    // Peak Days Analysis (Day of Week)
    const peakDays = await prisma.$queryRaw<
      Array<{ dayOfWeek: number; dayName: string; chats: number; calls: number }>
    >`
      SELECT 
        DAYOFWEEK(created_at) as dayOfWeek,
        DAYNAME(created_at) as dayName,
        (SELECT COUNT(*) FROM chatrequest WHERE DAYOFWEEK(created_at) = DAYOFWEEK(cr.created_at) 
         AND created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}) as chats,
        (SELECT COUNT(*) FROM callrequest WHERE DAYOFWEEK(created_at) = DAYOFWEEK(cr.created_at) 
         AND created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}) as calls
      FROM (
        SELECT created_at FROM chatrequest 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
        UNION ALL
        SELECT created_at FROM callrequest 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
      ) cr
      GROUP BY DAYOFWEEK(created_at), DAYNAME(created_at)
      ORDER BY dayOfWeek ASC
    `;

    // Average Duration Analysis
    const chatDurations = await prisma.chatrequest.findMany({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        chat_duration: { not: null },
      },
      select: { chat_duration: true },
    });

    const callDurations = await prisma.callrequest.findMany({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        call_duration: { not: null },
      },
      select: { call_duration: true },
    });

    // Calculate average durations (assuming duration is in format "MM:SS" or minutes)
    const avgChatDuration =
      chatDurations.length > 0
        ? chatDurations.reduce((sum, chat) => {
            const duration = chat.chat_duration ? parseFloat(chat.chat_duration) : 0;
            return sum + duration;
          }, 0) / chatDurations.length
        : 0;

    const avgCallDuration =
      callDurations.length > 0
        ? callDurations.reduce((sum, call) => {
            const duration = call.call_duration ? parseFloat(call.call_duration) : 0;
            return sum + duration;
          }, 0) / callDurations.length
        : 0;

    // Duration Distribution
    const durationGroups = {
      "0-5 min": { chats: 0, calls: 0 },
      "5-10 min": { chats: 0, calls: 0 },
      "10-20 min": { chats: 0, calls: 0 },
      "20+ min": { chats: 0, calls: 0 },
    };

    chatDurations.forEach((chat) => {
      const duration = chat.chat_duration ? parseFloat(chat.chat_duration) : 0;
      if (duration >= 0 && duration < 5) durationGroups["0-5 min"].chats++;
      else if (duration >= 5 && duration < 10) durationGroups["5-10 min"].chats++;
      else if (duration >= 10 && duration < 20) durationGroups["10-20 min"].chats++;
      else if (duration >= 20) durationGroups["20+ min"].chats++;
    });

    callDurations.forEach((call) => {
      const duration = call.call_duration ? parseFloat(call.call_duration) : 0;
      if (duration >= 0 && duration < 5) durationGroups["0-5 min"].calls++;
      else if (duration >= 5 && duration < 10) durationGroups["5-10 min"].calls++;
      else if (duration >= 10 && duration < 20) durationGroups["10-20 min"].calls++;
      else if (duration >= 20) durationGroups["20+ min"].calls++;
    });

    // Revenue from Consultations
    const consultationRevenue = await prisma.$queryRaw<
      Array<{ type: string; revenue: number }>
    >`
      SELECT 
        orderType as type,
        SUM(CAST(totalPayable AS DECIMAL(10,2))) as revenue
      FROM order_request
      WHERE created_at >= ${dateRange.startDate}
        AND created_at <= ${dateRange.endDate}
        AND orderType IN ('chat', 'call')
        AND orderStatus != 'cancelled'
      GROUP BY orderType
    `;

    // Video Call Stats (call_type = 1)
    const videoCalls = await prisma.callrequest.count({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        call_type: 1,
      },
    });

    const audioCalls = currentCalls - videoCalls;

    const response: DashboardResponse = {
      success: true,
      data: {
        summary: {
          totalConsultations,
          comparison: consultationsComparison,
          chats: {
            count: currentChats,
            comparison: chatsComparison,
            free: freeChats,
            paid: currentChats - freeChats,
          },
          calls: {
            count: currentCalls,
            comparison: callsComparison,
            free: freeCalls,
            paid: currentCalls - freeCalls,
            audio: audioCalls,
            video: videoCalls,
          },
        },
        statusBreakdown: {
          chat: chatStatuses.map((s) => ({
            status: s.chatStatus || "Unknown",
            count: s._count,
            percentage: currentChats > 0 ? (s._count / currentChats) * 100 : 0,
          })),
          call: callStatuses.map((s) => ({
            status: s.callStatus || "Unknown",
            count: s._count,
            percentage: currentCalls > 0 ? (s._count / currentCalls) * 100 : 0,
          })),
        },
        duration: {
          avgChatDuration: Math.round(avgChatDuration * 100) / 100,
          avgCallDuration: Math.round(avgCallDuration * 100) / 100,
          distribution: durationGroups,
        },
        charts: {
          dailyTrend: dailyTrend.map((d) => ({
            date: d.date,
            chats: Number(d.chats),
            calls: Number(d.calls),
            videoCalls: Number(d.videoCalls),
            total: Number(d.chats) + Number(d.calls) + Number(d.videoCalls),
          })),
          peakHours: peakHours.map((h) => ({
            hour: Number(h.hour),
            chats: Number(h.chats),
            calls: Number(h.calls),
            total: Number(h.chats) + Number(h.calls),
          })),
          peakDays: peakDays.map((d) => ({
            dayOfWeek: Number(d.dayOfWeek),
            dayName: d.dayName,
            chats: Number(d.chats),
            calls: Number(d.calls),
            total: Number(d.chats) + Number(d.calls),
          })),
        },
        revenue: consultationRevenue.map((r) => ({
          type: r.type,
          revenue: Number(r.revenue),
        })),
      },
      metadata: {
        filter,
        dateRange,
        generatedAt: new Date().toISOString(),
        comparison: { previousRange },
      },
    };

    return NextResponse.json(convertPrismaTypes(response));
  } catch (error) {
    console.error("Consultations dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch consultation analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}