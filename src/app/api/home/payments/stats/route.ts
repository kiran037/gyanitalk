// src/app/api/home/payments/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("startDate");
    const end   = searchParams.get("endDate");

    const createdFilter =
      start && end ? { gte: new Date(start), lte: new Date(end) }
      : start     ? { gte: new Date(start) }
      : end       ? { lte: new Date(end) }
                  : undefined;

    const where = createdFilter ? { created_at: createdFilter } : undefined;

    const [grouped, countAll] = await Promise.all([
      prisma.payment.groupBy({
        by: ["paymentStatus"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.payment.count({ where }),
    ]);

    const byStatus = Object.fromEntries(
      grouped.map(g => [
        g.paymentStatus ?? "Unknown",
        {
          count: g._count._all,
          amount: Number(g._sum.amount ?? 0),
        },
      ])
    );

    const totalAmount = grouped.reduce((acc, g) => acc + Number(g._sum.amount ?? 0), 0);

    return NextResponse.json(
      { totalCount: countAll, totalAmount, byStatus },
      { status: 200 }
    );
  } catch (err) {
    console.error("payments/stats error", err);
    return NextResponse.json({ error: "Failed to fetch payments stats" }, { status: 500 });
  }
}
