// src/app/api/home/earnings/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Platform commissions (your revenue)
    const totalEarningAgg = await prisma.admin_get_commissions.aggregate({
      _sum: { amount: true },
    });

    // Fetch astrologer userIds (roleId = 2)
    const astroRole = await prisma.user_roles.findMany({
      where: { roleId: 2 },
      select: { userId: true },
    });
    const astroIds = astroRole.map((r) => Number(r.userId));

    // Astrologers’ earnings (wallet transactions credited to astrologers)
    const totalAstroEarningAgg = await prisma.wallettransaction.aggregate({
      where: { userId: { in: astroIds } },
      _sum: { amount: true },
    });

    // Total Withdrawals released
    const totalWithdrawAgg = await prisma.withdrawrequest.aggregate({
      where: { status: "Released" },
      _sum: { withdrawAmount: true },
    });

    // Deposits by status
    const depositGroups = await prisma.payment.groupBy({
      by: ["paymentStatus"],
      _sum: { amount: true },
    });

    const normalize = (arr: { paymentStatus: string | null; _sum: { amount: number | null } }[]) => {
      const m = Object.fromEntries(arr.map((x) => [x.paymentStatus ?? "Unknown", x._sum.amount]));
      return {
        success: Number(m["success"] ?? 0),
        pending: Number(m["pending"] ?? 0),
        failed: Number(m["failed"] ?? 0),
      };
    };

    return NextResponse.json(
      {
        totalEarning: Number(totalEarningAgg._sum.amount ?? 0),
        totalAstroEarning: Number(totalAstroEarningAgg._sum.amount ?? 0),
        totalWithdraw: Number(totalWithdrawAgg._sum.withdrawAmount ?? 0),
        totalDeposit: normalize(depositGroups),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("earnings/summary error", err);
    return NextResponse.json({ error: "Failed to fetch earnings summary" }, { status: 500 });
  }
}
