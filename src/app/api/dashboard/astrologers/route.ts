import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

// 🔹 Helper: convert BigInt / Decimal / Date → JSON-safe values
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

    // Astrologer Overview Metrics
    const [
      totalAstrologers,
      activeAstrologers,
      onlineAstrologers,
      newAstrologers,
      previousNewAstrologers,
    ] = await Promise.all([
      // Total astrologers
      prisma.astrologers.count({
        where: { isDelete: false },
      }),

      // Active astrologers (took at least 1 consultation)
      prisma.astrologers.count({
        where: {
          isActive: true,
          isDelete: false,
          OR: [
            {
              chatrequests: {
                some: {
                  created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
                },
              },
            },
            {
              callrequests: {
                some: {
                  created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
                },
              },
            },
          ],
        },
      }),

      // Currently online
      prisma.astrologers.count({
        where: {
          isActive: true,
          isDelete: false,
          chatStatus: "online",
        },
      }),

      // New astrologers in current period
      prisma.astrologers.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
      }),

      // New astrologers in previous period
      prisma.astrologers.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          isDelete: false,
        },
      }),
    ]);

    const newAstrologersComparison = calculateComparison(newAstrologers, previousNewAstrologers);

    // Top Astrologers by Revenue
    const topByRevenue = await prisma.order_request.groupBy({
      by: ["astrologerId"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        astrologerId: { not: null },
        orderStatus: { not: "cancelled" },
      },
      _sum: { totalPayable: true },
      _count: true,
      orderBy: { _sum: { totalPayable: "desc" } },
      take: 10,
    });

    // Top Astrologers by Ratings
    const topByRating = await prisma.user_reviews.groupBy({
      by: ["astrologerId"],
      where: {
        astrologerId: { not: null },
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: false,
      },
      _avg: { rating: true },
      _count: true,
      orderBy: { _avg: { rating: "desc" } },
      take: 10,
    });

    // Top Astrologers by Consultations
    const topByConsultations = await prisma.$queryRaw<
      Array<{ astrologerId: bigint; consultations: number }>
    >`
      SELECT astrologerId, COUNT(*) as consultations
      FROM (
        SELECT astrologerId FROM chatrequest 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
        UNION ALL
        SELECT astrologerId FROM callrequest 
        WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
      ) as all_consultations
      WHERE astrologerId IS NOT NULL
      GROUP BY astrologerId
      ORDER BY consultations DESC
      LIMIT 10
    `;

    // Get astrologer details for all top lists
    const allAstrologerIds = [
      ...topByRevenue.map((a) => a.astrologerId),
      ...topByRating.map((a) => a.astrologerId),
      ...topByConsultations.map((a) => a.astrologerId),
    ].filter(Boolean) as bigint[];

    const uniqueAstrologerIds = [...new Set(allAstrologerIds)];

    const astrologerDetails = await prisma.astrologers.findMany({
      where: { id: { in: uniqueAstrologerIds } },
      select: {
        id: true,
        name: true,
        profileImage: true,
        experienceInYears: true,
        primarySkill: true,
        charge: true,
      },
    });

const topRevenueAstrologers = topByRevenue.map((astro) => {
  const details = astrologerDetails.find((d) => d.id === astro.astrologerId);
  return {
    id: astro.astrologerId?.toString(),   // 👈 stringify ID
    name: details?.name || "Unknown",
    profileImage: details?.profileImage,
    experience: details?.experienceInYears,
    primarySkill: details?.primarySkill,
    revenue: Number(astro._sum.totalPayable || 0),
    consultations: astro._count,
  };
});

const topRatingAstrologers = topByRating.map((astro) => {
  const details = astrologerDetails.find((d) => d.id === astro.astrologerId);
  return {
    id: astro.astrologerId?.toString(),   // 👈 stringify ID
    name: details?.name || "Unknown",
    profileImage: details?.profileImage,
    experience: details?.experienceInYears,
    avgRating: Number(astro._avg.rating || 0),
    reviewCount: astro._count,
  };
});

