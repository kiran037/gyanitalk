// app/api/astrologers/[id]/notifications/route.ts
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

    // Get astrologer.userId
    const astrologer = await prisma.astrologers.findUnique({
      where: { id: astrologerId },
      select: { userId: true },
    });

    if (!astrologer || !astrologer.userId) {
      return NextResponse.json(
        { success: false, error: "Astrologer not found" },
        { status: 404 }
      );
    }

    const where = {
      userId: astrologer.userId,
      isDelete: false,
    };

    const [notifications, total] = await Promise.all([
      prisma.user_notifications.findMany({
        where,
        skip,
        take: limit,
        include: {
          notification: {
            select: {
              id: true,
              title: true,
              description: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.user_notifications.count({ where }),
    ]);

    const unreadCount = await prisma.user_notifications.count({
      where: {
        userId: astrologer.userId,
        isDelete: false,
        is_read: false,
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: { unreadCount },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch notifications",
        message: error.message,
      },
      { status: 500 }
    );
  }
}