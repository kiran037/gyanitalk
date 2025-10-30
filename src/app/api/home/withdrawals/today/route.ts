// src/app/api/home/withdrawals/today/route.ts
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

    const [allAgg, releasedAgg] = await Promise.all([
      prisma.withdrawrequest.aggregate({
        where: { created_at: { gte: start, lte: end } },
        _sum: { withdrawAmount: true },
        _count: { _all: true },
      }),
      prisma.withdrawrequest.aggregate({
        where: { status: "Released", created_at: { gte: start, lte: end } },
        _sum: { withdrawAmount: true },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json(
      {
        today: {
          count: allAgg._count._all,
          amount: Number(allAgg._sum.withdrawAmount ?? 0),
        },
        released: {
          count: releasedAgg._count._all,
          amount: Number(releasedAgg._sum.withdrawAmount ?? 0),
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("withdrawals/today error", err);
    return NextResponse.json({ error: "Failed to fetch today's withdrawals" }, { status: 500 });
  }
}