const topConsultationAstrologers = topByConsultations.map((astro) => {
  const details = astrologerDetails.find((d) => d.id === astro.astrologerId);
  return {
    id: astro.astrologerId?.toString(),   // 👈 stringify ID
    name: details?.name || "Unknown",
    profileImage: details?.profileImage,
    consultations: Number(astro.consultations),
  };
});

    // Average Rating Trend
    const ratingTrend = await prisma.$queryRaw<
      Array<{ date: Date; avgRating: number; count: number }>
    >`
      SELECT 
        DATE(created_at) as date,
        AVG(rating) as avgRating,
        COUNT(*) as count
      FROM user_reviews
      WHERE created_at >= ${dateRange.startDate}
        AND created_at <= ${dateRange.endDate}
        AND astrologerId IS NOT NULL
        AND isDelete = false
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Availability Heatmap Data (Day of week and hour)
    const availabilityData = await prisma.astrologer_availabilities.findMany({
      where: {
        isActive: true,
        isDelete: false,
      },
      select: {
        day: true,
        fromTime: true,
        toTime: true,
        astrologerId: true,
      },
    });

    // Process availability into heatmap format
    const heatmapData: Record<string, Record<number, number>> = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    days.forEach((day) => {
      heatmapData[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        heatmapData[day][hour] = 0;
      }
    });

    availabilityData.forEach((avail) => {
      if (avail.fromTime && avail.toTime && avail.day) {
        const fromHour = parseInt(avail.fromTime.split(":")[0]);
        const toHour = parseInt(avail.toTime.split(":")[0]);
        for (let hour = fromHour; hour <= toHour; hour++) {
          if (heatmapData[avail.day]) {
            heatmapData[avail.day][hour]++;
          }
        }
      }
    });

    // Average Wait Time
    const waitTimes = await prisma.astrologer_wait_lists.findMany({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isActive: true,
        isDelete: false,
      },
      select: {
        astrologerId: true,
        waitingTime: true,
      },
    });

    const avgWaitTimeByAstrologer = waitTimes.reduce((acc, wt) => {
      if (!acc[wt.astrologerId.toString()]) {
        acc[wt.astrologerId.toString()] = { total: 0, count: 0 };
      }
      acc[wt.astrologerId.toString()].total += wt.waitingTime;
      acc[wt.astrologerId.toString()].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const overallAvgWaitTime =
      waitTimes.length > 0
        ? waitTimes.reduce((sum, wt) => sum + wt.waitingTime, 0) / waitTimes.length
        : 0;

    // Consultation Completion Rate
    const [completedChats, totalChats, completedCalls, totalCalls] = await Promise.all([
      prisma.chatrequest.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          chatStatus: "Completed",
        },
      }),
      prisma.chatrequest.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),
      prisma.callrequest.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          callStatus: "Completed",
        },
      }),
      prisma.callrequest.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),
    ]);

    // Skill Distribution
    const astrologersWithSkills = await prisma.astrologers.findMany({
      where: { isDelete: false },
      select: { primarySkill: true },
    });

    const skillDistribution = astrologersWithSkills.reduce((acc, astro) => {
      const skill = astro.primarySkill || "Unknown";
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Experience Distribution
    const experienceGroups = {
      "0-2 years": 0,
      "3-5 years": 0,
      "6-10 years": 0,
      "10+ years": 0,
    };

    const astrologersWithExp = await prisma.astrologers.findMany({
      where: { isDelete: false },
      select: { experienceInYears: true },
    });

    astrologersWithExp.forEach((astro) => {
      const exp = astro.experienceInYears;
      if (exp >= 0 && exp <= 2) experienceGroups["0-2 years"]++;
      else if (exp >= 3 && exp <= 5) experienceGroups["3-5 years"]++;
      else if (exp >= 6 && exp <= 10) experienceGroups["6-10 years"]++;
      else if (exp > 10) experienceGroups["10+ years"]++;
    });

    const response: DashboardResponse = {
      success: true,
      data: {
        summary: {
          totalAstrologers,
          activeAstrologers,
          onlineAstrologers,
          newAstrologers,
          comparison: newAstrologersComparison,
          avgWaitTime: Math.round(overallAvgWaitTime),
        },
        leaderboards: {
          byRevenue: topRevenueAstrologers,
          byRating: topRatingAstrologers,
          byConsultations: topConsultationAstrologers,
        },
        performance: {
          chatCompletionRate: totalChats > 0 ? (completedChats / totalChats) * 100 : 0,
          callCompletionRate: totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0,
        },
        charts: {
          ratingTrend: ratingTrend.map((r) => ({
            date: r.date,
            avgRating: Number(r.avgRating),
            count: Number(r.count),
          })),
          availabilityHeatmap: heatmapData,
          skillDistribution,
          experienceDistribution: experienceGroups,
        },
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
    console.error("Astrologers dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch astrologer analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}