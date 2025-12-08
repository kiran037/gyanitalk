// app/api/user-activities/[userId]/patterns/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Next 15: params is a Promise
type RouteContext = {
  params: Promise<{ userId: string }>;
};

async function getUserId(context: RouteContext): Promise<bigint> {
  const { userId } = await context.params; // unwrap params Promise

  const trimmed = userId?.trim();
  if (!trimmed || !/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid userId: "${userId}"`);
  }

  return BigInt(trimmed);
}


export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserId(context); // bigint

    // Get activity patterns over time
    const [
      chatsByMonth,
      callsByMonth,
      ordersByMonth,
      rechargeHistory,
      mostChattedAstrologers,
      mostCalledAstrologers,
      preferredCategories,
      activityByDayOfWeek,
    ] = await Promise.all([
      // Chats grouped by month
      prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as count
        FROM chatrequest
        WHERE userId = ${userId}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `,

      // Calls grouped by month
      prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as count
        FROM callrequest
        WHERE userId = ${userId}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `,

      // Orders grouped by month (userId is Int in this table → use Number)
      prisma.$queryRaw<Array<{ month: string; count: bigint; total: number }>>`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as count,
          SUM(totalPayable) as total
        FROM order_request
        WHERE userId = ${Number(userId)}
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ORDER BY month DESC
      `,

      // Recharge pattern (wallet credits)
      prisma.wallettransaction.findMany({
        where: {
          userId,
          isCredit: true,
          created_at: {
            gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months
          },
        },
        select: {
          amount: true,
          created_at: true,
          transactionType: true,
        },
        orderBy: { created_at: "desc" },
      }),

      // Most chatted astrologers
      prisma.$queryRaw<
        Array<{ astrologerId: bigint; name: string; count: bigint }>
      >`
        SELECT 
          cr.astrologerId,
          a.name,
          COUNT(*) as count
        FROM chatrequest cr
        JOIN astrologers a ON cr.astrologerId = a.id
        WHERE cr.userId = ${userId}
        GROUP BY cr.astrologerId, a.name
        ORDER BY count DESC
        LIMIT 5
      `,

      // Most called astrologers
      prisma.$queryRaw<
        Array<{ astrologerId: bigint; name: string; count: bigint }>
      >`
        SELECT 
          cr.astrologerId,
          a.name,
          COUNT(*) as count
        FROM callrequest cr
        JOIN astrologers a ON cr.astrologerId = a.id
        WHERE cr.userId = ${userId}
        AND cr.astrologerId IS NOT NULL
        GROUP BY cr.astrologerId, a.name
        ORDER BY count DESC
        LIMIT 5
      `,

      // Preferred product categories (userId is Int here)
      prisma.$queryRaw<
        Array<{ categoryId: bigint; categoryName: string; count: bigint }>
      >`
        SELECT 
          oro.productCategoryId as categoryId,
          pc.name as categoryName,
          COUNT(*) as count
        FROM order_request oro
        JOIN product_categories pc ON oro.productCategoryId = pc.id
        WHERE oro.userId = ${Number(userId)}
        AND oro.productCategoryId IS NOT NULL
        GROUP BY oro.productCategoryId, pc.name
        ORDER BY count DESC
        LIMIT 5
      `,

      // Activity by day of week
      prisma.$queryRaw<Array<{ dayOfWeek: number; count: bigint }>>`
        SELECT 
          DAYOFWEEK(created_at) as dayOfWeek,
          COUNT(*) as count
        FROM (
          SELECT created_at FROM chatrequest WHERE userId = ${userId}
          UNION ALL
          SELECT created_at FROM callrequest WHERE userId = ${userId}
        ) as combined
        GROUP BY DAYOFWEEK(created_at)
        ORDER BY dayOfWeek
      `,
    ]);

    // Day names mapping
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return NextResponse.json({
      success: true,
      data: {
        trends: {
          chats: chatsByMonth.map((m) => ({
            month: m.month,
            count: Number(m.count),
          })),
          calls: callsByMonth.map((m) => ({
            month: m.month,
            count: Number(m.count),
          })),
          orders: ordersByMonth.map((m) => ({
            month: m.month,
            count: Number(m.count),
            total: Number(m.total ?? 0),
          })),

        },
        rechargePattern: {
          total: rechargeHistory.length,
          last6Months: rechargeHistory.map((r) => ({
            amount: Number(r.amount) || 0,
            date: r.created_at,
            type: r.transactionType,
          })),
          averageRecharge:
            rechargeHistory.reduce(
              (sum, r) => sum + (Number(r.amount) || 0),
              0
            ) / (rechargeHistory.length || 1),
        },
        preferences: {
          topChattedAstrologers: mostChattedAstrologers.map((a) => ({
            id: a.astrologerId.toString(),
            name: a.name,
            count: Number(a.count),
          })),
          topCalledAstrologers: mostCalledAstrologers.map((a) => ({
            id: a.astrologerId.toString(),
            name: a.name,
            count: Number(a.count),
          })),
          favoriteCategories: preferredCategories.map((c) => ({
            id: c.categoryId.toString(),
            name: c.categoryName,
            count: Number(c.count),
          })),
        },
        weeklyPattern: activityByDayOfWeek.map((d) => ({
          day: dayNames[d.dayOfWeek - 1],
          count: Number(d.count),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user activity patterns:", error);
    return NextResponse.json(
      { error: "Failed to fetch user activity patterns" },
      { status: 500 }
    );
  }
}
