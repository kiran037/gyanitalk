// app/api/astrologers/block-astro/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe
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

// GET - Get statistics about blocked astrologers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total blocks
    const totalBlocks = await prisma.blockastrologer.count();

    // Recent blocks (within date range)
    const recentBlocks = await prisma.blockastrologer.count({
      where: {
        created_at: {
          gte: startDate,
        },
      },
    });

    // Most blocked astrologers
    const blockedAstrologersGrouped = await prisma.blockastrologer.groupBy({
      by: ["astrologerId"],
      _count: {
        astrologerId: true,
      },
      orderBy: {
        _count: {
          astrologerId: "desc",
        },
      },
      take: 10,
    });

    const mostBlockedAstrologers = await Promise.all(
      blockedAstrologersGrouped.map(async (group) => {
        const astrologer = await prisma.astrologers.findUnique({
          where: { id: group.astrologerId! },
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            primarySkill: true,
            experienceInYears: true,
          },
        });

        return {
          astrologer,
          blockCount: group._count.astrologerId,
        };
      })
    );

    // Users who blocked most astrologers
    const usersBlockingMost = await prisma.blockastrologer.groupBy({
      by: ["userId"],
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: "desc",
        },
      },
      take: 10,
    });

    const topBlockingUsers = await Promise.all(
      usersBlockingMost.map(async (group) => {
        const user = await prisma.users.findUnique({
          where: { id: group.userId! },
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        });

        return {
          user,
          blockCount: group._count.userId,
        };
      })
    );

    // Blocks over time (last X days)
    const blocksOverTime = await prisma.$queryRaw<
      Array<{ date: Date; count: bigint }>
    >`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM blockastrologer
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Common blocking reasons (word frequency analysis)
    const allBlocks = await prisma.blockastrologer.findMany({
      select: {
        reason: true,
      },
    });

    const reasonWords: Record<string, number> = {};
    allBlocks.forEach((block) => {
      if (block.reason) {
        const words = block.reason
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 3);
        words.forEach((word) => {
          reasonWords[word] = (reasonWords[word] || 0) + 1;
        });
      }
    });

    const topReasons = Object.entries(reasonWords)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    const safeData = convertPrismaTypes({
      success: true,
      data: {
        summary: {
          totalBlocks,
          recentBlocks,
          daysAnalyzed: days,
        },
        mostBlockedAstrologers,
        topBlockingUsers,
        blocksOverTime,
        topReasons,
      },
    });

    return NextResponse.json(safeData);
  } catch (error: any) {
    console.error("Error fetching block stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}