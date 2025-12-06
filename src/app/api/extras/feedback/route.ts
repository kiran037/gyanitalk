// app/api/extras/feedback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: safely convert Prisma types (BigInt, Decimal, Date) → JSON-safe
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;

  // BigInt -> string
  if (typeof obj === "bigint") return obj.toString();

  // Prisma Decimal -> number
  if (
    typeof obj === "object" &&
    (obj as any).constructor &&
    (obj as any).constructor.name === "Decimal"
  ) {
    return Number((obj as any).toString());
  }

  // Date -> ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  // primitives
  if (typeof obj !== "object") return obj;

  // arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => convertPrismaTypes(item));
  }

  // plain objects
  const out: any = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[k] = convertPrismaTypes(v);
  }
  return out;
}

// GET all feedback with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const appId = searchParams.get("appId");

    const skip = (page - 1) * limit;

    const where: any = {
      isDelete: false,
    };

    if (isActive !== null && isActive !== undefined && isActive !== "") {
      // assuming app_reviews.isActive is boolean (or tinyint mapped to boolean)
      where.isActive = isActive === "true";
    }

    if (appId) {
      where.appId = parseInt(appId, 10);
    }

    if (search) {
      where.review = { contains: search };
    }

    const [feedbacks, total] = await Promise.all([
      prisma.app_reviews.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              contactNo: true,
              profile: true,
            },
          },
        },
      }),
      prisma.app_reviews.count({ where }),
    ]);

    // 🔐 Convert all BigInt / Decimal / Date fields
    const safeFeedbacks = convertPrismaTypes(feedbacks);

    return NextResponse.json({
      success: true,
      data: safeFeedbacks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching feedback list:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
