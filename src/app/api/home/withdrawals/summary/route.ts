// src/app/api/home/withdrawals/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Group sums by status (e.g., Released / Pending / Rejected ...)
    const grouped = await prisma.withdrawrequest.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { withdrawAmount: true },
    });

    const totals = grouped.reduce(
      (acc, g) => {
        const key = String(g.status ?? "Unknown");
        acc.byStatus[key] = {
          count: g._count._all,
          amount: Number(g._sum.withdrawAmount ?? 0),
        };
        acc.count += g._count._all;
        acc.amount += Number(g._sum.withdrawAmount ?? 0);
        return acc;
      },
      { count: 0, amount: 0, byStatus: {} as Record<string, { count: number; amount: number }> }
    );

    // Convenience: Released-only totals (commonly used)
    const released = grouped.find((g) => g.status === "Released");
    const releasedAmount = Number(released?._sum.withdrawAmount ?? 0);
    const releasedCount = released?._count._all ?? 0;

    return NextResponse.json(
      {
        total: totals,
        released: { count: releasedCount, amount: releasedAmount },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("withdrawals/summary error", err);
    return NextResponse.json({ error: "Failed to fetch withdrawal summary" }, { status: 500 });
  }
}
