// app/api/astrologers/[id]/gallery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// JSON-safe converter
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

// GET – list gallery items
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    // gallery.astrologerId is an Int → use number
    const astrologerId = parseInt(id, 10);
    if (Number.isNaN(astrologerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid astrologer ID" },
        { status: 400 }
      );
    }

    const searchParams = req.nextUrl.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where = {
      astrologerId,
      status: 1, // active
    };

    const [gallery, total] = await Promise.all([
      prisma.astrologers_gallery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.astrologers_gallery.count({ where }),
    ]);

    const safe = convertPrismaTypes({
      success: true,
      data: gallery,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching gallery:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gallery",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST – add gallery item
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Astrologer ID is required" },
        { status: 400 }
      );
    }

    // astrologers_gallery.astrologerId is Int
    const astrologerId = parseInt(id, 10);
    if (Number.isNaN(astrologerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid astrologer ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { image, userId, createdBy, modifiedBy } = body;

    if (!image || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Image and userId are required",
        },
        { status: 400 }
      );
    }

    const userIdNum =
      typeof userId === "string" ? parseInt(userId, 10) : Number(userId);

    if (Number.isNaN(userIdNum)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 }
      );
    }

    const createdByNum =
      createdBy !== undefined
        ? typeof createdBy === "string"
          ? parseInt(createdBy, 10)
          : Number(createdBy)
        : userIdNum;

    const modifiedByNum =
      modifiedBy !== undefined
        ? typeof modifiedBy === "string"
          ? parseInt(modifiedBy, 10)
          : Number(modifiedBy)
        : userIdNum;

    const newGalleryItem = await prisma.astrologers_gallery.create({
      data: {
        astrologerId,
        userId: userIdNum,
        image,
        status: 1,
        createdBy: createdByNum,
        modifiedBy: modifiedByNum,
      },
    });

    const safe = convertPrismaTypes({
      success: true,
      message: "Gallery item added successfully",
      data: newGalleryItem,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error adding gallery item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add gallery item",
        message: error.message,
      },
      { status: 500 }
    );
  }
}