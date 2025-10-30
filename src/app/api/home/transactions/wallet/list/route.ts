// src/app/api/home/transactions/wallet/list/route.ts
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
    const type  = (searchParams.get("type") || "").trim() || undefined; // e.g., Chat/Call/…
    const q     = (searchParams.get("search") || "").trim();
    const start = searchParams.get("startDate");
    const end   = searchParams.get("endDate");

    const createdFilter =
      start && end ? { gte: new Date(start), lte: new Date(end) }
      : start     ? { gte: new Date(start) }
      : end       ? { lte: new Date(end) }
                  : undefined;

    const where: any = {};
    if (type) where.transactionType = type;
    if (createdFilter) where.created_at = createdFilter;

    // Optional numeric search by id/userId
    if (q) {
      const num = Number(q);
      if (Number.isFinite(num)) {
        where.OR = [{ id: BigInt(num) }, { userId: BigInt(num) }];
      }
    }

    const [total, rows] = await Promise.all([
      prisma.wallettransaction.count({ where }),
      prisma.wallettransaction.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          userId: true,
          amount: true,
          transactionType: true,
          created_at: true,
        },
      }),
    ]);

    const items = rows.map((r) => ({
      id: typeof r.id === "bigint" ? Number(r.id) : (r.id as any),
      userId: r.userId == null ? null : (typeof r.userId === "bigint" ? Number(r.userId) : (r.userId as any)),
      amount: Number(r.amount ?? 0),
      type: r.transactionType,
      created_at: r.created_at,
    }));

    return NextResponse.json(
      { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)), items },
      { status: 200 }
    );
  } catch (err) {
    console.error("transactions/wallet/list error", err);
    return NextResponse.json({ error: "Failed to fetch wallet transactions" }, { status: 500 });
  }
}
