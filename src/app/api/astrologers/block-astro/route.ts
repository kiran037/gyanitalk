import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: convert BigInt / Decimal / Date → JSON-safe
function convertPrismaTypes(obj: unknown): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint") return obj.toString();
  if (typeof obj === "object" && (obj as any).constructor && (obj as any).constructor.name === "Decimal") {
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

// GET - List all blocked astrologers
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

    if (astrologerId) where.astrologerId = BigInt(astrologerId);
    if (userId) where.userId = BigInt(userId);

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate);
      if (endDate) where.created_at.lte = new Date(endDate);
    }

    // 1. Get raw block records
    const [rawBlocks, totalCount] = await Promise.all([
      prisma.blockastrologer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.blockastrologer.count({ where }),
    ]);

    // 2. Extract IDs
    const astroIds = new Set<string>();
    const userIds = new Set<string>();

    rawBlocks.forEach((b) => {
      if (b.astrologerId) astroIds.add(b.astrologerId.toString());
      if (b.userId) userIds.add(b.userId.toString());
    });

    // 3. Manual Fetch - ASTROLOGERS (With Image Fallback)
    const astroMap = new Map();
    if (astroIds.size > 0) {
      const astros = await prisma.astrologers.findMany({
        where: { id: { in: Array.from(astroIds).map(id => BigInt(id)) } },
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          profileImage: true,
          primarySkill: true,
          experienceInYears: true,
          charge: true,
          users: { select: { profile: true } } // Fallback image
        }
      });
      astros.forEach(a => {
        // Resolve image
        const img = a.profileImage || a.users?.profile || null;
        astroMap.set(a.id.toString(), { ...a, profileImage: img, users: undefined });
      });
    }

    // 4. Manual Fetch - USERS
    const userMap = new Map();
    if (userIds.size > 0) {
      const users = await prisma.users.findMany({
        where: { id: { in: Array.from(userIds).map(id => BigInt(id)) } },
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          profile: true,
        }
      });
      users.forEach(u => userMap.set(u.id.toString(), u));
    }

    // 5. Stitch Data
    let blockedAstrologers = rawBlocks.map(block => {
      const astroId = block.astrologerId?.toString();
      const uId = block.userId?.toString();

      return {
        ...block,
        astrologer: astroId ? astroMap.get(astroId) || { name: "Unknown", profileImage: null } : null,
        user: uId ? userMap.get(uId) || { name: "Unknown", profile: null } : null,
      };
    });

    // 6. Apply Search Filter (In Memory, since we constructed names manually)
    if (search) {
      const searchLower = search.toLowerCase();
      blockedAstrologers = blockedAstrologers.filter((block) => {
        return (
          block.astrologer?.name?.toLowerCase().includes(searchLower) ||
          block.user?.name?.toLowerCase().includes(searchLower) ||
          block.reason?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Recalculate total if searching
    const total = search ? blockedAstrologers.length : totalCount;

    const safeData = convertPrismaTypes({
      success: true,
      data: blockedAstrologers,
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
      { success: false, error: error.message || "Failed to fetch blocked astrologers" },
      { status: 500 }
    );
  }
}

// DELETE - Remove block
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get("id");

    if (!blockId) {
      return NextResponse.json({ success: false, error: "Block ID is required" }, { status: 400 });
    }

    const idNum = parseInt(blockId, 10);

    const existingBlock = await prisma.blockastrologer.findUnique({
      where: { id: idNum },
    });

    if (!existingBlock) {
      return NextResponse.json({ success: false, error: "Block record not found" }, { status: 404 });
    }

    await prisma.blockastrologer.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ success: true, message: "Astrologer unblocked successfully" });
  } catch (error: any) {
    console.error("Error unblocking astrologer:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to unblock astrologer" },
      { status: 500 }
    );
  }
}