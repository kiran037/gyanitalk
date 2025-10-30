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

    const whereBase: Prisma.astrologersWhereInput = { isVerified: false };

    const where: Prisma.astrologersWhereInput = q
      ? {
          ...whereBase,
          OR: [
            { name: like(q) },
            { email: like(q) },
            { contactNo: like(q) },
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
    console.error("astrologers/unverified error", err);
    return NextResponse.json(
      { error: "Failed to fetch unverified astrologers" },
      { status: 500 }
    );
  }
}
