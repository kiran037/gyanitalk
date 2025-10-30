// src/app/api/home/live/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: string | null, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.min(n, 200) : d;
}
const like = (q: string) => ({ contains: q, mode: "insensitive" as const });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = toInt(searchParams.get("page"), 1);
    const limit = toInt(searchParams.get("limit"), 20);
    const q = (searchParams.get("search") || "").trim();

    const where =
      q.length > 0
        ? {
            chatStatus: "Online" as const,
            OR: [{ name: like(q) }, { email: like(q) }, { contactNo: like(q) }],
          }
        : { chatStatus: "Online" as const };

    const [total, rows] = await Promise.all([
      prisma.astrologers.count({ where }),
      prisma.astrologers.findMany({
        where,
        orderBy: { id: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, name: true, email: true, contactNo: true },
      }),
    ]);

    const items = rows.map((a) => ({
      id: typeof a.id === "bigint" ? Number(a.id) : a.id,
      name: a.name,
      email: a.email,
      phone: a.contactNo ?? null,
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
    console.error("live/chat error", err);
    return NextResponse.json({ error: "Failed to fetch live chat list" }, { status: 500 });
  }
}
