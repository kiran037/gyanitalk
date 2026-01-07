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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const search = searchParams.get("search") || "";
    const groupId = searchParams.get("groupId");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!search) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Please provide a search query",
      });
    }

    // Base filter conditions
    const where: any = {
      isDelete: false,
      isActive: true,
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
        { contactNo: { contains: search } },
      ],
    };

    // If groupId is provided, exclude astrologers already in this group
    if (groupId) {
      try {
        const groupIdBigInt = BigInt(groupId);

        // 1. Get IDs of astrologers already in the group
        const astrologersInGroup = await prisma.astrologer_assign_group.findMany({
          where: { group_id: groupIdBigInt },
          select: { astrologerId: true },
        });

        const excludedIds = astrologersInGroup
          .map((a) => a.astrologerId)
          .filter((id) => id !== null);

        // 2. Add exclusion to the main query
        if (excludedIds.length > 0) {
          where.id = {
            notIn: excludedIds,
          };
        }
      } catch (e) {
        console.error("Invalid Group ID format", e);
        // Continue search without exclusion if ID is invalid
      }
    }

    // 3. Fetch astrologers with the exclusion applied at DB level
    const astrologers = await prisma.astrologers.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        profileImage: true,
        primarySkill: true,
        allSkill: true,
        experienceInYears: true,
        charge: true,
        isVerified: true,
      },
      take: limit,
    });

    const safe = convertPrismaTypes({
      success: true,
      data: astrologers,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error searching astrologers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to search astrologers",
        message: error.message,
      },
      { status: 500 }
    );
  }
}