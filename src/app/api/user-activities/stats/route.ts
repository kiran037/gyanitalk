// app/api/user-activities/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const period = searchParams.get("period") || "30"; // days
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers,
      newUsers,
      chatStats,
      callStats,
      orderStats,
      revenueStats,
      engagementStats,
    ] = await Promise.all([
      // Total users
      prisma.users.count({
        where: { isDelete: false },
      }),

      // Active users (had activity in period)
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT userId) as count
        FROM (
          SELECT userId FROM chatrequest WHERE created_at >= ${startDate}
          UNION
          SELECT userId FROM callrequest WHERE created_at >= ${startDate}
          UNION
          SELECT userId FROM order_request WHERE created_at >= ${startDate}
        ) as active_users
      `,

      // New users in period
      prisma.users.count({
        where: {
          isDelete: false,
          created_at: { gte: startDate },
        },
      }),

      // Chat statistics
      prisma.chatrequest.aggregate({
        where: { created_at: { gte: startDate } },
        _count: { id: true },
        _sum: { deduction: true },
        _avg: { deduction: true },
      }),

      // Call statistics
      prisma.callrequest.aggregate({
        where: { created_at: { gte: startDate } },
        _count: { id: true },
        _sum: { deduction: true },
        _avg: { deduction: true },
      }),

      // Order statistics
      prisma.order_request.aggregate({
        where: { created_at: { gte: startDate } },
        _count: { id: true },
        _sum: { totalPayable: true },
        _avg: { totalPayable: true },
      }),

      // Revenue by type
      prisma.$queryRaw<
        Array<{ transactionType: string; total: number; count: bigint }>
      >`
        SELECT 
          transactionType,
          SUM(amount) as total,
          COUNT(*) as count
        FROM wallettransaction
        WHERE created_at >= ${startDate}
        AND isCredit = true
        GROUP BY transactionType
      `,

      // Engagement metrics
      prisma.$queryRaw<
        Array<{
          totalReviews: bigint;
          avgRating: number;
          totalFollows: bigint;
          totalGifts: bigint;
        }>
      >`
        SELECT
          (SELECT COUNT(*) FROM user_reviews WHERE created_at >= ${startDate}) as totalReviews,
          (SELECT AVG(rating) FROM user_reviews WHERE created_at >= ${startDate}) as avgRating,
          (SELECT COUNT(*) FROM astrologer_followers WHERE created_at >= ${startDate}) as totalFollows,
          (SELECT COUNT(*) FROM astrologer_gifts WHERE created_at >= ${startDate}) as totalGifts
      `,
    ]);

    // Top astrologers by engagement
    const topAstrologers = await prisma.$queryRaw<
      Array<{
        id: bigint;
        name: string;
        totalChats: bigint;
        totalCalls: bigint;
        totalRevenue: number;
      }>
    >`
      SELECT 
        a.id,
        a.name,
        COALESCE(c.chatCount, 0) as totalChats,
        COALESCE(cal.callCount, 0) as totalCalls,
        COALESCE(c.chatRevenue, 0) + COALESCE(cal.callRevenue, 0) as totalRevenue
      FROM astrologers a
      LEFT JOIN (
        SELECT astrologerId, COUNT(*) as chatCount, SUM(deduction) as chatRevenue
        FROM chatrequest
        WHERE created_at >= ${startDate}
        GROUP BY astrologerId
      ) c ON a.id = c.astrologerId
      LEFT JOIN (
        SELECT astrologerId, COUNT(*) as callCount, SUM(deduction) as callRevenue
        FROM callrequest
        WHERE created_at >= ${startDate}
        GROUP BY astrologerId
      ) cal ON a.id = cal.astrologerId
      WHERE a.isDelete = false
      ORDER BY totalRevenue DESC
      LIMIT 10
    `;

    // Most popular products
    const topProducts = await prisma.$queryRaw<
      Array<{
        id: bigint;
        name: string;
        orderCount: bigint;
        revenue: number;
      }>
    >`
      SELECT 
        p.id,
        p.name,
        COUNT(oro.id) as orderCount,
        SUM(oro.totalPayable) as revenue
      FROM astromall_products p
      JOIN order_request oro ON p.id = oro.productId
      WHERE oro.created_at >= ${startDate}
      AND p.isDelete = false
      GROUP BY p.id, p.name
      ORDER BY orderCount DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      data: {
        period: `Last ${periodDays} days`,
        overview: {
          totalUsers,
          activeUsers: Number(activeUsers[0]?.count || 0),
          newUsers,
          activeRate:
            totalUsers > 0
              ? ((Number(activeUsers[0]?.count || 0) / totalUsers) * 100).toFixed(2)
              : 0,
        },
        activity: {
          chats: {
            total: chatStats._count.id,
            revenue: chatStats._sum.deduction || 0,
            average: chatStats._avg.deduction || 0,
          },
          calls: {
            total: callStats._count.id,
            revenue: callStats._sum.deduction || 0,
            average: callStats._avg.deduction || 0,
          },
          orders: {
            total: orderStats._count.id,
            revenue: orderStats._sum.totalPayable || 0,
            average: orderStats._avg.totalPayable || 0,
          },
        },
        revenue: {
          total:
            (chatStats._sum.deduction || 0) +
            (callStats._sum.deduction || 0) +
            Number(orderStats._sum.totalPayable || 0),
          byType: revenueStats.map((r) => ({
            type: r.transactionType,
            total: r.total,
            count: Number(r.count),
          })),
        },
        engagement: {
          reviews: {
            total: Number(engagementStats[0]?.totalReviews || 0),
            averageRating: engagementStats[0]?.avgRating || 0,
          },
          follows: Number(engagementStats[0]?.totalFollows || 0),
          gifts: Number(engagementStats[0]?.totalGifts || 0),
        },
        topPerformers: {
          astrologers: topAstrologers.map((a) => ({
            id: a.id.toString(),
            name: a.name,
            totalChats: Number(a.totalChats),
            totalCalls: Number(a.totalCalls),
            totalRevenue: a.totalRevenue,
          })),
          products: topProducts.map((p) => ({
            id: p.id.toString(),
            name: p.name,
            orderCount: Number(p.orderCount),
            revenue: p.revenue,
          })),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user activity stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity stats" },
      { status: 500 }
    );
  }
}