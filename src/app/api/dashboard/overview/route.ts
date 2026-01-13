
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

// 🔹 Helper: convert BigInt / Decimal / Date → JSON-safe
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "bigint") return obj.toString();

  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  if (obj instanceof Date) return obj.toISOString();

  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

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

    const dateRange = getDateRange(
      filter,
      customStart || undefined,
      customEnd || undefined
    );
    const previousRange = getPreviousDateRange(dateRange);

    // Parallel queries for stats
    const [
      currentRevenue,
      previousRevenue,
      currentUsers,
      previousUsers,
      activeAstrologers,
      todayConsultations,
      previousConsultations,
      currentOrders,
      previousOrders,
    ] = await Promise.all([
      // Current Revenue
      prisma.order_request.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
      }),
      // Previous Revenue
      prisma.order_request.aggregate({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
      }),
      // Users
      prisma.users.count({
        where: {
          isActive: true,
          isDelete: false,
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        },
      }),
      prisma.users.count({
        where: {
          isActive: true,
          isDelete: false,
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
        },
      }),
      // Active Astrologers
      prisma.astrologers.count({
        where: { isActive: true, isDelete: false, chatStatus: "online" },
      }),
      // Consultations (Current)
      prisma.$transaction([
        prisma.chatrequest.count({ where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } } }),
        prisma.callrequest.count({ where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } } }),
      ]),
      // Consultations (Previous)
      prisma.$transaction([
        prisma.chatrequest.count({ where: { created_at: { gte: previousRange.startDate, lte: previousRange.endDate } } }),
        prisma.callrequest.count({ where: { created_at: { gte: previousRange.startDate, lte: previousRange.endDate } } }),
      ]),
      // Orders
      prisma.order_request.count({ where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } } }),
      prisma.order_request.count({ where: { created_at: { gte: previousRange.startDate, lte: previousRange.endDate } } }),
    ]);

    // Values calculation
    const currentRevenueValue = Number(currentRevenue._sum.totalPayable) || 0;
    const previousRevenueValue = Number(previousRevenue._sum.totalPayable) || 0;
    const currentConsultationsTotal = todayConsultations[0] + todayConsultations[1];
    const previousConsultationsTotal = previousConsultations[0] + previousConsultations[1];

    const revenueComparison = calculateComparison(currentRevenueValue, previousRevenueValue);
    const usersComparison = calculateComparison(currentUsers, previousUsers);
    const consultationsComparison = calculateComparison(currentConsultationsTotal, previousConsultationsTotal);
    const ordersComparison = calculateComparison(currentOrders, previousOrders);

    // Revenue Trend
    const revenueTrend = await prisma.$queryRaw<Array<{ date: Date; revenue: number }>>`
      SELECT 
        DATE(created_at) as date,
        SUM(CAST(totalPayable AS DECIMAL(10,2))) as revenue
      FROM order_request
      WHERE created_at >= ${dateRange.startDate}
        AND created_at <= ${dateRange.endDate}
        AND orderStatus != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // --- TOP ASTROLOGERS (With Image Fix) ---
    const topAstrologersRaw = await prisma.order_request.groupBy({
      by: ["astrologerId"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        astrologerId: { not: null },
      },
      _sum: { totalPayable: true },
      _count: true,
      orderBy: { _sum: { totalPayable: "desc" } },
      take: 5,
    });

    const topAstroIds = topAstrologersRaw
      .map((a) => a.astrologerId)
      .filter((id) => id !== null) as bigint[];

    const astroDetails = await prisma.astrologers.findMany({
      where: { id: { in: topAstroIds } },
      select: { 
        id: true, 
        name: true, 
        profileImage: true,
        // Fallback for missing images
        users: { select: { profile: true } }
      },
    });

    const topAstrologersWithDetails = topAstrologersRaw.map((astro) => {
      const details = astroDetails.find((d) => d.id === astro.astrologerId);
      const img = details?.profileImage || details?.users?.profile || null;
      
      return {
        id: astro.astrologerId,
        name: details?.name || "Unknown",
        profileImage: img,
        revenue: Number(astro._sum.totalPayable) || 0,
        orders: astro._count,
      };
    });

    // --- RECENT ACTIVITY (Manual Join Fix) ---
    // 1. Fetch Raw Orders
    const recentOrdersRaw = await prisma.order_request.findMany({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      orderBy: { created_at: "desc" },
      take: 10,
      select: {
        id: true,
        userId: true,
        astrologerId: true,
        orderType: true,
        totalPayable: true,
        orderStatus: true,
        created_at: true
      }
    });

    // 2. Extract IDs
    const userIds = new Set<string>();
    const astroIds = new Set<string>();

    recentOrdersRaw.forEach(o => {
        if (o.userId) userIds.add(o.userId.toString());
        if (o.astrologerId) astroIds.add(o.astrologerId.toString());
    });

    // 3. Manual Fetch - Users
    const userMap = new Map();
    if (userIds.size > 0) {
        const users = await prisma.users.findMany({
            where: { id: { in: Array.from(userIds).map(id => BigInt(id)) } },
            select: { id: true, name: true, profile: true }
        });
        users.forEach(u => userMap.set(u.id.toString(), u));
    }

    // 4. Manual Fetch - Astrologers
    const astroMap = new Map();
    if (astroIds.size > 0) {
        const astros = await prisma.astrologers.findMany({
            where: { id: { in: Array.from(astroIds).map(id => BigInt(id)) } },
            select: { id: true, name: true }
        });
        astros.forEach(a => astroMap.set(a.id.toString(), a));
    }

    // 5. Stitch
    const recentActivity = recentOrdersRaw.map((order) => {
        const u = order.userId ? userMap.get(order.userId.toString()) : null;
        const a = order.astrologerId ? astroMap.get(order.astrologerId.toString()) : null;

        return {
            id: order.id,
            type: order.orderType,
            user: {
                id: order.userId,
                name: u?.name || "Unknown User",
                profile: u?.profile || null,
            },
            astrologer: {
                id: order.astrologerId,
                name: a?.name || "N/A",
            },
            amount: Number(order.totalPayable) || 0,
            status: order.orderStatus,
            createdAt: order.created_at,
        };
    });

    const response: DashboardResponse = {
      success: true,
      data: {
        cards: {
          revenue: {
            value: currentRevenueValue,
            label: "Total Revenue",
            comparison: revenueComparison,
            format: "currency",
          },
          users: {
            value: currentUsers,
            label: "New Users",
            comparison: usersComparison,
            format: "number",
          },
          astrologers: {
            value: activeAstrologers,
            label: "Active Astrologers",
            format: "number",
          },
          consultations: {
            value: currentConsultationsTotal,
            label: "Consultations",
            comparison: consultationsComparison,
            format: "number",
            breakdown: {
              chat: todayConsultations[0],
              call: todayConsultations[1],
            },
          },
          orders: {
            value: currentOrders,
            label: "Total Orders",
            comparison: ordersComparison,
            format: "number",
          },
        },
        charts: {
          revenueTrend: revenueTrend.map((r) => ({
            date: r.date,
            revenue: Number(r.revenue) || 0,
          })),
          topAstrologers: topAstrologersWithDetails,
        },
        recentActivity: recentActivity,
      },
      metadata: {
        filter,
        dateRange,
        generatedAt: new Date().toISOString(),
        comparison: {
          previousRange,
        },
      },
    };

    const safe = convertPrismaTypes(response);
    return NextResponse.json(safe);
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard overview",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}