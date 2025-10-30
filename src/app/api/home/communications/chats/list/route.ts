// src/app/api/home/communications/chats/list/route.ts
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
    const limit = toInt(searchParams.get("limit"), 20);
    const status = (searchParams.get("status") || "").trim(); // "Completed" | "Rejected" | "Pending"
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

    const where: any = {
      ...(createdFilter ? { created_at: createdFilter } : {}),
      ...(status ? { chatStatus: status } : {}),
    };

    const [total, rows] = await Promise.all([
      prisma.chatrequest.count({ where }),
      prisma.chatrequest.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          userId: true,
          astrologerId: true,
          chatStatus: true,
          totalMin: true,
          created_at: true,
        },
      }),
    ]);

    const items = rows.map((r) => ({
      id: typeof r.id === "bigint" ? Number(r.id) : r.id,
      userId: r.userId == null ? null : typeof r.userId === "bigint" ? Number(r.userId) : r.userId,
      astrologerId:
        r.astrologerId == null ? null : typeof r.astrologerId === "bigint" ? Number(r.astrologerId) : r.astrologerId,
      status: r.chatStatus,
      totalMin: r.totalMin ? parseInt(r.totalMin, 10) || 0 : 0,
      created_at: r.created_at,
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
    console.error("communications/chats/list error", err);
    return NextResponse.json({ error: "Failed to fetch chat list" }, { status: 500 });
  }
}
