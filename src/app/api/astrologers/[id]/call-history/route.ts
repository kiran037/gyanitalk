// app/api/astrologers/[id]/call-history/route.ts
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

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    const astrologerId = BigInt(id);
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filters
    const callStatus = searchParams.get("callStatus");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const callType = searchParams.get("callType"); // 0 = audio, 1 = video

    const where: any = {
      astrologerId,
    };

    if (callStatus) {
      where.callStatus = callStatus;
    }

    if (callType !== null && callType !== undefined) {
      where.call_type = parseInt(callType, 10);
    }

    if (fromDate || toDate) {
      where.created_at = {};
      if (fromDate) {
        where.created_at.gte = new Date(fromDate);
      }
      if (toDate) {
        where.created_at.lte = new Date(toDate);
      }
    }

    const [callHistory, total] = await Promise.all([
      prisma.callrequest.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
              profile: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.callrequest.count({ where }),
    ]);

    const totalEarnings = await prisma.callrequest.aggregate({
      where: { astrologerId },
      _sum: {
        deductionFromAstrologer: true,
      },
    });

    const callsWithAudio = await Promise.all(
      callHistory.map(async (call) => {
        const audio = await prisma.callaudio.findFirst({
          where: { callId: call.id },
          select: {
            file: true,
            channelName: true,
          },
        });
        return {
          ...call,
          audioFile: audio?.file || null,
        };
      })
    );

    const safe = convertPrismaTypes({
      success: true,
      data: callsWithAudio,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalEarnings: totalEarnings._sum.deductionFromAstrologer || 0,
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching call history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch call history",
        message: error.message,
      },
      { status: 500 }
    );
  }
}