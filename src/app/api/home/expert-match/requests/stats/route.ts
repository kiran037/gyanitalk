// src/app/api/home/expert-match/requests/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("startDate");
    const end   = searchParams.get("endDate");
    const status = (searchParams.get("status") || "").trim() || undefined;

    const createdFilter =
      start && end ? { gte: new Date(start), lte: new Date(end) }
      : start     ? { gte: new Date(start) }
      : end       ? { lte: new Date(end) }
                  : undefined;

    const where: any = {};
    if (status) where.status = status;
    if (createdFilter) where.created_at = createdFilter;

    const [total, byStatusRaw] = await Promise.all([
      prisma.astrologer_request.count({ where }),
      prisma.astrologer_request.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
    ]);

    const byStatus = Object.fromEntries(
      byStatusRaw.map(g => [g.status ?? "Unknown", g._count._all])
    );

    // Convenience: specific known statuses you’ve tracked earlier
    const pending  = byStatus["Pending"]  ?? 0;
    const assigned = byStatus["Assigned"] ?? 0;

    return NextResponse.json({ total, pending, assigned, byStatus }, { status: 200 });
  } catch (err) {
    console.error("expert-match/requests/stats error", err);
    return NextResponse.json({ error: "Failed to fetch expert-match stats" }, { status: 500 });
  }
}
