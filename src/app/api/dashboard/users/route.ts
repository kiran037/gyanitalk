import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  getDateRange,
  getPreviousDateRange,
  calculateComparison,
} from "../utils/dateFilter";
import { DashboardResponse } from "../utils/types";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "last_30_days";
    const customStart = searchParams.get("startDate");
    const customEnd = searchParams.get("endDate");

    const dateRange = getDateRange(filter, customStart || undefined, customEnd || undefined);
    const previousRange = getPreviousDateRange(dateRange);

    // User Growth Metrics
    const [
      currentNewUsers,
      previousNewUsers,
      totalActiveUsers,
      currentActiveUsers,
      genderDistribution,
      locationDistribution,
    ] = await Promise.all([
      // New users in current period
      prisma.users.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: false,
        },
      }),

      // New users in previous period
      prisma.users.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          isDelete: false,
        },
      }),

      // Total active users (all time)
      prisma.users.count({
        where: { isActive: true, isDelete: false },
      }),

      // Active users in current period (made an order or consultation)
      prisma.users.count({
        where: {
          isActive: true,
          isDelete: false,
          OR: [
            {
              order_request: {
                some: {
                  created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
                },
              },
            },
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

      // Gender Distribution
      prisma.users.groupBy({
        by: ["gender"],
        where: {
          isDelete: false,
          gender: { not: null },
        },
        _count: true,
      }),

      // Location Distribution
      prisma.users.groupBy({
        by: ["location"],
        where: {
          isDelete: false,
          location: { not: null },
        },
        _count: true,
        orderBy: { _count: { location: "desc" } },
        take: 10,
      }),
    ]);

    const userGrowthComparison = calculateComparison(currentNewUsers, previousNewUsers);

    // Daily User Registration Trend
    const dailyRegistrations = await prisma.$queryRaw<
      Array<{ date: Date; count: number }>
    >`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= ${dateRange.startDate}
        AND created_at <= ${dateRange.endDate}
        AND isDelete = false
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // User Engagement Metrics
    const [totalConsultations, repeatUsers, walletStats] = await Promise.all([
      // Total consultations per user
      prisma.$queryRaw<Array<{ userId: bigint; consultations: number }>>`
        SELECT userId, COUNT(*) as consultations
        FROM (
          SELECT userId FROM chatrequest WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
          UNION ALL
          SELECT userId FROM callrequest WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
        ) as all_consultations
        GROUP BY userId
      `,

      // Repeat users (more than 1 consultation)
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT userId) as count
        FROM (
          SELECT userId, COUNT(*) as consultation_count
          FROM (
            SELECT userId FROM chatrequest WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
            UNION ALL
            SELECT userId FROM callrequest WHERE created_at >= ${dateRange.startDate} AND created_at <= ${dateRange.endDate}
          ) as all_consultations
          GROUP BY userId
          HAVING consultation_count > 1
        ) as repeat_users
      `,

      // Wallet Statistics
      prisma.user_wallets.aggregate({
        where: {
          isActive: true,
          isDelete: false,
        },
        _sum: { amount: true },
        _avg: { amount: true },
      }),
    ]);

    // Age Distribution (calculated from birthDate)
    const usersWithBirthDate = await prisma.users.findMany({
      where: {
        birthDate: { not: null },
        isDelete: false,
      },
      select: { birthDate: true },
    });

    const ageGroups = {
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-55": 0,
      "56+": 0,
    };

    const currentYear = new Date().getFullYear();
    usersWithBirthDate.forEach((user) => {
      if (user.birthDate) {
        const age = currentYear - new Date(user.birthDate).getFullYear();
        if (age >= 18 && age <= 25) ageGroups["18-25"]++;
        else if (age >= 26 && age <= 35) ageGroups["26-35"]++;
        else if (age >= 36 && age <= 45) ageGroups["36-45"]++;
        else if (age >= 46 && age <= 55) ageGroups["46-55"]++;
        else if (age > 55) ageGroups["56+"]++;
      }
    });

    // Top Users by Spending
    const topSpenders = await prisma.order_request.groupBy({
      by: ["userId"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        orderStatus: { not: "cancelled" },
      },
      _sum: { totalPayable: true },
      _count: true,
      orderBy: { _sum: { totalPayable: "desc" } },
      take: 10,
    });

    const topSpenderIds = topSpenders.map((s) => s.userId);
    const topSpenderDetails = await prisma.users.findMany({
      where: { id: { in: topSpenderIds } },
      select: { id: true, name: true, profile: true, email: true },
    });

    const topSpendersWithDetails = topSpenders.map((spender) => {
      const details = topSpenderDetails.find((d) => d.id === spender.userId);
      return {
        userId: spender.userId,
        name: details?.name || "Unknown",
        profile: details?.profile,
        email: details?.email,
        totalSpent: Number(spender._sum.totalPayable || 0),
        orderCount: spender._count,
      };
    });

    // User Lifecycle Funnel
    const [registered, firstConsultation, repeatUser, premiumUser] = await Promise.all([
      currentNewUsers,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        WHERE u.created_at >= ${dateRange.startDate}
          AND u.created_at <= ${dateRange.endDate}
          AND u.isDelete = false
          AND EXISTS (
            SELECT 1 FROM chatrequest WHERE userId = u.id
            UNION
            SELECT 1 FROM callrequest WHERE userId = u.id
          )
      `,
      Number(repeatUsers[0]?.count || 0),
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT userId) as count
        FROM order_request
        WHERE created_at >= ${dateRange.startDate}
          AND created_at <= ${dateRange.endDate}
          AND totalPayable > 1000
      `,
    ]);

    const avgConsultationsPerUser =
      totalConsultations.length > 0
        ? totalConsultations.reduce((sum, u) => sum + Number(u.consultations), 0) /
          totalConsultations.length
        : 0;

    const response: DashboardResponse = {
      success: true,
      data: {
        summary: {
          newUsers: currentNewUsers,
          comparison: userGrowthComparison,
          totalActiveUsers,
          currentActiveUsers,
          retentionRate:
            currentNewUsers > 0 ? (Number(repeatUsers[0]?.count || 0) / currentNewUsers) * 100 : 0,
        },
        demographics: {
          gender: genderDistribution.map((g) => ({
            gender: g.gender || "Unknown",
            count: g._count,
            percentage:
              totalActiveUsers > 0 ? (g._count / totalActiveUsers) * 100 : 0,
          })),
          ageGroups,
          locations: locationDistribution.map((l) => ({
            location: l.location || "Unknown",
            count: l._count,
          })),
        },
        engagement: {
          avgConsultationsPerUser: Math.round(avgConsultationsPerUser * 100) / 100,
          repeatUsers: Number(repeatUsers[0]?.count || 0),
          repeatRate:
            currentActiveUsers > 0
              ? (Number(repeatUsers[0]?.count || 0) / currentActiveUsers) * 100
              : 0,
        },
        wallet: {
          totalBalance: Number(walletStats._sum.amount || 0),
          avgBalance: Number(walletStats._avg.amount || 0),
        },
        charts: {
          dailyRegistrations: dailyRegistrations.map((d) => ({
            date: d.date,
            count: Number(d.count),
          })),
          topSpenders: topSpendersWithDetails,
        },
        funnel: {
          registered,
          firstConsultation: Number(firstConsultation[0]?.count || 0),
          repeatUser,
          premiumUser: Number(premiumUser[0]?.count || 0),
        },
      },
      metadata: {
        filter,
        dateRange,
        generatedAt: new Date().toISOString(),
        comparison: { previousRange },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Users dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}