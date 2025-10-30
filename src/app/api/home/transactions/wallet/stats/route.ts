// src/app/api/home/transactions/wallet/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("startDate");
    const end   = searchParams.get("endDate");
    const type  = (searchParams.get("type") || "").trim() || undefined;

    const createdFilter =
      start && end ? { gte: new Date(start), lte: new Date(end) }
      : start     ? { gte: new Date(start) }
      : end       ? { lte: new Date(end) }
                  : undefined;

    const where: any = {};
    if (createdFilter) where.created_at = createdFilter;
    if (type) where.transactionType = type;

    const [grouped, totalCount, totalAgg] = await Promise.all([
      prisma.wallettransaction.groupBy({
        by: ["transactionType"],
        where,
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.wallettransaction.count({ where }),
      prisma.wallettransaction.aggregate({ where, _sum: { amount: true } }),
    ]);

    const byType = Object.fromEntries(
      grouped.map(g => [
        g.transactionType ?? "Unknown",
        { count: g._count._all, amount: Number(g._sum.amount ?? 0) },
      ])
    );

    return NextResponse.json(
      {
        totalCount,
        totalAmount: Number(totalAgg._sum.amount ?? 0),
        byType,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("transactions/wallet/stats error", err);
    return NextResponse.json({ error: "Failed to fetch wallet stats" }, { status: 500 });
  }
}
