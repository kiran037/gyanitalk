// app/api/astrologers/block-astro/route.ts
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

// GET - List all blocked astrologers with filters, search, pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search") || "";
    const astrologerId = searchParams.get("astrologerId");
    const userId = searchParams.get("userId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    // Build where clause
    const where: any = {};

    if (astrologerId) {
      where.astrologerId = BigInt(astrologerId);
    }

    if (userId) {
      where.userId = BigInt(userId);
    }

    // Date range filter
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        where.created_at.lte = new Date(endDate);
      }
    }

    // Get total count
    const totalCount = await prisma.blockastrologer.count({ where });

    // Get blocked astrologers with relations
    const blockedAstrologers = await prisma.blockastrologer.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            email: true,
            contactNo: true,
            profileImage: true,
            primarySkill: true,
            experienceInYears: true,
            charge: true,
          },
        },
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
    });

    // Apply search filter if provided (search in astrologer/user name, reason)
    let filteredData = blockedAstrologers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = blockedAstrologers.filter((block) => {
        return (
          block.astrologer?.name?.toLowerCase().includes(searchLower) ||
          block.user?.name?.toLowerCase().includes(searchLower) ||
          block.reason?.toLowerCase().includes(searchLower)
        );
      });
    }

    const total = search ? filteredData.length : totalCount;
    const safeData = convertPrismaTypes({
      success: true,
      data: filteredData,
      pagination: {
        page,
        limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },
    });

    return NextResponse.json(safeData);
  } catch (error: any) {
    console.error("Error fetching blocked astrologers:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch blocked astrologers",
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove block (unblock astrologer for user)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get("id");

    if (!blockId) {
      return NextResponse.json(
        { success: false, error: "Block ID is required" },
        { status: 400 }
      );
    }

    const idNum = parseInt(blockId, 10);

    // Check if block exists
    const existingBlock = await prisma.blockastrologer.findUnique({
      where: { id: idNum },
    });

    if (!existingBlock) {
      return NextResponse.json(
        { success: false, error: "Block record not found" },
        { status: 404 }
      );
    }

    // Delete the block record
    await prisma.blockastrologer.delete({
      where: { id: idNum },
    });

    return NextResponse.json({
      success: true,
      message: "Astrologer unblocked successfully",
    });
  } catch (error: any) {
    console.error("Error unblocking astrologer:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to unblock astrologer",
      },
      { status: 500 }
    );
  }
}