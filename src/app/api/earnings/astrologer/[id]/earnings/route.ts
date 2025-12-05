// // app/api/earnings/astrologer/[id]/earnings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getAstrologerId(context: RouteContext): Promise<bigint> {
  const { id } = await context.params;
  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`Invalid astrologer id: "${id}"`);
  }
  return BigInt(trimmed);
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const astrologerId = await getAstrologerId(context);

    const dateFilter =
      startDate && endDate
        ? {
            created_at: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }
        : {};

    // Astrologer details
    const astrologer = await prisma.astrologers.findUnique({
      where: { id: astrologerId },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        profileImage: true,
      },
    });

    // Orders
    const orderEarnings = await prisma.order_request.groupBy({
      by: ["orderType"],
      where: {
        astrologerId,
        orderStatus: { not: "cancelled" },
        isActive: "1",
        isDelete: "0",
        ...dateFilter,
      },
      _sum: { totalPayable: true },
      _count: true,
    });

    // Chat
    const chatEarnings = await prisma.chatrequest.aggregate({
      where: {
        astrologerId,
        chatStatus: "completed",
        ...dateFilter,
      },
      _sum: { deductionFromAstrologer: true },
      _count: true,
    });

    // Call
    const callEarnings = await prisma.callrequest.aggregate({
      where: {
        astrologerId,
        callStatus: "completed",
        ...dateFilter,
      },
      _sum: { deductionFromAstrologer: true },
      _count: true,
    });

    // Commissions
    const commissions = await prisma.admin_get_commissions.findMany({
      where: {
        commissions: {
          astrologerId,
        },
        isActive: true,
        isDelete: false,
        ...dateFilter,
      },
      include: {
        commission_types: {
          select: { id: true, name: true },
        },
      },
    });

    const commissionByType = commissions.reduce(
      (acc, c) => {
        const typeName = c.commission_types.name;
        if (!acc[typeName]) {
          acc[typeName] = { amount: 0, count: 0 };
        }
        acc[typeName].amount += c.amount;
        acc[typeName].count += 1;
        return acc;
      },
      {} as Record<string, { amount: number; count: number }>
    );

    // Totals
    const totalOrderEarnings = orderEarnings.reduce(
      (acc, e) => acc + parseFloat(e._sum.totalPayable?.toString() || "0"),
      0
    );

    const totalChatEarnings = chatEarnings._sum.deductionFromAstrologer || 0;
    const totalCallEarnings = callEarnings._sum.deductionFromAstrologer || 0;
    const totalCommission = commissions.reduce(
      (acc, c) => acc + c.amount,
      0
    );

    const totalEarnings =
      totalOrderEarnings + totalChatEarnings + totalCallEarnings;
    const netEarnings = totalEarnings - totalCommission;

    return NextResponse.json({
      success: true,
      data: {
        astrologer: astrologer
          ? {
              ...astrologer,
              id: astrologer.id.toString(),
            }
          : null,
        summary: {
          totalEarnings,
          totalCommission,
          netEarnings,
        },
        earningsByType: {
          orders: orderEarnings.map((e) => ({
            type: e.orderType || "Unknown",
            amount: parseFloat(
              e._sum.totalPayable?.toString() || "0"
            ),
            count: e._count,
          })),
          chat: {
            amount: totalChatEarnings,
            count: chatEarnings._count,
          },
          call: {
            amount: totalCallEarnings,
            count: callEarnings._count,
          },
        },
        commissionBreakdown: Object.entries(commissionByType).map(
          ([type, data]) => ({
            type,
            amount: data.amount,
            count: data.count,
          })
        ),
      },
    });
  } catch (error) {
    console.error("Get earnings error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch earnings" },
      { status: 500 }
    );
  }
}
