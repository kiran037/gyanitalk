import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";


// 🔹 Helper: convert BigInt / Decimal / Date → JSON-safe primitives
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  // BigInt → string
  if (typeof obj === "bigint") return obj.toString();

  // Prisma Decimal → number (runtime class name "Decimal")
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  // Date → ISO string
  if (obj instanceof Date) return obj.toISOString();

  // Primitives
  if (typeof obj !== "object") return obj;

  // Arrays
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);

  // Objects
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

    // Revenue by Service Type
    const [
      chatRevenue,
      callRevenue,
      productRevenue,
      reportRevenue,
      courseRevenue,
    ] = await Promise.all([
      // Chat Revenue
      prisma.order_request.aggregate({
        where: {
          orderType: "chat",
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
        _count: true,
      }),

      // Call Revenue
      prisma.order_request.aggregate({
        where: {
          orderType: "call",
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
        _count: true,
      }),

      // Product Revenue
      prisma.order_request.aggregate({
        where: {
          orderType: "product",
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
        _count: true,
      }),

      // Report Revenue
      prisma.order_request.aggregate({
        where: {
          orderType: "report",
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          orderStatus: { not: "cancelled" },
        },
        _sum: { totalPayable: true },
        _count: true,
      }),

      // Course Revenue (from course_purchase)
      prisma.course_purchase.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          status: 1,
        },
        _sum: { price: true },
        _count: true,
      }),
    ]);

    const totalRevenue =
      Number(chatRevenue._sum.totalPayable || 0) +
      Number(callRevenue._sum.totalPayable || 0) +
      Number(productRevenue._sum.totalPayable || 0) +
      Number(reportRevenue._sum.totalPayable || 0) +
      Number(courseRevenue._sum.price || 0);

    // Previous period total for comparison
    const previousTotalRevenue = await prisma.order_request.aggregate({
      where: {
        created_at: {
          gte: previousRange.startDate,
          lte: previousRange.endDate,
        },
        orderStatus: { not: "cancelled" },
      },
      _sum: { totalPayable: true },
    });

    const revenueComparison = calculateComparison(
      totalRevenue,
      Number(previousTotalRevenue._sum.totalPayable || 0)
    );

    // 🔹 Daily Revenue Trend (fixed alias names)
    const dailyRevenue = await prisma.$queryRaw<
      Array<{
        date: Date;
        chatRevenue: number;
        callRevenue: number;
        productRevenue: number;
        reportRevenue: number;
      }>
    >`
      SELECT 
        DATE(created_at) as date,
        SUM(
          CASE WHEN orderType = 'chat' 
               THEN CAST(totalPayable AS DECIMAL(10,2)) 
               ELSE 0 
          END
        ) as chatRevenue,
        SUM(
          CASE WHEN orderType = 'call' 
               THEN CAST(totalPayable AS DECIMAL(10,2)) 
               ELSE 0 
          END
        ) as callRevenue,
        SUM(
          CASE WHEN orderType = 'product' 
               THEN CAST(totalPayable AS DECIMAL(10,2)) 
               ELSE 0 
          END
        ) as productRevenue,
        SUM(
          CASE WHEN orderType = 'report' 
               THEN CAST(totalPayable AS DECIMAL(10,2)) 
               ELSE 0 
          END
        ) as reportRevenue
      FROM order_request
      WHERE created_at >= ${dateRange.startDate}
        AND created_at <= ${dateRange.endDate}
        AND orderStatus != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Commission Breakdown
    const commissions = await prisma.commissions.findMany({
      where: {
        isActive: true,
        isDelete: false,
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      include: {
        commissionType: { select: { name: true } },
        astrologer: { select: { id: true, name: true } },
      },
    });

    const adminCommissions = await prisma.admin_get_commissions.aggregate({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isActive: true,
        isDelete: false,
      },
      _sum: { amount: true },
    });

    // Top Revenue Generating Astrologers
    const topAstrologers = await prisma.order_request.groupBy({
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

    const astrologerIds = topAstrologers
      .map((a) => a.astrologerId)
      .filter(Boolean) as bigint[];

    const astrologerDetails = await prisma.astrologers.findMany({
      where: { id: { in: astrologerIds } },
      select: {
        id: true,
        name: true,
        profileImage: true,
        experienceInYears: true,
      },
    });

    const topAstrologersWithDetails = topAstrologers.map((astro) => {
      const details = astrologerDetails.find((d) => d.id === astro.astrologerId);
      return {
        id: astro.astrologerId, // bigint → will be handled by convertPrismaTypes
        name: details?.name || "Unknown",
        profileImage: details?.profileImage,
        experience: details?.experienceInYears,
        revenue: Number(astro._sum.totalPayable) || 0,
        orders: astro._count,
      };
    });

    // Payment Methods Distribution
    const paymentMethods = await prisma.payment.groupBy({
      by: ["paymentMode"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        paymentStatus: "success",
      },
      _sum: { amount: true },
      _count: true,
    });

    // Wallet Transactions
    const walletTransactions = await prisma.wallettransaction.aggregate({
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      _sum: { amount: true },
      _count: true,
    });

    const safeTotal = totalRevenue || 0;

    const response: DashboardResponse = {
      success: true,
      data: {
        summary: {
          totalRevenue: safeTotal,
          comparison: revenueComparison,
          adminEarnings: Number(adminCommissions._sum.amount || 0),
          astrologerEarnings:
            safeTotal - Number(adminCommissions._sum.amount || 0),
        },
        revenueByService: {
          chat: {
            revenue: Number(chatRevenue._sum.totalPayable || 0),
            count: chatRevenue._count,
            percentage:
              safeTotal > 0
                ? (Number(chatRevenue._sum.totalPayable || 0) / safeTotal) * 100
                : 0,
          },
          call: {
            revenue: Number(callRevenue._sum.totalPayable || 0),
            count: callRevenue._count,
            percentage:
              safeTotal > 0
                ? (Number(callRevenue._sum.totalPayable || 0) / safeTotal) * 100
                : 0,
          },
          product: {
            revenue: Number(productRevenue._sum.totalPayable || 0),
            count: productRevenue._count,
            percentage:
              safeTotal > 0
                ? (Number(productRevenue._sum.totalPayable || 0) / safeTotal) * 100
                : 0,
          },
          report: {
            revenue: Number(reportRevenue._sum.totalPayable || 0),
            count: reportRevenue._count,
            percentage:
              safeTotal > 0
                ? (Number(reportRevenue._sum.totalPayable || 0) / safeTotal) * 100
                : 0,
          },
          course: {
            revenue: Number(courseRevenue._sum.price || 0),
            count: courseRevenue._count,
            percentage:
              safeTotal > 0
                ? (Number(courseRevenue._sum.price || 0) / safeTotal) * 100
                : 0,
          },
        },
        charts: {
          dailyTrend: dailyRevenue.map((d) => ({
            date: d.date, // Date → handled by convertPrismaTypes
            chat: Number(d.chatRevenue),
            call: Number(d.callRevenue),
            product: Number(d.productRevenue),
            report: Number(d.reportRevenue),
            total:
              Number(d.chatRevenue) +
              Number(d.callRevenue) +
              Number(d.productRevenue) +
              Number(d.reportRevenue),
          })),
          topAstrologers: topAstrologersWithDetails,
          paymentMethods: paymentMethods.map((pm) => ({
            method: pm.paymentMode || "Unknown",
            amount: Number(pm._sum.amount || 0),
            count: pm._count,
          })),
        },
        commissions: {
          total: commissions.reduce((sum, c) => sum + c.commission, 0),
          byType: commissions.reduce((acc, c) => {
            const typeName = c.commissionType.name;
            if (!acc[typeName]) {
              acc[typeName] = { total: 0, count: 0 };
            }
            acc[typeName].total += c.commission;
            acc[typeName].count += 1;
            return acc;
          }, {} as Record<string, { total: number; count: number }>),
        },
        walletStats: {
          totalTransactions: Number(walletTransactions._sum.amount || 0),
          transactionCount: walletTransactions._count,
        },
      },
      metadata: {
        filter,
        dateRange,
        generatedAt: new Date().toISOString(),
        comparison: { previousRange },
      },
    };

    // 🔹 Make response JSON-safe (fixes BigInt error)
    const safe = convertPrismaTypes(response);

    return NextResponse.json(safe);
  } catch (error) {
    console.error("Revenue dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch revenue data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}