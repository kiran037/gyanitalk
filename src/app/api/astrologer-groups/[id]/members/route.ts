import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: BigInt / Decimal / Date → JSON-safe
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

// GET - Get Group Members (Fixed with Manual Join)
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Group ID is required" },
        { status: 400 }
      );
    }

    const groupId = BigInt(id);
    const searchParams = req.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const where = {
      group_id: groupId,
    };

    // 1. Fetch assignments first (without include to avoid relation issues)
    const [assignments, total] = await Promise.all([
      prisma.astrologer_assign_group.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.astrologer_assign_group.count({ where }),
    ]);

    // 2. Extract valid Astrologer IDs
    const astrologerIds = assignments
      .map((a) => a.astrologerId)
      .filter((id) => id !== null) as bigint[];

    // 3. Manually fetch the astrologer details
    // This bypasses relation issues by directly querying the astrologers table
    let astrologersMap = new Map();
    
    if (astrologerIds.length > 0) {
      const astrologersList = await prisma.astrologers.findMany({
        where: {
          id: { in: astrologerIds },
        },
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          profileImage: true,
          primarySkill: true,
          allSkill: true,
          languageKnown: true,
          experienceInYears: true,
          charge: true,
          videoCallRate: true,
          isVerified: true,
          isActive: true,
          chatStatus: true,
          callStatus: true,
          created_at: true,
        },
      });

      // Create a map for easy lookup: ID -> Astrologer Object
      astrologersList.forEach((astro) => {
        astrologersMap.set(astro.id.toString(), astro);
      });
    }

    // 4. Merge the data back together
    const members = assignments.map((assign) => {
      const astroId = assign.astrologerId?.toString();
      const astrologerData = astroId ? astrologersMap.get(astroId) : null;

      return {
        ...assign,
        astrologer: astrologerData || null, // Matches the structure the frontend expects
      };
    });

    const safe = convertPrismaTypes({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error fetching group members:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch group members",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Add Astrologers to Group
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Group ID is required" },
        { status: 400 }
      );
    }

    const groupId = BigInt(id);
    const body = await req.json();
    const { astrologerIds } = body; 

    if (!astrologerIds || !Array.isArray(astrologerIds) || astrologerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "astrologerIds array is required" },
        { status: 400 }
      );
    }

    // Check if group exists
    const group = await prisma.astrologer_groups.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ success: false, error: "Group not found" }, { status: 404 });
    }

    // Check existing assignments
    const existingAssignments = await prisma.astrologer_assign_group.findMany({
      where: {
        group_id: groupId,
        astrologerId: {
          in: astrologerIds.map((id: string | number) => BigInt(id)),
        },
      },
    });

    const existingAstrologerIds = existingAssignments
      .map((a) => a.astrologerId?.toString())
      .filter(Boolean) as string[];

    const newAstrologerIds = astrologerIds.filter(
      (id: string | number) => !existingAstrologerIds.includes(id.toString())
    );

    if (newAstrologerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "All selected astrologers are already in this group" },
        { status: 400 }
      );
    }

    // Add astrologers
    const assignments = await Promise.all(
      newAstrologerIds.map((astrologerId: string | number) =>
        prisma.astrologer_assign_group.create({
          data: {
            group_id: groupId,
            astrologerId: BigInt(astrologerId),
          },
        })
      )
    );

    const safe = convertPrismaTypes({
      success: true,
      message: `${assignments.length} astrologer(s) added to group successfully`,
      data: assignments,
    });

    return NextResponse.json(safe);
  } catch (error: any) {
    console.error("Error adding astrologers to group:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add astrologers to group",
        message: error.message,
      },
      { status: 500 }
    );
  }
}