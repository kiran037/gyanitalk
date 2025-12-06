// app/api/astrologers/[id]/gifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(convertPrismaTypes);
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    const astrologerId = BigInt(id);
    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    const where: any = {
      astrologerId,
      isDelete: false,
    };

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) where.created_at.gte = new Date(fromDate);
      if (toDate) where.created_at.lte = new Date(toDate);
    }

    const [gifts, total] = await Promise.all([
      prisma.astrologer_gifts.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
          gift: {
            select: {
              id: true,
              name: true,
              image: true,
              amount: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.astrologer_gifts.count({ where }),
    ]);

    const totalGiftAmount = await prisma.astrologer_gifts.aggregate({
      where: { astrologerId, isDelete: false },
      _sum: { giftAmount: true },
    });

    const giftStats = await prisma.astrologer_gifts.groupBy({
      by: ["giftId"],
      where: { astrologerId, isDelete: false },
      _count: { giftId: true },
      _sum: { giftAmount: true },
    });

    const safe = convertPrismaTypes({
      success: true,
      data: gifts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalGiftAmount: totalGiftAmount._sum.giftAmount || 0,
        totalGiftsReceived: total,
        giftBreakdown: giftStats,
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching gifts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gifts",
        message: error.message,
      },
      { status: 500 }
    );
  }
}