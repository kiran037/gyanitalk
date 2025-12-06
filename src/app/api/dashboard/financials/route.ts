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

    // Wallet Analytics
    const [
      totalWalletBalance,
      activeWallets,
      currentRecharges,
      previousRecharges,
      rechargeRevenue,
      previousRechargeRevenue,
    ] = await Promise.all([
      // Total wallet balance in system
      prisma.user_wallets.aggregate({
        where: { isActive: true, isDelete: false },
        _sum: { amount: true },
      }),

      // Active wallets (with balance > 0)
      prisma.user_wallets.count({
        where: {
          isActive: true,
          isDelete: false,
          amount: { gt: 0 },
        },
      }),

      // Current period recharges
      prisma.payment.count({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          paymentStatus: "success",
          type: "wallet",
        },
      }),

      // Previous period recharges
      prisma.payment.count({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          paymentStatus: "success",
          type: "wallet",
        },
      }),

      // Recharge revenue
      prisma.payment.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          paymentStatus: "success",
          type: "wallet",
        },
        _sum: { amount: true },
      }),

      // Previous recharge revenue
      prisma.payment.aggregate({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          paymentStatus: "success",
          type: "wallet",
        },
        _sum: { amount: true },
      }),
    ]);

    const rechargesComparison = calculateComparison(currentRecharges, previousRecharges);
    const rechargeRevenueComparison = calculateComparison(
      Number(rechargeRevenue._sum.amount || 0),
      Number(previousRechargeRevenue._sum.amount || 0)
    );

    // Wallet Transaction Breakdown
    const [creditTransactions, debitTransactions] = await Promise.all([
      prisma.wallettransaction.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isCredit: true,
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.wallettransaction.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isCredit: false,
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Daily Wallet Transaction Trend
    const dailyWalletTrend = await prisma.$queryRaw<
      Array<{ date: Date; credits: number; debits: number }>
    >`
      SELECT 
        DATE(created_at) as date,
        SUM(CASE WHEN isCredit = true THEN amount ELSE 0 END) as credits,
        SUM(CASE WHEN isCredit = false THEN amount ELSE 0 END) as debits
      FROM wallettransaction
      WHERE created_at >= ${dateRange.startDate}
        AND created_at <= ${dateRange.endDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Recharge Amount Distribution
    const rechargeAmounts = await prisma.rechargeamount.findMany({
      where: { created_at: { gte: dateRange.startDate, lte: dateRange.endDate } },
      select: { amount: true, cashback: true },
    });

    const rechargeDistribution = await prisma.payment.groupBy({
      by: ["amount"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        type: "wallet",
        paymentStatus: "success",
      },
      _count: true,
    });

    // Withdrawal Analytics
    const [
      pendingWithdrawals,
      approvedWithdrawals,
      rejectedWithdrawals,
      totalWithdrawalAmount,
      previousWithdrawals,
    ] = await Promise.all([
      // Pending withdrawals
      prisma.withdrawrequest.aggregate({
        where: {
          status: "Pending",
          isDelete: 0,
        },
        _count: true,
        _sum: { withdrawAmount: true },
      }),

      // Approved/Released withdrawals
      prisma.withdrawrequest.aggregate({
        where: {
          status: "Released",
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: 0,
        },
        _count: true,
        _sum: { withdrawAmount: true },
      }),

      // Rejected withdrawals
      prisma.withdrawrequest.aggregate({
        where: {
          status: "Reject",
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: 0,
        },
        _count: true,
        _sum: { withdrawAmount: true },
      }),

      // Total withdrawal amount (current period)
      prisma.withdrawrequest.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isDelete: 0,
        },
        _sum: { withdrawAmount: true },
      }),

      // Previous period withdrawals
      prisma.withdrawrequest.aggregate({
        where: {
          created_at: { gte: previousRange.startDate, lte: previousRange.endDate },
          isDelete: 0,
        },
        _count: true,
        _sum: { withdrawAmount: true },
      }),
    ]);

    const withdrawalsComparison = calculateComparison(
      approvedWithdrawals._count + rejectedWithdrawals._count,
      previousWithdrawals._count
    );

    // Withdrawal by Payment Method
    const withdrawalsByMethod = await prisma.withdrawrequest.groupBy({
      by: ["paymentMethod"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        isDelete: 0,
      },
      _count: true,
      _sum: { withdrawAmount: true },
    });

    const paymentMethodIds = withdrawalsByMethod
      .map((w) => w.paymentMethod)
      .filter(Boolean) as number[];
    const paymentMethods = await prisma.withdrawmethods.findMany({
      where: { id: { in: paymentMethodIds } },
      select: { id: true, method_name: true },
    });

    const withdrawalsByMethodWithDetails = withdrawalsByMethod.map((w) => {
      const method = paymentMethods.find((m) => m.id === w.paymentMethod);
      return {
        method: method?.method_name || "Unknown",
        count: w._count,
        amount: Number(w._sum.withdrawAmount || 0),
      };
    });

    // Top Withdrawal Requests (by astrologer)
    const topWithdrawalRequests = await prisma.withdrawrequest.groupBy({
      by: ["astrologerId"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        astrologerId: { not: null },
        isDelete: 0,
      },
      _count: true,
      _sum: { withdrawAmount: true },
      orderBy: { _sum: { withdrawAmount: "desc" } },
      take: 10,
    });

    const astrologerIds = topWithdrawalRequests
      .map((w) => w.astrologerId)
      .filter(Boolean) as bigint[];
    const astrologerDetails = await prisma.astrologers.findMany({
      where: { id: { in: astrologerIds } },
      select: { id: true, name: true, profileImage: true },
    });

    const topWithdrawalsWithDetails = topWithdrawalRequests.map((w) => {
      const details = astrologerDetails.find((a) => a.id === w.astrologerId);
      return {
        astrologerId: w.astrologerId,
        name: details?.name || "Unknown",
        profileImage: details?.profileImage,
        requests: w._count,
        totalAmount: Number(w._sum.withdrawAmount || 0),
      };
    });

    // Payment Gateway Analysis
    const paymentGatewayStats = await prisma.payment.groupBy({
      by: ["paymentMode"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
      },
      _count: true,
      _sum: { amount: true },
    });

    const paymentGatewaySuccess = await prisma.payment.groupBy({
      by: ["paymentMode"],
      where: {
        created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
        paymentStatus: "success",
      },
      _count: true,
    });

    const paymentGatewayAnalysis = paymentGatewayStats.map((gateway) => {
      const successCount =
        paymentGatewaySuccess.find((s) => s.paymentMode === gateway.paymentMode)?._count || 0;
      return {
        gateway: gateway.paymentMode || "Unknown",
        totalTransactions: gateway._count,
        successfulTransactions: successCount,
        successRate: gateway._count > 0 ? (successCount / gateway._count) * 100 : 0,
        totalAmount: Number(gateway._sum.amount || 0),
      };
    });

    // Commission Analytics
    const [totalCommissions, adminCommissions] = await Promise.all([
      prisma.commissions.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isActive: true,
          isDelete: false,
        },
        _sum: { commission: true },
        _count: true,
      }),
      prisma.admin_get_commissions.aggregate({
        where: {
          created_at: { gte: dateRange.startDate, lte: dateRange.endDate },
          isActive: true,
          isDelete: false,
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const response: DashboardResponse = {
      success: true,
      data: {
        wallet: {
          summary: {
            totalBalance: Number(totalWalletBalance._sum.amount || 0),
            activeWallets,
            recharges: currentRecharges,
            rechargesComparison,
            rechargeRevenue: Number(rechargeRevenue._sum.amount || 0),
            rechargeRevenueComparison,
          },
          transactions: {
            credits: {
              count: creditTransactions._count,
              amount: Number(creditTransactions._sum.amount || 0),
            },
            debits: {
              count: debitTransactions._count,
              amount: Number(debitTransactions._sum.amount || 0),
            },
          },
          charts: {
            dailyTrend: dailyWalletTrend.map((d) => ({
              date: d.date,
              credits: Number(d.credits),
              debits: Number(d.debits),
              net: Number(d.credits) - Number(d.debits),
            })),
            rechargeDistribution: rechargeDistribution
              .map((r) => ({
                amount: Number(r.amount || 0),
                count: r._count,
              }))
              .sort((a, b) => a.amount - b.amount),
          },
        },
        withdrawals: {
          summary: {
            pending: {
              count: pendingWithdrawals._count,
              amount: Number(pendingWithdrawals._sum.withdrawAmount || 0),
            },
            approved: {
              count: approvedWithdrawals._count,
              amount: Number(approvedWithdrawals._sum.withdrawAmount || 0),
            },
            rejected: {
              count: rejectedWithdrawals._count,
              amount: Number(rejectedWithdrawals._sum.withdrawAmount || 0),
            },
            total: Number(totalWithdrawalAmount._sum.withdrawAmount || 0),
            comparison: withdrawalsComparison,
          },
          byMethod: withdrawalsByMethodWithDetails,
          topRequests: topWithdrawalsWithDetails,
        },
        paymentGateway: paymentGatewayAnalysis,
        commissions: {
          totalCommissions: Number(totalCommissions._sum.commission || 0),
          adminEarnings: Number(adminCommissions._sum.amount || 0),
          commissionsCount: totalCommissions._count,
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
    console.error("Financial dashboard error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch financial analytics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}