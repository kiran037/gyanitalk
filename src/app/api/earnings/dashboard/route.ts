// // app/api/earnings/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function decimalToNumber(val: any): number {
  if (val == null) return 0;
  if (typeof val === "number") return val;
  // Prisma Decimal or other object-like number
  return Number(val);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter for created_at
    const createdAtFilter: Record<string, Date> = {};
    if (startDate) createdAtFilter.gte = new Date(startDate);
    if (endDate) createdAtFilter.lte = new Date(endDate);

    const withDateFilter =
      startDate || endDate ? { created_at: createdAtFilter } : {};

const pendingWithdrawals = await prisma.withdrawrequest.aggregate({
  where: {
    status: "Pending", // ✅ enum value
    isActive: 1,
    isDelete: 0,
  },
  _sum: { withdrawAmount: true },
  _count: true,
});


const approvedWithdrawals = await prisma.withdrawrequest.aggregate({
  where: {
    status: "Released", // ✅ enum value for “approved”
    isActive: 1,
    isDelete: 0,
    ...withDateFilter,
  },
  _sum: { withdrawAmount: true },
  _count: true,
});


    // 3. Total Platform Earnings (from orders)
    const totalOrders = await prisma.order_request.aggregate({
      where: {
        orderStatus: { not: "cancelled" },
        isActive: "1",
        isDelete: "0",
        ...withDateFilter,
      },
      _sum: { totalPayable: true },
    });

    // 4. Total Admin Commission Earned
    const adminCommissions = await prisma.admin_get_commissions.aggregate({
      where: {
        isActive: true,
        isDelete: false,
        ...withDateFilter,
      },
      _sum: { amount: true },
    });

    // 5. Top Earning Astrologers
    const topAstrologers = await prisma.wallettransaction.groupBy({
      by: ["astrologerId"],
      where: {
        astrologerId: { not: null },
        isCredit: true,
        ...withDateFilter,
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 10,
    });

    // Filter out null astrologerId and collect IDs
    const astrologerIds = topAstrologers
      .map((a) => a.astrologerId)
      .filter((id): id is bigint => id !== null);

    const astrologerDetails = await prisma.astrologers.findMany({
      where: { id: { in: astrologerIds } },
      select: {
        id: true,
        name: true,
        profileImage: true,
        email: true, // from your schema
      },
    });

    const topEarnersWithDetails = topAstrologers
      .filter((t) => t.astrologerId !== null)
      .map((t) => {
        const details = astrologerDetails.find(
          (a) => a.id === t.astrologerId
        );

        return {
          astrologerId: t.astrologerId
            ? t.astrologerId.toString()
            : null,
          name: details?.name ?? null,
          email: (details as any)?.email ?? null,
          profileImage: details?.profileImage ?? null,
          totalEarnings: decimalToNumber(t._sum.amount),
        };
      });

    // 6. Earnings by Service Type
    const earningsByType = await prisma.order_request.groupBy({
      by: ["orderType"],
      where: {
        orderStatus: { not: "cancelled" },
        isActive: "1",
        isDelete: "0",
        ...withDateFilter,
      },
      _sum: { totalPayable: true },
      _count: true, // number
    });

    const serializedEarningsByType = earningsByType.map((e) => ({
      type: e.orderType || "Unknown",
      amount: decimalToNumber(e._sum.totalPayable),
      count: e._count, // this is just a number
    }));

    // Recent Tickets? (you don't use them here, so skipped)

    return NextResponse.json({
      success: true,
      data: {
        pendingWithdrawals: {
          amount: decimalToNumber(
            pendingWithdrawals._sum.withdrawAmount
          ),
          count: pendingWithdrawals._count,
        },
        approvedWithdrawals: {
          amount: decimalToNumber(
            approvedWithdrawals._sum.withdrawAmount
          ),
          count: approvedWithdrawals._count,
        },
        totalPlatformEarnings: decimalToNumber(
          totalOrders._sum.totalPayable
        ),
        adminCommissionEarned:
          adminCommissions._sum.amount ?? 0,
        topAstrologers: topEarnersWithDetails,
        earningsByServiceType: serializedEarningsByType,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
