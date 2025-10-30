// src/app/api/home/orders/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Stats: total orders, by orderType (counts), and optionally filtered by date range.
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
    if (type) where.orderType = type;
    if (createdFilter) where.created_at = createdFilter;

    const [totalCount, byTypeRaw] = await Promise.all([
      prisma.order_request.count({ where }),
      prisma.order_request.groupBy({
        by: ["orderType"],
        where,
        _count: { _all: true },
      }),
    ]);

    const byType = Object.fromEntries(
      byTypeRaw.map(g => [g.orderType ?? "Unknown", g._count._all])
    );

    return NextResponse.json(
      { totalCount, byType },
      { status: 200 }
    );
  } catch (err) {
    console.error("orders/stats error", err);
    return NextResponse.json({ error: "Failed to fetch orders stats" }, { status: 500 });
  }
}
