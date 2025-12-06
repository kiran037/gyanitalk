// app/api/dashboard/overview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

const prisma = new PrismaClient();

// 🔹 Helper: convert BigInt / Decimal / Date → JSON-safe
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

    const dateRange = getDateRange(
      filter,
      customStart || undefined,
      customEnd || undefined
    );
    const previousRange = getPreviousDateRange(dateRange);

    // Parallel queries for better performance
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
          created_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
      }),

      // Previous Revenue
      prisma.order_request.aggregate({
        where: {
          created_at: {
            gte: previousRange.startDate,
            lte: previousRange.endDate,
          },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
      }),

      // Current Active Users
      prisma.users.count({
        where: {
          isActive: true,
          isDelete: false,
          created_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      }),

      // Previous Active Users
      prisma.users.count({
        where: {
          isActive: true,
          isDelete: false,
          created_at: {
            gte: previousRange.startDate,
            lte: previousRange.endDate,
          },
        },
      }),

      // Active Astrologers (currently online or available)
      prisma.astrologers.count({
        where: {
          isActive: true,
          isDelete: false,
          chatStatus: "online",
        },
      }),

      // Today's Consultations
      prisma.$transaction([
        prisma.chatrequest.count({
          where: {
            created_at: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
        }),
        prisma.callrequest.count({
          where: {
            created_at: {
              gte: dateRange.startDate,
              lte: dateRange.endDate,
            },
          },
        }),
      ]),

      // Previous Consultations
      prisma.$transaction([
        prisma.chatrequest.count({
          where: {
            created_at: {
              gte: previousRange.startDate,
              lte: previousRange.endDate,
            },
          },
        }),
        prisma.callrequest.count({
          where: {
            created_at: {
              gte: previousRange.startDate,
              lte: previousRange.endDate,
            },
          },
        }),
      ]),

      // Current Orders
      prisma.order_request.count({
        where: {
          created_at: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        },
      }),

      // Previous Orders
      prisma.order_request.count({
        where: {
          created_at: {
            gte: previousRange.startDate,
            lte: previousRange.endDate,
          },
        },
      }),
    ]);

    const currentRevenueValue = Number(currentRevenue._sum.totalPayable) || 0;
    const previousRevenueValue = Number(previousRevenue._sum.totalPayable) || 0;

    const currentConsultationsTotal =
      todayConsultations[0] + todayConsultations[1];
    const previousConsultationsTotal =
      previousConsultations[0] + previousConsultations[1];

    // Calculate comparisons
    const revenueComparison = calculateComparison(
      currentRevenueValue,
      previousRevenueValue
    );
    const usersComparison = calculateComparison(currentUsers, previousUsers);
    const consultationsComparison = calculateComparison(
      currentConsultationsTotal,
      previousConsultationsTotal
    );
    const ordersComparison = calculateComparison(
      currentOrders,
      previousOrders
    );

    // Get revenue trend (daily breakdown)
    const revenueTrend = await prisma.$queryRaw<
      Array<{ date: Date; revenue: number }>
    >`
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

    // Get top astrologers
    const topAstrologers = await prisma.order_request.groupBy({
      by: ["astrologerId"],
      where: {
        created_at: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
        astrologerId: { not: null },
      },
      _sum: { totalPayable: true },
      _count: true,
      orderBy: { _sum: { totalPayable: "desc" } },
      take: 5,
    });

    // Get astrologer details
    const astrologerIds = topAstrologers
      .map((a) => a.astrologerId)
      .filter(Boolean) as bigint[];

    const astrologerDetails = await prisma.astrologers.findMany({
      where: { id: { in: astrologerIds } },
      select: { id: true, name: true, profileImage: true },
    });

    const topAstrologersWithDetails = topAstrologers.map((astro) => {
      const details = astrologerDetails.find(
        (d) => d.id === astro.astrologerId
      );
      return {
        id: astro.astrologerId, // BigInt will be converted by convertPrismaTypes
        name: details?.name || "Unknown",
        profileImage: details?.profileImage,
        revenue: Number(astro._sum.totalPayable) || 0,
        orders: astro._count,
      };
    });

    // Recent activities
    const recentOrders = await prisma.order_request.findMany({
      where: {
        created_at: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      },
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        user: { select: { id: true, name: true, profile: true } },
        astrologer: { select: { id: true, name: true } },
      },
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
            date: r.date, // Date → ISO string via helper
            revenue: Number(r.revenue) || 0,
          })),
          topAstrologers: topAstrologersWithDetails,
        },
        recentActivity: recentOrders.map((order) => ({
          id: order.id, // BigInt → string via helper
          type: order.orderType,
          user: {
            id: order.user?.id, // BigInt → string via helper
            name: order.user?.name || "Unknown",
            profile: order.user?.profile,
          },
          astrologer: {
            id: order.astrologer?.id, // BigInt → string via helper
            name: order.astrologer?.name || "N/A",
          },
          amount: Number(order.totalPayable) || 0,
          status: order.orderStatus,
          createdAt: order.created_at, // Date → ISO via helper
        })),
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

    // 🔹 IMPORTANT: convert BigInt/Date before sending
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
  } finally {
    await prisma.$disconnect();
  }
}