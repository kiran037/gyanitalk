// app/api/astrologers/[id]/followers/route.ts
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

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where = {
      astrologerId,
      isDelete: false,
      isActive: true,
    };

    const [followers, total] = await Promise.all([
      prisma.astrologer_followers.findMany({
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
              birthDate: true,
              location: true,
              created_at: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.astrologer_followers.count({ where }),
    ]);

    const safe = convertPrismaTypes({
      success: true,
      data: followers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch followers",
        message: error.message,
      },
      { status: 500 }
    );
  }
}