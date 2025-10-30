// src/app/api/home/reports/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("startDate");
    const end   = searchParams.get("endDate");
    const statusParam = (searchParams.get("status") || "").trim(); // treated as reportType if numeric

    const createdFilter =
      start && end ? { gte: new Date(start), lte: new Date(end) }
      : start     ? { gte: new Date(start) }
      : end       ? { lte: new Date(end) }
                  : undefined;

    const where: any = {};
    if (createdFilter) where.created_at = createdFilter;

    // Back-compat: allow ?status=NUMBER to filter by reportType
    if (statusParam && !Number.isNaN(Number(statusParam))) {
      where.reportType = Number(statusParam);
    }

    const [totalCount, byTypeRaw] = await Promise.all([
      prisma.user_reports.count({ where }),
      prisma.user_reports.groupBy({
        by: ["reportType"],
        where,
        _count: { _all: true },
      }),
    ]);

    // Keep response property name as "byStatus" to avoid breaking callers.
    // Keys are the reportType values (as strings), with counts.
    const byStatus = Object.fromEntries(
      byTypeRaw.map(g => [String(g.reportType ?? "Unknown"), (g._count as any)?._all ?? 0])
    );

    return NextResponse.json({ totalCount, byStatus }, { status: 200 });
  } catch (err) {
    console.error("reports/stats error", err);
    return NextResponse.json({ error: "Failed to fetch report stats" }, { status: 500 });
  }
}
