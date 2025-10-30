// src/app/api/home/earnings/today/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

function istTodayRange() {
  const todayIST = new Date(
    new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
  );
  return { start: startOfDay(todayIST), end: endOfDay(todayIST) };
}

export async function GET() {
  try {
    const { start, end } = istTodayRange();

    // Platform commissions today
    const todayEarningAgg = await prisma.admin_get_commissions.aggregate({
      where: { created_at: { gte: start, lte: end } },
      _sum: { amount: true },
    });

    // Astrologer user IDs
    const astroRole = await prisma.user_roles.findMany({
      where: { roleId: 2 },
      select: { userId: true },
    });
    const astroIds = astroRole.map((r) => Number(r.userId));

    // Astro earnings today
    const todayAstroEarningAgg = await prisma.wallettransaction.aggregate({
      where: { userId: { in: astroIds }, created_at: { gte: start, lte: end } },
      _sum: { amount: true },
    });

    // Withdrawals released today
    const todayWithdrawAgg = await prisma.withdrawrequest.aggregate({
      where: { status: "Released", created_at: { gte: start, lte: end } },
      _sum: { withdrawAmount: true },
    });

    // Deposits by status today
    const todayDeposits = await prisma.payment.groupBy({
      by: ["paymentStatus"],
      where: { created_at: { gte: start, lte: end } },
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
        todayEarning: Number(todayEarningAgg._sum.amount ?? 0),
        todayAstroEarning: Number(todayAstroEarningAgg._sum.amount ?? 0),
        todayWithdraw: Number(todayWithdrawAgg._sum.withdrawAmount ?? 0),
        todayDeposit: normalize(todayDeposits),
        range: { start, end },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("earnings/today error", err);
    return NextResponse.json({ error: "Failed to fetch today's earnings" }, { status: 500 });
  }
}
