// src/app/api/home/withdrawals/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: string | null, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 200) : d;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = toInt(searchParams.get("page"), 1);
    const limit = Math.min(toInt(searchParams.get("limit"), 20), 100);

    const status = (searchParams.get("status") || "").trim() || undefined;
    const q = (searchParams.get("search") || "").trim();
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");

    const createdFilter =
      start && end
        ? { gte: new Date(start), lte: new Date(end) }
        : start
        ? { gte: new Date(start) }
        : end
        ? { lte: new Date(end) }
        : undefined;

    // Build where without unknown fields
    const where: any = {};
    if (status) where.status = status;
    if (createdFilter) where.created_at = createdFilter;

    // Optional numeric search only on primary key (id)
    if (q) {
      const numQ = Number(q);
      if (Number.isFinite(numQ)) {
        where.id = BigInt(numQ);
      }
    }

    const [total, rows] = await Promise.all([
      prisma.withdrawrequest.count({ where }),
      prisma.withdrawrequest.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          withdrawAmount: true,
          status: true,
          created_at: true,
          // These appear in your model from the error dump — include if useful:
          accountHolderName: true,
          accountNumber: true,
          ifscCode: true,
        },
      }),
    ]);

    const items = rows.map((r) => ({
      id: typeof r.id === "bigint" ? Number(r.id) : (r.id as any),
      amount: Number(r.withdrawAmount ?? 0),
      status: r.status,
      created_at: r.created_at,
      accountHolderName: r.accountHolderName ?? null,
      accountNumber: r.accountNumber ?? null,
      ifscCode: r.ifscCode ?? null,
    }));

    return NextResponse.json(
      {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        items,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("withdrawals/list error", err);
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 });
  }
}
