import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

function toInt(v: string | null | undefined, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : d;
}

function like(q: string) {
  return { contains: q, mode: "insensitive" as const };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = toInt(searchParams.get("page"), 1);
    const limit = Math.min(toInt(searchParams.get("limit"), 20), 100);
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

    // Base filter (you can extend later if you add flags like isActive)
    const whereBase: Prisma.astrologersWhereInput = {
      ...(createdFilter ? { created_at: createdFilter } : {}),
    };

    const where: Prisma.astrologersWhereInput = q
      ? {
          ...whereBase,
          OR: [
            { name: like(q) },       // assumes `name` exists on astrologers
            { email: like(q) },      // assumes `email` exists
            { contactNo: like(q) },  // assumes `contactNo` exists
          ],
        }
      : whereBase;

    const [total, items] = await Promise.all([
      prisma.astrologers.count({ where }),
      prisma.astrologers.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          isVerified: true,
          chatStatus: true,
          callStatus: true,
          created_at: true,
        },
      }),
    ]);

    const safeItems = items.map((a) => ({
      id: typeof a.id === "bigint" ? Number(a.id) : a.id,
      name: a.name,
      email: a.email,
      phone: a.contactNo ?? null,
      isVerified: a.isVerified,
      chatStatus: a.chatStatus,
      callStatus: a.callStatus,
      created_at: a.created_at,
    }));

    return NextResponse.json(
      {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        items: safeItems,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("astrologers/list error", err);
    return NextResponse.json(
      { error: "Failed to fetch astrologers" },
      { status: 500 }
    );
  }
}
