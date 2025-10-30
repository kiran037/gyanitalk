// src/app/api/home/expert-match/requests/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: string | null, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 200) : d;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page  = toInt(searchParams.get("page"), 1);
    const limit = Math.min(toInt(searchParams.get("limit"), 20), 100);
    const status = (searchParams.get("status") || "").trim() || undefined; // Pending/Assigned/etc.
    const q     = (searchParams.get("search") || "").trim();
    const start = searchParams.get("startDate");
    const end   = searchParams.get("endDate");

    const createdFilter =
      start && end ? { gte: new Date(start), lte: new Date(end) }
      : start     ? { gte: new Date(start) }
      : end       ? { lte: new Date(end) }
                  : undefined;

    const where: any = {};
    if (status) where.status = status;
    if (createdFilter) where.created_at = createdFilter;

    if (q) {
      const num = Number(q);
      if (Number.isFinite(num)) where.id = BigInt(num);
    }

    const [total, rows] = await Promise.all([
      prisma.astrologer_request.count({ where }),
      prisma.astrologer_request.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          status: true,
          created_at: true,
        },
      }),
    ]);

    const items = rows.map(r => ({
      id: typeof r.id === "bigint" ? Number(r.id) : (r.id as any),
      status: r.status,
      created_at: r.created_at,
    }));

    return NextResponse.json(
      { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), items },
      { status: 200 }
    );
  } catch (err) {
    console.error("expert-match/requests/list error", err);
    return NextResponse.json({ error: "Failed to fetch expert-match requests" }, { status: 500 });
  }
}
